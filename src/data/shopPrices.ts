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
  /** B品・アウトレット等 */
  outlet?: boolean;
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

/** カテゴリキー → 商品リスト。CSVの内容をそのまま構造化。 */
export const SHOP_ITEMS: Record<string, ShopItem[]> = {
  前処理剤: [
    { key: "A0100", productId: 31, name: "KEMA ANTA3 150ml", variant: "単品", code: "A0100", units: 1, unitPrice: 6400 },
    { key: "A0100-B", productId: 31, name: "KEMA ANTA3 150ml", variant: "ケース (48本)", code: "A0100-B", units: 48, unitPrice: 6400 },
    { key: "A0023", productId: 11, name: "KEMA CMC 500ml", variant: "単品", code: "A0023", units: 1, unitPrice: 2900 },
    { key: "A0023-B", productId: 11, name: "KEMA CMC 500ml", variant: "ケース (24本)", code: "A0023-B", units: 24, unitPrice: 2900 },
    { key: "11-b", productId: 11, name: "KEMA CMC 500ml", variant: "[セール] B品 パッケージ破損品", units: 1, unitPrice: 1500, outlet: true },
    { key: "A0022", productId: 10, name: "KEMA ANTAヘアマスク 400ml", variant: "単品", code: "A0022", units: 1, unitPrice: 6400 },
    { key: "A0022-B", productId: 10, name: "KEMA ANTAヘアマスク 400ml", variant: "ケース (40本)", code: "A0022-B", units: 40, unitPrice: 6400 },
    { key: "A0021", productId: 9, name: "KEMA EQアイオニックミスト 500ml", variant: "単品", code: "A0021", units: 1, unitPrice: 6400 },
    { key: "A0021-B", productId: 9, name: "KEMA EQアイオニックミスト 500ml", variant: "ケース (24本)", code: "A0021-B", units: 24, unitPrice: 6400 },
    { key: "A0021-C", productId: 9, name: "KEMA EQアイオニックミスト 500ml", variant: "[セール] B品 パッケージ破損等(液漏れ)", code: "A0021-C", units: 1, unitPrice: 3840, outlet: true },
    { key: "A0020", productId: 8, name: "KEMA サブベース 500ml", variant: "単品", code: "A0020", units: 1, unitPrice: 4100 },
    { key: "A0020-B", productId: 8, name: "KEMA サブベース 500ml", variant: "ケース (24本)", code: "A0020-B", units: 24, unitPrice: 4100 },
  ],
  パーマ剤: [
    { key: "A0074", productId: 23, name: "EZ100（チオグリコール酸系パーマ剤）", variant: "単品", code: "A0074", units: 1, unitPrice: 3800 },
    { key: "A0074-B", productId: 23, name: "EZ100（チオグリコール酸系パーマ剤）", variant: "ケース (40本)", code: "A0074-B", units: 40, unitPrice: 3800 },
    { key: "A0075", productId: 22, name: "AR50（システアミン系パーマ剤）", variant: "単品", code: "A0075", units: 1, unitPrice: 3300 },
    { key: "A0075-B", productId: 22, name: "AR50（システアミン系パーマ剤）", variant: "ケース (40本)", code: "A0075-B", units: 40, unitPrice: 3300 },
    { key: "A0024", productId: 12, name: "KEMA アフリー 400ml", variant: "単品", code: "A0024", units: 1, unitPrice: 3300 },
    { key: "A0024-B", productId: 12, name: "KEMA アフリー 400ml", variant: "ケース (40本)", code: "A0024-B", units: 40, unitPrice: 3300 },
  ],
  シャンプー: [
    { key: "B001", productId: 33, name: "トライアルセット", variant: "3種1セット", code: "B001", units: 1, unitPrice: 2200 },
    { key: "A0070", productId: 24, name: "KEMA スカルプシャンプー 500ml", variant: "単品", code: "A0070", units: 1, unitPrice: 4100 },
    { key: "A0070-6", productId: 24, name: "KEMA スカルプシャンプー 500ml", variant: "6本入り", code: "A0070-6", units: 6, unitPrice: 4100 },
    { key: "A0070-B", productId: 24, name: "KEMA スカルプシャンプー 500ml", variant: "ケース (24本)", code: "A0070-B", units: 24, unitPrice: 4100 },
    { key: "24-b", productId: 24, name: "KEMA スカルプシャンプー 500ml", variant: "シュリンク破れ", units: 1, unitPrice: 2300, outlet: true },
    { key: "A0030", productId: 16, name: "KEMA クレマシャンプー 500ml", variant: "単品", code: "A0030", units: 1, unitPrice: 4100 },
    { key: "A0030-6", productId: 16, name: "KEMA クレマシャンプー 500ml", variant: "6本入り", code: "A0030-6", units: 6, unitPrice: 4100 },
    { key: "A0030-B", productId: 16, name: "KEMA クレマシャンプー 500ml", variant: "ケース (24本)", code: "A0030-B", units: 24, unitPrice: 4100 },
    { key: "A0026", productId: 14, name: "KEMA プレシャンプー 1000ml", variant: "単品", code: "A0026", units: 1, unitPrice: 4350 },
    { key: "A0026-6", productId: 14, name: "KEMA プレシャンプー 1000ml", variant: "5本入り", code: "A0026-6", units: 5, unitPrice: 4350 },
    { key: "A0026-B", productId: 14, name: "KEMA プレシャンプー 1000ml", variant: "ケース (20本)", code: "A0026-B", units: 20, unitPrice: 4350 },
  ],
  トリートメント: [
    { key: "A0032", productId: 18, name: "KEMA クレマトリートメントブラック 500ml", variant: "単品", code: "A0032", units: 1, unitPrice: 5450 },
    { key: "A0032-6", productId: 18, name: "KEMA クレマトリートメントブラック 500ml", variant: "6本入り", code: "A0032-6", units: 6, unitPrice: 5450 },
    { key: "A0032-B", productId: 18, name: "KEMA クレマトリートメントブラック 500ml", variant: "ケース (24本)", code: "A0032-B", units: 24, unitPrice: 5450 },
    { key: "A0031", productId: 17, name: "KEMA クレマトリートメントホワイト 500ml", variant: "単品", code: "A0031", units: 1, unitPrice: 3800 },
    { key: "A0031-6", productId: 17, name: "KEMA クレマトリートメントホワイト 500ml", variant: "6本入り", code: "A0031-6", units: 6, unitPrice: 3800 },
    { key: "A0031-B", productId: 17, name: "KEMA クレマトリートメントホワイト 500ml", variant: "ケース (24本)", code: "A0031-B", units: 24, unitPrice: 3800 },
    { key: "17-b", productId: 17, name: "KEMA クレマトリートメントホワイト 500ml", variant: "シュリンク破損品", units: 1, unitPrice: 1900, outlet: true },
    { key: "A0027", productId: 15, name: "KEMA プレトリートメント 1000ml", variant: "単品", code: "A0027", units: 1, unitPrice: 4350 },
    { key: "A0027-6", productId: 15, name: "KEMA プレトリートメント 1000ml", variant: "5本入り", code: "A0027-6", units: 5, unitPrice: 4350 },
    { key: "A0027-B", productId: 15, name: "KEMA プレトリートメント 1000ml", variant: "ケース (20本)", code: "A0027-B", units: 20, unitPrice: 4350 },
    { key: "15-b", productId: 15, name: "KEMA プレトリートメント 1000ml", variant: "シュリンク破損品", units: 1, unitPrice: 2175, outlet: true },
    { key: "A0025", productId: 13, name: "KEMA ケマチン 500ml", variant: "単品", code: "A0025", units: 1, unitPrice: 4880 },
    { key: "A0025-6", productId: 13, name: "KEMA ケマチン 500ml", variant: "6本入り", code: "A0025-6", units: 6, unitPrice: 4880 },
    { key: "A0025-B", productId: 13, name: "KEMA ケマチン 500ml", variant: "ケース (24本)", code: "A0025-B", units: 24, unitPrice: 4880 },
    { key: "13-b", productId: 13, name: "KEMA ケマチン 500ml", variant: "シュリンク破れ", units: 1, unitPrice: 2440, outlet: true },
  ],
  バーム: [
    { key: "A0041", productId: 20, name: "KEMA ミラクルボンドバーム 120g", variant: "単品", code: "A0041", units: 1, unitPrice: 1950 },
    { key: "A0041-6", productId: 20, name: "KEMA ミラクルボンドバーム 120g", variant: "6本入り", code: "A0041-6", units: 6, unitPrice: 1950 },
    { key: "A0041-B", productId: 20, name: "KEMA ミラクルボンドバーム 120g", variant: "ケース (60本)", code: "A0041-B", units: 60, unitPrice: 1950 },
    { key: "A0040", productId: 19, name: "KEMA リーブインバーム", variant: "単品", code: "A0040", units: 1, unitPrice: 2500 },
    { key: "A0040-6", productId: 19, name: "KEMA リーブインバーム", variant: "6本入り", code: "A0040-6", units: 6, unitPrice: 2500 },
    { key: "A0040-B", productId: 19, name: "KEMA リーブインバーム", variant: "ケース (48本・newボトル)", code: "A0040-B", units: 48, unitPrice: 2500 },
    { key: "A0040-OB", productId: 19, name: "KEMA リーブインバーム", variant: "ケース (60本)", code: "A0040-OB", units: 60, unitPrice: 2500 },
  ],
  "セラム・オイル": [
    { key: "A0073", productId: 27, name: "KEMAカールディファイニングケアセラム 200ml", variant: "単品", code: "A0073", units: 1, unitPrice: 2100 },
    { key: "A0073-6", productId: 27, name: "KEMAカールディファイニングケアセラム 200ml", variant: "6本入り", code: "A0073-6", units: 6, unitPrice: 2100 },
    { key: "A0073-B", productId: 27, name: "KEMAカールディファイニングケアセラム 200ml", variant: "ケース (48本)", code: "A0073-B", units: 48, unitPrice: 2100 },
    { key: "A0072", productId: 26, name: "KEMA ペンタSオイル 100ml", variant: "単品", code: "A0072", units: 1, unitPrice: 2700 },
    { key: "A0072-6", productId: 26, name: "KEMA ペンタSオイル 100ml", variant: "6本入り", code: "A0072-6", units: 6, unitPrice: 2700 },
    { key: "A0072-B", productId: 26, name: "KEMA ペンタSオイル 100ml", variant: "ケース (60本)", code: "A0072-B", units: 60, unitPrice: 2700 },
  ],
  トニック: [
    { key: "A0071", productId: 25, name: "KEMA スカルプトニック 200ml", variant: "単品", code: "A0071", units: 1, unitPrice: 4100 },
    { key: "A0071-6", productId: 25, name: "KEMA スカルプトニック 200ml", variant: "6本入り", code: "A0071-6", units: 6, unitPrice: 4100 },
    { key: "A0071-B", productId: 25, name: "KEMA スカルプトニック 200ml", variant: "ケース (48本)", code: "A0071-B", units: 48, unitPrice: 4100 },
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
