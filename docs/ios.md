# iOSアプリのビルド手順

> ## ⚠️ 重要ルール: 更新のたびに `pod install` は不要（忘れない）
>
> **Webの変更（画面・機能・文言など）だけの更新では、Podの更新は一切不要です。**
> `pod install` を毎回走らせると、失敗したときに既存のPodまで壊れて
> 「No such module 'Capacitor'」の原因になります。
>
> - **通常の更新（ほぼ毎回これ）**: `npm run ios`
>   → build → `cap copy`（Web資産をコピーするだけ・**podは触らない**）→ Xcodeを開く
> - **Podが必要なのは「新しいCapacitorプラグインを追加したとき」だけ**: `npm run ios:full`
>   → build → `cap sync` → `pod install` → Xcodeを開く
>
> Podは最初に一度入れば、Web更新では入れ直す必要はありません。
> 「No such module 'Capacitor'」が出たときだけ、下の「トラブル時」の手順で
> 一度 `pod install`（または `npm run ios:full`）を実行してください。



このアプリは [Capacitor](https://capacitorjs.com/) を使い、Webアプリ (Vite + React) をそのまま
ネイティブiOSアプリとしてビルド・App Store申請できるようにしています。UIコードは web と 100% 共通です。

## 重要な前提

- **iOSアプリのビルド・実機確認・App Store申請には macOS + Xcode が必須**です（Appleの仕様）。
  Windows / Linux 単体ではビルドできません。
- Mac をお持ちでない場合は、後述の「Mac がない場合」の選択肢をご覧ください。

---

## まずは iOS シミュレーターで試す（署名・課金 不要）

**シミュレーターでの動作確認には Apple Developer Program（有料）も署名も不要です。** Mac と Xcode さえあれば無料で試せます。

### 1. 事前準備（初回のみ）

```bash
# Xcode コマンドラインツール
xcode-select --install

# CocoaPods（未インストールの場合）
sudo gem install cocoapods
# ↑うまくいかない場合は Homebrew で: brew install cocoapods
```

- App Store から **Xcode** をインストールし、一度起動してライセンス同意・追加コンポーネントの導入を済ませます。

### 2. コードを取得

```bash
git clone https://github.com/kkohei/kemachart.git   # 既にある場合は git pull
cd kemachart
npm install
```

### 3. ビルドして Xcode を開く

```bash
npm run ios
```

（内部で `npm run build` → `cap sync ios`〈pod install 含む〉→ `cap open ios` を実行します）

> 万一 `cap open` で開いたプロジェクトが Pods 未解決の場合:
> `cd ios/App && pod install && cd ../..` を実行してから、もう一度 `npm run ios:open`。
> **開くのは `App.xcworkspace`（.xcodeproj ではない）** です。`npm run ios` は自動で workspace を開きます。

### 4. シミュレーターで実行

1. Xcode 上部のスキーム横で、実行先に **iPhone 15 / 16 などのシミュレーター** を選択
2. ▶︎（Run）を押す → 数十秒でビルドされ、シミュレーターにアプリが起動します
3. 署名は不要です（もし署名エラーが出ても、それは実機用。シミュレーターでは無視できます）

### コマンドラインだけで起動したい場合

```bash
npm run build && npx cap sync ios
npx cap run ios          # 起動するシミュレーターを一覧から選択
```

### シミュレーターで試すときの注意

- **カメラはシミュレーターに存在しません**。写真の「カメラ撮影」は動きませんが、
  シミュレーターの「写真」ライブラリからの選択は可能です（あらかじめ画像をドラッグ＆ドロップで追加できます）。
- 共有シート（LINE等）はシミュレーターだと一部アプリが入っていないため、実機での確認が確実です。
- Web のコードを変更したら `npm run sync` で再同期 → Xcode で再実行。

### うまく動かないとき

| 症状 | 対処 |
| --- | --- |
| 画面が真っ白 | `npm run build` で `dist/` が生成されているか確認 → `npx cap sync ios` |
| `No such module 'Capacitor'` | `cd ios/App && pod install`。開くのは `.xcworkspace` |
| ビルドは通るが起動しない | シミュレーターを一度リセット（Simulator メニュー → Erase All Content and Settings） |

---

## Mac でビルドする（推奨）

### 1. 必要なもの

- macOS + [Xcode](https://apps.apple.com/jp/app/xcode/id497799835)（App Store から無料）
- [Node.js](https://nodejs.org/) 20 以上
- [CocoaPods](https://cocoapods.org/) … `sudo gem install cocoapods`
- （実機・申請する場合）[Apple Developer Program](https://developer.apple.com/programs/) 登録（年 $99）

### 2. リポジトリを取得して依存をインストール

```bash
git clone https://github.com/kkohei/kemachart.git
cd kemachart
npm install
```

### 3. ビルドして Xcode で開く

```bash
npm run ios
```

これは内部で次を実行します：

1. `npm run build` … Web を `dist/` にビルド
2. `cap sync ios` … `dist/` を iOS プロジェクトへ同期し、CocoaPods を解決
3. `cap open ios` … Xcode でワークスペースを開く

> 初回は `cd ios/App && pod install` を一度実行しておくと確実です。

### 4. Xcode で実行

1. Xcode 上部で実行先（シミュレータ or 接続した iPhone）を選択
2. **署名**: `App` ターゲット → *Signing & Capabilities* で自分の Apple ID チームを選択
3. ▶︎ (Run) を押すとビルド・起動します

### 5. Web を更新したら

コードを変更したら、再同期してから Xcode で再ビルドします：

```bash
npm run sync      # build + cap sync
```

---

## App Store へ申請する流れ（概要）

1. [App Store Connect](https://appstoreconnect.apple.com/) で新規アプリを登録
   - Bundle ID は `capacitor.config.ts` の `appId`（現在 `com.kema.myrecipi`）と一致させる
2. Xcode で *Product → Archive* → *Distribute App* からアップロード
3. App Store Connect でスクリーンショット・説明文・プライバシー情報を入力して審査提出

### プライバシー（審査で必要）

本アプリのデータはすべて端末内 (localStorage) に保存され、外部送信しません。
写真アクセスの用途は `ios/App/App/Info.plist` に日本語で記載済みです：

- `NSCameraUsageDescription`（カメラ）
- `NSPhotoLibraryUsageDescription`（写真ライブラリ）

---

## Mac がない場合の選択肢

1. **クラウド macOS CI でビルド**
   - [Codemagic](https://codemagic.io/)、[Ionic Appflow](https://ionic.io/appflow)、
     [GitHub Actions の macOS ランナー](https://docs.github.com/actions) など。
     `npm run build && npx cap sync ios` の後に `xcodebuild` を回す構成にします。
2. **PWA として今すぐ使う（申請不要・無料）**
   - このアプリは PWA 対応済みです。iPhone の Safari で公開URL（GitHub Pages 等）を開き、
     共有メニュー →「ホーム画面に追加」でアプリのように使えます。
   - App Store には載りませんが、機能はネイティブ版とほぼ同じです。

---

## アイコン・スプラッシュの再生成

ソース画像は `assets/icon-source.svg` / `assets/splash-source.svg` です。
差し替えたい場合はこの SVG を編集し、[@capacitor/assets](https://github.com/ionic-team/capacitor-assets)
などで各サイズを再生成して `ios/App/App/Assets.xcassets` に配置してください。
