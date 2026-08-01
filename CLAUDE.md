# KEMA my Recipi — プロジェクトメモ

美容師向けのKEMA施術記録アプリ（Vite + React + TypeScript / Capacitorで iOS化）。

## ⚠️ 最重要ルール: iOS更新で pod install を毎回走らせない（忘れない）

- **Webの変更だけの更新では Pod の更新は不要。** `pod install` を毎回実行すると、
  失敗時に既存Podが壊れて「No such module 'Capacitor'」の原因になる。
- **通常の更新は `npm run ios`**（build → `cap copy` のみ・podは触らない → Xcodeを開く）。
- **Podが要るのは新しいCapacitorプラグインを追加したときだけ** → `npm run ios:full`。
- Xcodeで開くのは必ず **`App.xcworkspace`**（`.xcodeproj` ではない）。`cap open` は自動でworkspaceを開く。
- 「No such module 'Capacitor'」が出たときだけ、一度 `npm run ios:full`（＝pod install）を実行。

## npm スクリプト

- `npm run dev` — ローカル開発サーバー
- `npm run build` — 本番ビルド (dist/)
- `npm run ios` — build → cap copy → Xcode（**通常の更新用・pod不要**）
- `npm run ios:full` — build → cap sync → pod install → Xcode（**プラグイン追加時のみ**）
- `npm run ios:open` — Xcode(workspace)を開くだけ
- `npm run ios:pods` — 手動で pod install（ios/App）

## 構成メモ

- データは端末内 localStorage（サーバー送信なし）。移行はアプリ内のJSONバックアップ。
- 自動バックアップ: 保存のたびに Documents/バックアップ/ へJSON書き出し（最新＋日付別7日分、`src/utils/autoBackup.ts`）。
  Documents は iOSの「iCloudバックアップ」対象。ファイルAppにも表示（Info.plist の UIFileSharingEnabled）。
- 正規KEMAロゴは `public/brand/`（ブランドアイデンティティPDF由来）。ロゴは必ず正規のものを使う。
- トップ = サロンデザイン × ディープモカ（`src/components/Landing.tsx`）。
- レシピは3大枠パート（クリニック/デザイン/ケア）。工程名候補は `STEP_PRESETS_BY_PART`（constants.ts）。
- 共有は 日本語 / 한국어 切替（`src/utils/share.ts`）。ボタンは LINE / X / カカオトーク。
- iOSビルド・申請の詳細は `docs/ios.md`、`docs/app-store.md`。
- 開発ブランチ: `claude/kema-treatment-logger-cwnsjo`。
