// KEMA施術記録のデータモデル

/** ダメージレベル (1: 健康毛 〜 5: 極度のダメージ) */
export type DamageLevel = 1 | 2 | 3 | 4 | 5;

/** レシピの1工程 (使用薬剤や塗布など) */
export interface RecipeStep {
  id: string;
  /** 工程名 例: 前処理 / 1剤 / 2剤 / トリートメント */
  name: string;
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
  /** 来店時 (施術前) のダメージレベル */
  damageBefore: DamageLevel;
  /** 施術後のダメージレベル (任意) */
  damageAfter?: DamageLevel;
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
  /** 作成・更新のタイムスタンプ (epoch ms) */
  createdAt: number;
  updatedAt: number;
}

/** エクスポート/インポート用のバックアップ形式 */
export interface BackupPayload {
  app: "kemachart";
  version: 1;
  exportedAt: number;
  records: TreatmentRecord[];
}
