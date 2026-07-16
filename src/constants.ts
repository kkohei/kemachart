import type { DamageLevel } from "./types";

/** ダメージレベルの定義 (美容師が来店時に測定・記録するための目安) */
export interface DamageLevelDef {
  level: DamageLevel;
  label: string;
  short: string;
  description: string;
  /** バッジ表示色 */
  color: string;
}

export const DAMAGE_LEVELS: DamageLevelDef[] = [
  {
    level: 1,
    label: "Lv.1 健康毛",
    short: "健康毛",
    description: "ダメージほぼなし。ハリ・コシ・ツヤがあり、手触りがなめらか。",
    color: "#4c9a76",
  },
  {
    level: 2,
    label: "Lv.2 軽度",
    short: "軽度",
    description: "毛先に軽い引っかかり。カラー・パーマ1回程度の履歴。",
    color: "#7bb662",
  },
  {
    level: 3,
    label: "Lv.3 中度",
    short: "中度",
    description: "中間〜毛先が乾燥・ザラつき。カラー/ブリーチや繰り返しの履歴あり。",
    color: "#e0a63c",
  },
  {
    level: 4,
    label: "Lv.4 重度",
    short: "重度",
    description: "全体的に多孔質でパサつき。ブリーチ複数回、絡まりやすい。",
    color: "#dd7f3e",
  },
  {
    level: 5,
    label: "Lv.5 極度",
    short: "極度",
    description: "ハイダメージ。濡らすと伸びる/切れる、ビビり毛の兆候あり。",
    color: "#cf5757",
  },
];

export function damageDef(level: DamageLevel): DamageLevelDef {
  return DAMAGE_LEVELS.find((d) => d.level === level) ?? DAMAGE_LEVELS[0];
}

/** メニュー候補 (自由入力も可) */
export const MENU_PRESETS: string[] = [
  "KEMAトリートメント",
  "KEMAカラー",
  "KEMAストレート",
  "KEMAパーマ",
  "KEMA×カット",
  "その他",
];

/** レシピ工程名の候補 */
export const STEP_NAME_PRESETS: string[] = [
  "前処理",
  "1剤",
  "2剤",
  "中間水洗",
  "トリートメント",
  "後処理",
];
