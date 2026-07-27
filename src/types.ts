// KEMA施術記録のデータモデル

/** ダメージレベル (1: 最も健康 〜 5: 最もダメージ) */
export type DamageLevel = 1 | 2 | 3 | 4 | 5;

/**
 * ダメージプロファイル。
 * 頭部を根元(先頭)から毛先(末尾)まで5セクションに分け、
 * 各セクションのダメージレベルを記録します。
 * 5セクション × 5段階 = 5の5乗 (3125) 通りにお客様を分類できます。
 * 例: [1, 2, 3, 4, 5] = 根元は健康、毛先ほどダメージ
 */
export type DamageProfile = [DamageLevel, DamageLevel, DamageLevel, DamageLevel, DamageLevel];

/** 頭部の部位 (原則は後ろ=back のみ。必要に応じて他部位を追加) */
export type HeadAreaKey = "back" | "leftSide" | "rightSide" | "frontTop";

/** 部位ごとのダメージ測定 (施術前/後) */
export interface AreaMeasurement {
  area: HeadAreaKey;
  before: DamageProfile;
  after?: DamageProfile;
}

/** レシピの大枠パート */
export type RecipePart = "clinic" | "design" | "care";

/** 薬剤の配合 (1種類ぶん)。比率は% */
export interface MixItem {
  chem: string;
  percent: number;
}

/** 塗布量 (少/中/大) */
export type ApplyAmount = "少" | "中" | "大";

/** レシピの1工程 (使用薬剤や塗布など) */
export interface RecipeStep {
  id: string;
  /** 所属する大枠パート (クリニック/デザイン/ケア)。未指定は clinic 扱い */
  part?: RecipePart;
  /** 工程名 例: 前処理 / 1剤 / 2剤 / トリートメント */
  name: string;
  /** 薬剤の配合 (ダメージレベル別の薬剤塗布などで使用)。比率は% */
  mix?: MixItem[];
  /** 塗布量 (少/中/大)。クリニック・デザインパートで使用 */
  amount?: ApplyAmount;
  /** 使用した薬剤・製品 例: KEMA base + water 1:1 */
  product: string;
  /** 放置時間 (分) */
  minutes?: number;
  /** 補足メモ */
  note?: string;
}

/** 施術記録 1件 */
export interface TreatmentRecord {
  id: string;
  /** 来店日 (YYYY-MM-DD) */
  date: string;
  /** お客様名 / 識別名 (任意, ニックネーム推奨) */
  customerName: string;
  /** 施術メニュー 例: KEMAトリートメント / KEMAカラー */
  menu: string;
  /** 後ろ(バック)の来店時 (施術前) ダメージプロファイル (根元→毛先の5セクション) */
  damageBefore: DamageProfile;
  /** 後ろ(バック)の施術後ダメージプロファイル (任意) */
  damageAfter?: DamageProfile;
  /** 追加部位 (左サイド/右サイド/前髪〜トップ) の測定 (任意) */
  extraAreas?: AreaMeasurement[];
  /** ダメージ測定の所見メモ */
  damageNote?: string;
  /** レシピ工程 */
  recipe: RecipeStep[];
  /** ビフォー写真 (dataURL) */
  beforePhotos: string[];
  /** アフター写真 (dataURL) */
  afterPhotos: string[];
  /** 全体メモ・振り返り */
  memo?: string;
  /** 記録の状態。draft=下書き(仮保存) / done=確定。未指定は done 扱い */
  status?: "draft" | "done";
  /** 作成・更新のタイムスタンプ (epoch ms) */
  createdAt: number;
  updatedAt: number;
}

/** エクスポート/インポート用のバックアップ形式 */
export interface BackupPayload {
  app: "kemachart";
  version: 2;
  exportedAt: number;
  records: TreatmentRecord[];
}
