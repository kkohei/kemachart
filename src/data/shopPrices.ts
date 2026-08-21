/**
 * KEMA PRO SHOP (kema.i17.bcart.jp) のサロン価格リスト。
 * 2026年8月時点・ユーザー提供のCSV (kema_products_salon_price.csv) より。
 * 価格は「サロン単価 (円)」。入数>1のセットは 単価×入数 がセット金額。
 */

export interface ShopItem {
  /** 数量保存用の安定キー (品番があれば品番、なければ 商品ID-セット名) */
  key: string;
  productId: number;
  /** 商品名 */
  name: string;
  /** セット名 (単品/ケース/6本入り など) */
  variant: string;
  /** 品番 */
  code?: string;
  /** 入数 (1セットあたりの本数) */
  units: number;
  /** サロン単価 (円/本) */
  unitPrice: number;
}

export interface ShopCategory {
  key: string;
  label: string;
}

/** 表示順のカテゴリ定義 */
export const SHOP_CATEGORIES: ShopCategory[] = [
  { key: "前処理剤", label: "前処理剤" },
  { key: "パーマ剤", label: "パーマ剤" },
  { key: "シャンプー", label: "シャンプー" },
  { key: "トリートメント", label: "トリートメント" },
  { key: "バーム", label: "バーム" },
  { key: "セラム・オイル", label: "セラム・オイル" },
  { key: "トニック", label: "トニック" },
  { key: "ヘアアイロン", label: "ヘアアイロン" },
  { key: "ストレート型", label: "ストレートアイロン" },
  { key: "その他サプライ", label: "その他サプライ" },
];

/** カテゴリキー → 商品リスト。B品・セール品・ケース品・6本(5本)入りは除外して収録。 */
export const SHOP_ITEMS: Record<string, ShopItem[]> = {
  前処理剤: [
    { key: "A0100", productId: 31, name: "KEMA ANTA3 150ml", variant: "単品", code: "A0100", units: 1, unitPrice: 6400 },
    { key: "A0023", productId: 11, name: "KEMA CMC 500ml", variant: "単品", code: "A0023", units: 1, unitPrice: 2900 },
    { key: "A0022", productId: 10, name: "KEMA ANTAヘアマスク 400ml", variant: "単品", code: "A0022", units: 1, unitPrice: 6400 },
    { key: "A0021", productId: 9, name: "KEMA EQアイオニックミスト 500ml", variant: "単品", code: "A0021", units: 1, unitPrice: 6400 },
    { key: "A0020", productId: 8, name: "KEMA サブベース 500ml", variant: "単品", code: "A0020", units: 1, unitPrice: 4100 },
  ],
  パーマ剤: [
    { key: "A0074", productId: 23, name: "EZ100（チオグリコール酸系パーマ剤）", variant: "単品", code: "A0074", units: 1, unitPrice: 3800 },
    { key: "A0075", productId: 22, name: "AR50（システアミン系パーマ剤）", variant: "単品", code: "A0075", units: 1, unitPrice: 3300 },
    { key: "A0024", productId: 12, name: "KEMA アフリー 400ml", variant: "単品", code: "A0024", units: 1, unitPrice: 3300 },
  ],
  シャンプー: [
    { key: "B001", productId: 33, name: "トライアルセット", variant: "3種1セット", code: "B001", units: 1, unitPrice: 2200 },
    { key: "A0070", productId: 24, name: "KEMA スカルプシャンプー 500ml", variant: "単品", code: "A0070", units: 1, unitPrice: 4100 },
    { key: "A0030", productId: 16, name: "KEMA クレマシャンプー 500ml", variant: "単品", code: "A0030", units: 1, unitPrice: 4100 },
    { key: "A0026", productId: 14, name: "KEMA プレシャンプー 1000ml", variant: "単品", code: "A0026", units: 1, unitPrice: 4350 },
  ],
  トリートメント: [
    { key: "A0032", productId: 18, name: "KEMA クレマトリートメントブラック 500ml", variant: "単品", code: "A0032", units: 1, unitPrice: 5450 },
    { key: "A0031", productId: 17, name: "KEMA クレマトリートメントホワイト 500ml", variant: "単品", code: "A0031", units: 1, unitPrice: 3800 },
    { key: "A0027", productId: 15, name: "KEMA プレトリートメント 1000ml", variant: "単品", code: "A0027", units: 1, unitPrice: 4350 },
    { key: "A0025", productId: 13, name: "KEMA ケマチン 500ml", variant: "単品", code: "A0025", units: 1, unitPrice: 4880 },
  ],
  バーム: [
    { key: "A0041", productId: 20, name: "KEMA ミラクルボンドバーム 120g", variant: "単品", code: "A0041", units: 1, unitPrice: 1950 },
    { key: "A0040", productId: 19, name: "KEMA リーブインバーム", variant: "単品", code: "A0040", units: 1, unitPrice: 2500 },
  ],
  "セラム・オイル": [
    { key: "A0073", productId: 27, name: "KEMAカールディファイニングケアセラム 200ml", variant: "単品", code: "A0073", units: 1, unitPrice: 2100 },
    { key: "A0072", productId: 26, name: "KEMA ペンタSオイル 100ml", variant: "単品", code: "A0072", units: 1, unitPrice: 2700 },
  ],
  トニック: [
    { key: "A0071", productId: 25, name: "KEMA スカルプトニック 200ml", variant: "単品", code: "A0071", units: 1, unitPrice: 4100 },
  ],
  ヘアアイロン: [
    { key: "A0014", productId: 30, name: "STC-40", variant: "単品", code: "A0014", units: 1, unitPrice: 44100 },
    { key: "A0012", productId: 6, name: "STC-24", variant: "単品", code: "A0012", units: 1, unitPrice: 35000 },
    { key: "A0013", productId: 7, name: "DBST-24", variant: "単品", code: "A0013", units: 1, unitPrice: 35000 },
    { key: "A0011", productId: 5, name: "BMI-T10 トライアングル", variant: "単品", code: "A0011", units: 1, unitPrice: 48800 },
    { key: "A0010", productId: 4, name: "BMI-P10 ペンタゴン", variant: "単品", code: "A0010", units: 1, unitPrice: 48800 },
    { key: "A0080", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "6mmタイプ", code: "A0080", units: 1, unitPrice: 62000 },
    { key: "A0081", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "8mmタイプ", code: "A0081", units: 1, unitPrice: 62000 },
    { key: "A0082", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "10mmタイプ", code: "A0082", units: 1, unitPrice: 62000 },
    { key: "A0083", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "12mmタイプ", code: "A0083", units: 1, unitPrice: 62000 },
    { key: "A0084", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "14mmタイプ", code: "A0084", units: 1, unitPrice: 62000 },
    { key: "A0085", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "16mmタイプ", code: "A0085", units: 1, unitPrice: 62000 },
    { key: "A0086", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "18mmタイプ", code: "A0086", units: 1, unitPrice: 62000 },
    { key: "A0087", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "20mmタイプ", code: "A0087", units: 1, unitPrice: 62000 },
    { key: "A0088", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "22mmタイプ", code: "A0088", units: 1, unitPrice: 62000 },
    { key: "A0089", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "24mmタイプ", code: "A0089", units: 1, unitPrice: 62000 },
    { key: "28-set10", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "10本セット", units: 1, unitPrice: 620000 },
    { key: "28-set5", productId: 28, name: "BMI-丸型アイロンシリーズ", variant: "6mm〜14mm 5本セット", units: 5, unitPrice: 62000 },
  ],
  ストレート型: [
    { key: "A0016", productId: 32, name: "A・I・O -24", variant: "単品", code: "A0016", units: 1, unitPrice: 35000 },
  ],
  その他サプライ: [
    { key: "A0090", productId: 29, name: "デジタルパーマ用シリコンパッド「SPAパッド」60枚入り", variant: "単品", code: "A0090", units: 1, unitPrice: 31000 },
    { key: "A0050", productId: 21, name: "KEMA カーボンアイロンコーム", variant: "単品", code: "A0050", units: 1, unitPrice: 3000 },
  ],
};

/** 1セットあたりの金額 (単価 × 入数) */
export function setPrice(item: ShopItem): number {
  return item.unitPrice * item.units;
}

/** 全SKUのフラットな一覧 */
export function allShopItems(): ShopItem[] {
  return SHOP_CATEGORIES.flatMap((c) => SHOP_ITEMS[c.key] ?? []);
}
