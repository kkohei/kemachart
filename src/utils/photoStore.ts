import { Capacitor } from "@capacitor/core";
import type { TreatmentRecord } from "../types";
import { uid } from "./id";

/**
 * 写真ストア — 写真の実データを localStorage の外に保存します。
 *
 * localStorage は iOS の WKWebView では約5MBしか使えず、写真を直接入れると
 * 2〜3記録で上限に達してしまう。そこで:
 *
 *  - 記録 (localStorage) には `kphoto:<id>.<ext>` という参照文字列だけを保存
 *  - 写真の実データは
 *      - iOSネイティブ: Library/photos/ 配下のファイル (容量は実質無制限。
 *        Library は iCloudバックアップの対象・ファイルAppには表示されない)
 *      - Web: IndexedDB (数百MBまで保存可能)
 *
 * これで300記録 (写真 各10枚+5枚) でも localStorage は約1MBに収まります。
 * 旧形式 (dataURL埋め込み) は migratePhotos() で起動時に自動移行します。
 */

const REF_PREFIX = "kphoto:";
const NATIVE_DIR = "photos";
const IDB_NAME = "kemachart-photos";
const IDB_STORE = "photos";

export function isPhotoRef(s: string | undefined | null): s is string {
  return typeof s === "string" && s.startsWith(REF_PREFIX);
}

function isDataURL(s: string | undefined | null): s is string {
  return typeof s === "string" && s.startsWith("data:");
}

/** 参照 → ネイティブ保存パス (Library/photos/<id>.<ext>) */
function refToPath(ref: string): string {
  return `${NATIVE_DIR}/${ref.slice(REF_PREFIX.length)}`;
}

function mimeToExt(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}

function extToMime(ref: string): string {
  if (ref.endsWith(".png")) return "image/png";
  if (ref.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/** dataURL を mime と base64 本体に分解 */
function splitDataURL(dataUrl: string): { mime: string; base64: string } | null {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;
  const head = dataUrl.slice(0, comma);
  if (!head.includes(";base64")) return null;
  const mime = head.slice(5, head.indexOf(";")) || "image/jpeg";
  return { mime, base64: dataUrl.slice(comma + 1) };
}

// ---- 表示用キャッシュ (直近の写真だけメモリに保持し、使いすぎない) ----

const CACHE_MAX = 40;
const cache = new Map<string, string>();

function cacheGet(ref: string): string | undefined {
  const hit = cache.get(ref);
  if (hit) {
    // 触ったものを末尾へ (LRU)
    cache.delete(ref);
    cache.set(ref, hit);
  }
  return hit;
}

function cachePut(ref: string, dataUrl: string): void {
  cache.delete(ref);
  cache.set(ref, dataUrl);
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

// ---- Web用 IndexedDB ----

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) {
          req.result.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error("IndexedDBを開けませんでした"));
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB操作に失敗しました"));
  });
}

async function idbPut(ref: string, dataUrl: string): Promise<void> {
  const db = await openDb();
  await idbRequest(db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).put(dataUrl, ref));
}

async function idbGet(ref: string): Promise<string | null> {
  const db = await openDb();
  const v = await idbRequest(db.transaction(IDB_STORE).objectStore(IDB_STORE).get(ref));
  return typeof v === "string" ? v : null;
}

async function idbDelete(ref: string): Promise<void> {
  const db = await openDb();
  await idbRequest(db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).delete(ref));
}

async function idbKeys(): Promise<string[]> {
  const db = await openDb();
  const keys = await idbRequest(db.transaction(IDB_STORE).objectStore(IDB_STORE).getAllKeys());
  return keys.filter((k): k is string => typeof k === "string");
}

// ---- 保存・読み込み・削除 ----

/**
 * 写真 (dataURL) をストアへ保存し、参照文字列を返します。
 * すでに参照ならそのまま返します。
 */
export async function savePhoto(src: string): Promise<string> {
  if (isPhotoRef(src)) return src;
  const parts = splitDataURL(src);
  if (!parts) return src; // 不明な形式はそのまま (安全側)
  const ref = `${REF_PREFIX}${uid()}.${mimeToExt(parts.mime)}`;
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    // encoding未指定 = base64をバイナリとして書き込み (容量が2/3で済む)
    await Filesystem.writeFile({
      path: refToPath(ref),
      directory: Directory.Library,
      data: parts.base64,
      recursive: true,
    });
  } else {
    await idbPut(ref, src);
  }
  cachePut(ref, src);
  return ref;
}

/**
 * 参照または dataURL から表示用の dataURL を返します。
 * dataURL はそのまま返す (旧データ互換)。見つからなければ null。
 */
export async function loadPhoto(src: string | undefined | null): Promise<string | null> {
  if (!src) return null;
  if (!isPhotoRef(src)) return src;
  const hit = cacheGet(src);
  if (hit) return hit;
  try {
    let dataUrl: string | null;
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const res = await Filesystem.readFile({ path: refToPath(src), directory: Directory.Library });
      dataUrl = typeof res.data === "string" ? `data:${extToMime(src)};base64,${res.data}` : null;
    } else {
      dataUrl = await idbGet(src);
    }
    if (dataUrl) cachePut(src, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

export async function deletePhoto(ref: string): Promise<void> {
  if (!isPhotoRef(ref)) return;
  cache.delete(ref);
  try {
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      await Filesystem.deleteFile({ path: refToPath(ref), directory: Directory.Library });
    } else {
      await idbDelete(ref);
    }
  } catch {
    // 既に無い場合などは無視
  }
}

/** ストア内の全参照を列挙 */
async function listStoredRefs(): Promise<string[]> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      // 初回起動時はフォルダ未作成で readdir がエラーログを出すため、先に作っておく
      await Filesystem.mkdir({
        path: NATIVE_DIR,
        directory: Directory.Library,
        recursive: true,
      }).catch(() => {});
      const res = await Filesystem.readdir({ path: NATIVE_DIR, directory: Directory.Library });
      return res.files.map((f) => `${REF_PREFIX}${f.name}`);
    }
    return await idbKeys();
  } catch {
    return [];
  }
}

// ---- 記録との相互変換 ----

/** 記録配列が参照している全写真参照を集める */
export function photoRefsOf(records: TreatmentRecord[]): Set<string> {
  const refs = new Set<string>();
  for (const r of records) {
    for (const p of r.beforePhotos) if (isPhotoRef(p)) refs.add(p);
    for (const p of r.afterPhotos) if (isPhotoRef(p)) refs.add(p);
    for (const p of r.extraPhotos ?? []) if (isPhotoRef(p.photo)) refs.add(p.photo);
  }
  return refs;
}

/** 記録内の dataURL 写真をストアへ移して参照に置き換える (取り込み・保存時) */
export async function internRecordPhotos(rec: TreatmentRecord): Promise<TreatmentRecord> {
  const hasEmbedded =
    rec.beforePhotos.some(isDataURL) ||
    rec.afterPhotos.some(isDataURL) ||
    (rec.extraPhotos ?? []).some((p) => isDataURL(p.photo));
  if (!hasEmbedded) return rec;
  const beforePhotos: string[] = [];
  for (const p of rec.beforePhotos) beforePhotos.push(await savePhoto(p));
  const afterPhotos: string[] = [];
  for (const p of rec.afterPhotos) afterPhotos.push(await savePhoto(p));
  const extraPhotos = rec.extraPhotos
    ? await Promise.all(
        rec.extraPhotos.map(async (p) => ({ ...p, photo: await savePhoto(p.photo) })),
      )
    : undefined;
  return { ...rec, beforePhotos, afterPhotos, extraPhotos };
}

/** 記録内の参照を dataURL に展開する (エクスポート時)。見つからない写真は除外。 */
export async function resolveRecordPhotos(rec: TreatmentRecord): Promise<TreatmentRecord> {
  const before = await Promise.all(rec.beforePhotos.map((p) => loadPhoto(p)));
  const after = await Promise.all(rec.afterPhotos.map((p) => loadPhoto(p)));
  const extras = rec.extraPhotos
    ? await Promise.all(
        rec.extraPhotos.map(async (p) => {
          const photo = await loadPhoto(p.photo);
          return photo ? { ...p, photo } : null;
        }),
      )
    : undefined;
  return {
    ...rec,
    beforePhotos: before.filter((p): p is string => !!p),
    afterPhotos: after.filter((p): p is string => !!p),
    extraPhotos: extras?.filter((p): p is NonNullable<typeof p> => !!p),
  };
}

/**
 * 旧形式 (dataURL埋め込み) の記録を新形式 (参照) へ移行します。
 * 変更があった場合のみ records を返します (なければ null)。
 */
export async function migratePhotos(
  records: TreatmentRecord[],
): Promise<TreatmentRecord[] | null> {
  let changed = false;
  const out: TreatmentRecord[] = [];
  for (const rec of records) {
    const next = await internRecordPhotos(rec);
    if (next !== rec) changed = true;
    out.push(next);
  }
  return changed ? out : null;
}

/** どの記録からも参照されていない写真ファイルを削除 (起動時の掃除) */
export async function cleanupOrphanPhotos(records: TreatmentRecord[]): Promise<void> {
  try {
    const used = photoRefsOf(records);
    const stored = await listStoredRefs();
    for (const ref of stored) {
      if (!used.has(ref)) await deletePhoto(ref);
    }
  } catch {
    // 掃除の失敗は無視
  }
}
