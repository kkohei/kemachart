import type { ApplyAmount, DamageLevel, HeadAreaKey, RecipePart, RecipeStep } from "./types";

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

/** レシピの大枠パート (3つ) */
export const RECIPE_PARTS: { key: RecipePart; label: string; short: string }[] = [
  { key: "clinic", label: "クリニックパート", short: "クリニック" },
  { key: "design", label: "デザインパート", short: "デザイン" },
  { key: "care", label: "ケアパート", short: "ケア" },
];

export function recipePartOf(s: RecipeStep): RecipePart {
  return s.part ?? "clinic";
}

/** 工程を大枠パートごとにまとめる (空パートは除外, パート順は固定) */
export function groupRecipe(
  steps: RecipeStep[],
): { key: RecipePart; label: string; short: string; steps: RecipeStep[] }[] {
  return RECIPE_PARTS.map((p) => ({
    ...p,
    steps: steps.filter((s) => recipePartOf(s) === p.key),
  })).filter((g) => g.steps.length > 0);
}

/** レシピ工程名の候補 (パート別・プルダウン用) */
export const STEP_PRESETS_BY_PART: Record<RecipePart, string[]> = {
  clinic: [
    "プレシャンプー",
    "サブシャンプー",
    "サブベース",
    "EQ塗布",
    "ANTA塗布",
    "ANTA3塗布",
  ],
  design: [
    "Lv.1 薬剤塗布",
    "Lv.2 薬剤塗布",
    "Lv.3 薬剤塗布",
    "Lv.4 薬剤塗布",
    "Lv.5 薬剤塗布",
    "カラー剤塗布",
    "2剤塗布",
    "EQ塗布",
    "DBSTスライド",
    "STCをトゥム＋スライド",
  ],
  care: [
    "ケマチン塗布",
    "クレマトリートメントブラック塗布",
    "ボンドバーム塗布",
    "DBSTで仕上げ",
  ],
};

/** 全パートの候補をまとめたリスト (判定用) */
export const STEP_NAME_PRESETS: string[] = Array.from(
  new Set(Object.values(STEP_PRESETS_BY_PART).flat()),
);

/** ダメージレベル別「薬剤塗布」工程名 (配合エディタを表示する対象) */
export const DAMAGE_MIX_STEP_NAMES: string[] = [1, 2, 3, 4, 5].map((lv) => `Lv.${lv} 薬剤塗布`);

/** その工程が「薬剤配合」を持つ工程か */
export function isMixStep(name: string): boolean {
  return DAMAGE_MIX_STEP_NAMES.includes(name);
}

/** 配合に使える薬剤 */
export const MIX_CHEMICALS: string[] = ["EZ100", "AR50", "アフリー", "ANTA3", "ANTA"];

/** 塗布量の選択肢 (少/中/大) */
export const APPLY_AMOUNTS: ApplyAmount[] = ["少", "中", "大"];

/** 配合を「EZ100 50% ・ ANTA3 30%」形式の文字列に */
export function formatMix(mix: { chem: string; percent: number }[] | undefined): string {
  if (!mix || mix.length === 0) return "";
  return mix.map((m) => `${m.chem} ${m.percent}%`).join(" ・ ");
}
