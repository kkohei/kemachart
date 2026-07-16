import type { DamageLevel, DamageProfile } from "../types";

/** 既定のプロファイル (根元は健康・毛先ほどダメージという典型例) */
export function defaultProfile(): DamageProfile {
  return [1, 2, 3, 4, 5];
}

/** すべて同一レベルのプロファイル */
export function uniformProfile(level: DamageLevel): DamageProfile {
  return [level, level, level, level, level];
}

/** 根元→毛先を「1-2-3-4-5」形式のダメージコードに */
export function damageCode(p: DamageProfile): string {
  return p.join("-");
}

/** 最もダメージの大きいセクションのレベル */
export function maxDamage(p: DamageProfile): DamageLevel {
  return Math.max(...p) as DamageLevel;
}

/** 平均ダメージ (小数第1位) */
export function avgDamage(p: DamageProfile): number {
  return Math.round((p.reduce((a, b) => a + b, 0) / p.length) * 10) / 10;
}

/** 5の5乗通りのうち何番目のパターンか (1始まり) */
export function patternIndex(p: DamageProfile): number {
  return p.reduce((acc, lv) => acc * 5 + (lv - 1), 0) + 1;
}

/** 総パターン数 (5^5) */
export const TOTAL_PATTERNS = 5 ** 5;

/** 不正な値を含む配列を安全なプロファイルに正規化 */
export function normalizeProfile(input: unknown): DamageProfile {
  const clamp = (v: unknown): DamageLevel => {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n)) return 1;
    return Math.min(5, Math.max(1, n)) as DamageLevel;
  };
  // 旧形式 (単一の数値) からの移行
  if (typeof input === "number") return uniformProfile(clamp(input));
  if (Array.isArray(input)) {
    const arr = [0, 1, 2, 3, 4].map((i) => clamp(input[i] ?? input[input.length - 1] ?? 1));
    return arr as DamageProfile;
  }
  return defaultProfile();
}
