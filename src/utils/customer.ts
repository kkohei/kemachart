import type { TreatmentRecord } from "../types";
import { avgDamage, maxDamage } from "./damage";

/** お客様名の正規化 (前後空白を除去) */
export function normalizeName(s: string): string {
  return s.trim();
}

export interface CustomerGroup {
  name: string;
  records: TreatmentRecord[];
  /** 最新の来店日 (YYYY-MM-DD) */
  lastVisit: string;
}

function byDateDesc(a: TreatmentRecord, b: TreatmentRecord): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return b.createdAt - a.createdAt;
}

/** 記録をお客様ごとにグループ化 (名前未設定は除外)。最終来店が新しい順に並べる。 */
export function groupByCustomer(records: TreatmentRecord[]): CustomerGroup[] {
  const map = new Map<string, TreatmentRecord[]>();
  for (const r of records) {
    const name = normalizeName(r.customerName);
    if (!name) continue;
    const arr = map.get(name) ?? [];
    arr.push(r);
    map.set(name, arr);
  }
  const groups: CustomerGroup[] = [...map.entries()].map(([name, recs]) => {
    const sorted = recs.slice().sort(byDateDesc);
    return { name, records: sorted, lastVisit: sorted[0]?.date ?? "" };
  });
  groups.sort((a, b) => (a.lastVisit < b.lastVisit ? 1 : a.lastVisit > b.lastVisit ? -1 : 0));
  return groups;
}

/** 指定のお客様の記録のみ取得 (時系列: 古い→新しい) */
export function recordsForCustomer(records: TreatmentRecord[], name: string): TreatmentRecord[] {
  const target = normalizeName(name);
  return records
    .filter((r) => normalizeName(r.customerName) === target)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt));
}

/** ダメージ推移の1点 (来店時=施術前の後ろ(バック)の状態を採用) */
export interface ProgressionPoint {
  date: string;
  avg: number;
  max: number;
}

export function progression(records: TreatmentRecord[]): ProgressionPoint[] {
  return records.map((r) => ({
    date: r.date,
    avg: avgDamage(r.damageBefore),
    max: maxDamage(r.damageBefore),
  }));
}
