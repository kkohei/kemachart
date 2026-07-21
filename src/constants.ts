import type { DamageLevel, HeadAreaKey } from "./types";

/**
 * ダメージレベルの定義 (KEMAダメージチャートに準拠)。
 * 色はチャートと同じく「健康毛=暗色 → ダメージ毛=淡色」のグラデーション。
 */
export interface DamageLevelDef {
  level: DamageLevel;
  label: string;
  short: string;
  /** 状態の目安 */
  description: string;
  /** 想定される施術履歴 */
  history: string;
  /** ダイアグラム/バッジの塗り色 */
  color: string;
  /** 上に載せる文字色 */
  text: string;
}

export const DAMAGE_LEVELS: DamageLevelDef[] = [
  {
    level: 1,
    label: "Damage Lv.1",
    short: "Lv.1",
    description: "ブラッシングがよくできて、やや乾燥した毛髪。",
    history: "カラーリング及び一般パーマ 各0〜2回",
    color: "#2d2823",
    text: "#ffffff",
  },
  {
    level: 2,
    label: "Damage Lv.2",
    short: "Lv.2",
    description: "髪をとかす時、ちょぼちょぼとひっかかる。",
    history: "カラーリング+一般パーマ1〜2回、または熱パーマ1回",
    color: "#4f3626",
    text: "#ffffff",
  },
  {
    level: 3,
    label: "Damage Lv.3",
    short: "Lv.3",
    description: "ブラッシングの際、髪がもつれやすい。",
    history: "カラーリング+一般パーマ3回",
    color: "#9a7649",
    text: "#ffffff",
  },
  {
    level: 4,
    label: "Damage Lv.4",
    short: "Lv.4",
    description: "ブラッシング時に切れやすい／シャンプー中に切れやすい髪質。",
    history: "ブリーチ1回、またはカラーリング+パーマ3回",
    color: "#ddce93",
    text: "#4a4020",
  },
  {
    level: 5,
    label: "Damage Lv.5",
    short: "Lv.5",
    description: "ブラッシング時・シャンプー中に切れやすい、ハイダメージの髪質。",
    history: "ブリーチ2回以上、またはブリーチ1回+軟化パーマ1回",
    color: "#e6e1d4",
    text: "#5a5445",
  },
];

export function damageDef(level: DamageLevel): DamageLevelDef {
  return DAMAGE_LEVELS.find((d) => d.level === level) ?? DAMAGE_LEVELS[0];
}

/** 頭部セクションの定義 (根元→毛先の5段階) */
export interface SectionDef {
  index: number;
  label: string;
  short: string;
}

export const SECTIONS: SectionDef[] = [
  { index: 0, label: "根元", short: "根元" },
  { index: 1, label: "根元〜中間", short: "上部" },
  { index: 2, label: "中間", short: "中間" },
  { index: 3, label: "中間〜毛先", short: "下部" },
  { index: 4, label: "毛先", short: "毛先" },
];

/** 頭部の部位の定義 */
export interface HeadAreaDef {
  key: HeadAreaKey;
  label: string;
  short: string;
}

/** 後ろ(バック) — 原則こちらのみ測定 */
export const AREA_BACK: HeadAreaDef = { key: "back", label: "後ろ (バック)", short: "後ろ" };

/** 任意で追加できる部位 */
export const EXTRA_AREAS: HeadAreaDef[] = [
  { key: "leftSide", label: "左サイド", short: "左" },
  { key: "rightSide", label: "右サイド", short: "右" },
  { key: "frontTop", label: "前髪〜トップ", short: "前" },
];

const ALL_AREAS: HeadAreaDef[] = [AREA_BACK, ...EXTRA_AREAS];

export function areaDef(key: HeadAreaKey): HeadAreaDef {
  return ALL_AREAS.find((a) => a.key === key) ?? AREA_BACK;
}

/** メニュー候補 (自由入力も可)。先頭3つは湿熱システムマニュアルの標準メニュー */
export const MENU_PRESETS: string[] = [
  "KEMAブリーチ",
  "KEMAクリニック",
  "KEMA根元ボリューム",
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
