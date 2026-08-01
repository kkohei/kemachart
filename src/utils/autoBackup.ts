import { Capacitor } from "@capacitor/core";
import type { TreatmentRecord } from "../types";
import { buildBackup, parseBackup } from "../storage";

/**
 * 自動バックアップ (iOSネイティブのみ)。
 *
 * 記録が変わるたびに、アプリの「書類 (Documents)」フォルダへバックアップJSONを
 * 書き出します。書類フォルダは iOS の「iCloudバックアップ」の対象なので、
 * 機種変更や端末復元のときに記録ごと戻せます。
 * また「ファイル」アプリからも見えるため、iCloud Drive へ手動コピーもできます。
 *
 * - 最新版: バックアップ/自動バックアップ-最新.json (常に上書き)
 * - 日付別: バックアップ/自動バックアップ-YYYY-MM-DD.json (直近7日分を保持)
 */

const DIR = "バックアップ";
const LATEST_PATH = `${DIR}/自動バックアップ-最新.json`;
const DATED_RE = /^自動バックアップ-(\d{4}-\d{2}-\d{2})\.json$/;
const KEEP_DAYS = 7;
const LAST_KEY = "kemachart.lastAutoBackup";

let timer: number | undefined;

/** 記録の変更後に呼ぶ。連続保存をまとめるため数秒待ってから書き出す。 */
export function scheduleAutoBackup(records: TreatmentRecord[]): void {
  if (!Capacitor.isNativePlatform()) return;
  // 全削除直後などに空のバックアップで上書きしない
  if (records.length === 0) return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    void writeAutoBackup(records);
  }, 4000);
}

async function writeAutoBackup(records: TreatmentRecord[]): Promise<void> {
  try {
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
    const data = JSON.stringify(buildBackup(records));
    const stamp = new Date().toISOString().slice(0, 10);
    const common = { directory: Directory.Documents, data, encoding: Encoding.UTF8, recursive: true } as const;
    await Filesystem.writeFile({ path: LATEST_PATH, ...common });
    await Filesystem.writeFile({ path: `${DIR}/自動バックアップ-${stamp}.json`, ...common });
    await pruneOldBackups();
    localStorage.setItem(LAST_KEY, String(Date.now()));
  } catch {
    // 自動バックアップの失敗でアプリの動作は止めない
  }
}

/** 日付別バックアップを直近 KEEP_DAYS 分だけ残して削除 */
async function pruneOldBackups(): Promise<void> {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const listing = await Filesystem.readdir({ path: DIR, directory: Directory.Documents });
  const dated = listing.files
    .map((f) => f.name)
    .filter((name) => DATED_RE.test(name))
    .sort()
    .reverse();
  for (const name of dated.slice(KEEP_DAYS)) {
    await Filesystem.deleteFile({ path: `${DIR}/${name}`, directory: Directory.Documents });
  }
}

export interface AutoBackupData {
  records: TreatmentRecord[];
  exportedAt: number;
}

/** 最新の自動バックアップを読み込む。まだ無ければ null。 */
export async function readAutoBackup(): Promise<AutoBackupData | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
    const res = await Filesystem.readFile({
      path: LATEST_PATH,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    const text = typeof res.data === "string" ? res.data : "";
    const records = parseBackup(text);
    const exportedAt = (JSON.parse(text) as { exportedAt?: number }).exportedAt ?? 0;
    return { records, exportedAt };
  } catch {
    return null;
  }
}

/** 最後に自動バックアップした時刻 (ms)。まだ無ければ null。 */
export function lastAutoBackupAt(): number | null {
  const raw = localStorage.getItem(LAST_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}
