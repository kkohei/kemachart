import type { BackupPayload, TreatmentRecord } from "./types";
import { normalizeProfile } from "./utils/damage";

const KEY = "kemachart.records.v1";

/** 旧形式 (単一レベル) を含む記録を現行のプロファイル形式へ正規化 */
function migrate(rec: TreatmentRecord): TreatmentRecord {
  return {
    ...rec,
    damageBefore: normalizeProfile(rec.damageBefore),
    damageAfter: rec.damageAfter == null ? undefined : normalizeProfile(rec.damageAfter),
  };
}

/** localStorage から全記録を読み込み (新しい順) */
export function loadRecords(): TreatmentRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as TreatmentRecord[];
    if (!Array.isArray(data)) return [];
    return data.map(migrate).sort(sortByDateDesc);
  } catch {
    return [];
  }
}

/** 全記録を保存 */
export function saveRecords(records: TreatmentRecord[]): void {
  localStorage.setItem(KEY, JSON.stringify(records));
}

function sortByDateDesc(a: TreatmentRecord, b: TreatmentRecord): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return b.createdAt - a.createdAt;
}

/** バックアップ (エクスポート) 用のペイロードを生成 */
export function buildBackup(records: TreatmentRecord[]): BackupPayload {
  return {
    app: "kemachart",
    version: 2,
    exportedAt: Date.now(),
    records,
  };
}

/** インポートしたJSONを検証してレコード配列を返す */
export function parseBackup(json: string): TreatmentRecord[] {
  const data = JSON.parse(json) as Partial<BackupPayload>;
  if (data?.app !== "kemachart" || !Array.isArray(data.records)) {
    throw new Error("KEMA Chart のバックアップファイルではありません");
  }
  return (data.records as TreatmentRecord[]).map(migrate);
}
