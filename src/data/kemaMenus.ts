/**
 * KEMA 湿熱システム サロンワーク・マニュアル (2026.07) のメニュー定義。
 *
 * マニュアル「MOIST-HEAT SYSTEM｜ダメージレス施術の標準手順」より、
 * 3つの標準メニュー (ブリーチ/クリニック/根元ボリューム) の手順・
 * 使用薬剤・温度/タイムをアプリ用データに整理したもの。
 */

export type KemaMenuId = "bleach" | "clinic" | "rootVolume";

export interface KemaTemplateStep {
  /** 工程名 */
  name: string;
  /** 使用薬剤・製品・操作 */
  product: string;
  /** 放置・処理時間 (分) */
  minutes?: number;
  /** 温度・操作のメモ */
  note?: string;
}

export interface KemaMenuDef {
  id: KemaMenuId;
  /** アプリのメニュー名として使う表示名 */
  name: string;
  short: string;
  english: string;
  /** ひとことで何をするメニューか */
  description: string;
  /** マニュアル準拠のレシピ手順 */
  steps: KemaTemplateStep[];
  /** 施術上の注意 (マニュアルの NG・重要ポイント) */
  cautions: string[];
}

export const KEMA_MENUS: KemaMenuDef[] = [
  {
    id: "bleach",
    name: "KEMAブリーチ",
    short: "ブリーチ",
    english: "Bleach",
    description:
      "SUB BASE配合のブリーチと中間処理で、ハイトーンをムラを抑えて仕上げる脱色手順。",
    steps: [
      {
        name: "ブリーチ塗布",
        product: "ブリーチ剤＋2剤 に SUB BASE 30% を配合し全体塗布",
        note: "放置は髪の状態を見て決定。オーバータイム・泡ダレ厳禁",
      },
      {
        name: "中間処理 (STC)",
        product: "STC でムラになりやすい部分を注視しながらスライディング",
        note: "温度100℃",
      },
      { name: "水分チャージ", product: "EQミスト を全体に噴霧し、均一にコーミング" },
      {
        name: "洗浄・補修",
        product: "すすぎ → クレマシャンプー → ケマチン → トリートメントブラック",
        note: "順に洗浄・補修し、しっかりすすぐ",
      },
      {
        name: "乾燥前ベース",
        product: "タオルドライ後 ミラクルボンドバーム をなじませ、ドライヤーで乾燥",
      },
      {
        name: "スタイリング",
        product: "DBST でプレスして質感を仕上げる",
        note: "温度200–220℃・完全乾燥後のみ",
      },
      { name: "仕上げ", product: "ペンタSオイル" },
    ],
    cautions: [
      "オーバータイム・泡ダレ厳禁。放置中も髪から目を離さない",
      "STCは100℃・軽く触れるプレス圧で (薬液を押し出さない)",
      "高温 (DBST 200–220℃) は完全乾燥後のスタイリングのみ",
    ],
  },
  {
    id: "clinic",
    name: "KEMAクリニック",
    short: "クリニック",
    english: "Clinic",
    description: "薬剤と低温プレスを重ねて集中補修する、トリートメント施術の手順。",
    steps: [
      { name: "洗浄", product: "クレマシャンプー で洗浄", note: "乾燥80%まで" },
      {
        name: "水分チャージ",
        product: "EQミスト を全体塗布 → STC で5秒プレスして蒸らす",
        note: "温度100℃・プレス5秒",
      },
      {
        name: "ANTA",
        product: "ANTA を全体塗布 → STC で5秒プレスして蒸らす",
        note: "温度100℃・プレス5秒",
      },
      {
        name: "ANTA3",
        product: "ANTA3 を全体塗布 → STC で5秒プレス＋スライディング",
        note: "温度120℃・プレス5秒",
      },
      {
        name: "集中トリートメント",
        product: "ケマチン 5分 → トリートメントブラック 5分 → しっかりすすぐ",
        minutes: 10,
        note: "放置 各5分",
      },
      { name: "乾燥前ベース", product: "ミラクルボンドバーム を均一に塗布", note: "乾燥100%まで" },
      {
        name: "スタイリング・仕上げ",
        product: "DBST でスタイリング → ペンタSオイル で仕上げ",
        note: "温度200–220℃・完全乾燥後のみ",
      },
    ],
    cautions: [
      "湿熱の順序を守る (水分を与えてから低温で蒸らす)",
      "STCはパッドが「軽く触れる」プレス圧が正解。強く握ると薬液が押し出される",
      "ハイダメージ毛の補修には トリートメントホワイト を使用",
    ],
  },
  {
    id: "rootVolume",
    name: "KEMA根元ボリューム",
    short: "根元ボリューム",
    english: "Root Volume",
    description: "根元の立ち上げをつくって固定し、ふんわりとしたシルエットを持続させる手順。",
    steps: [
      { name: "洗浄", product: "クレマシャンプー で洗浄" },
      {
        name: "1剤調合・塗布",
        product: "AR50 100g ＋ ANTA 20g ＋ ANTA3 10g を調合し、根元全体に塗布",
      },
      {
        name: "立ち上げ固定",
        product: "STC・3角・5角 で根元を立ち上げて固定",
        note: "温度110–130℃。毛流れと狙うボリュームでツールとゾーン角度 (120°/90°/45°) を使い分け",
      },
      {
        name: "2剤・ケア",
        product: "2剤 を5分間隔で2回塗布 → EQミスト → ケマチン → トリートメントホワイト → すすぎ",
        minutes: 10,
        note: "2剤 5分×2回",
      },
      {
        name: "乾燥前ベース",
        product: "タオルドライ後 ミラクルボンドバーム をなじませ、ドライヤーで乾燥",
      },
      {
        name: "スタイリング・仕上げ",
        product: "DBST でスタイリング → ペンタSオイル で仕上げ",
        note: "温度200–220℃・完全乾燥後のみ",
      },
    ],
    cautions: [
      "根元の立ち上がりは挟む角度で決まる (120°オーバー/90°ミドル/45°アンダー)",
      "さらにボリュームが欲しい時は10〜20mm前進させて二次工程",
      "2剤は5分間隔×2回を守る",
    ],
  },
];

export function kemaMenu(id: KemaMenuId): KemaMenuDef {
  return KEMA_MENUS.find((m) => m.id === id) ?? KEMA_MENUS[0];
}

/** 温度とタイムの早見表 (マニュアル QUICK REFERENCE) */
export const QUICK_REFERENCE = {
  temperatures: [
    { tool: "STC (湿熱プレス)", temp: "100℃", use: "ブリーチの中間処理／クリニック前半の蒸らし" },
    { tool: "STC (湿熱プレス)", temp: "120℃", use: "クリニック STEP04 (ANTA3後のスライディング)" },
    { tool: "3角・5角", temp: "110–130℃", use: "根元の立ち上げ固定 (ゾーン別に角度を調整)" },
    { tool: "DBST (スタイリング)", temp: "200–220℃", use: "完全乾燥後の仕上げプレスのみ" },
  ],
  timings: [
    { item: "蒸らしプレス", time: "5秒", note: "STCで挟んで蒸らす時間" },
    { item: "集中トリートメント", time: "各5分", note: "ケマチン／ブラック／ホワイトの放置時間" },
    { item: "2剤", time: "5分間隔×2回", note: "根元ボリュームの2剤塗布" },
    { item: "ブリーチ放置", time: "都度判断", note: "髪の状態を見て決定 (オーバータイム厳禁)" },
  ],
  principles: [
    "湿熱の順序を守る — 水分を与えてから、低温で蒸らす",
    "高温は乾いてから — 200℃以上は完全乾燥後のスタイリングのみ",
    "髪から目を離さない — オーバータイム・泡ダレ厳禁",
  ],
};
