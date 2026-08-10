# App Store 申請ガイド（Xcode中心・早期申請向け）

> ## ✅ 正式配信 最終チェックリスト（v1.0）
>
> **リポジトリ側（対応済み）**
> - [x] 正規KEMAロゴのアプリアイコン・スプラッシュ
> - [x] プライバシーマニフェスト（PrivacyInfo.xcprivacy・ビルドに配線済み）
> - [x] カメラ/写真の利用目的（日本語・Info.plist）
> - [x] 輸出コンプライアンス（ITSAppUsesNonExemptEncryption=false）
> - [x] クラッシュ対策（容量超過の安全処理・写真上限・エラー画面）
> - [x] バージョン: v1.0 = 表示 1.0／ビルド 11（申請用）。リポジトリは次回 v1.1／ビルド 13
>   （自動バックアップ機能入り。v1.0 審査通過後にアップデートとして提出）
> - [x] プライバシーポリシー `public/privacy.html`（Pagesデプロイは下記②）
> - [x] App Store用スクリーンショット6枚（6.9インチ 1320×2868）生成済み
>
> **あなたの操作が必要なもの**
> 1. [ ] TestFlightで最終ビルド（build 11）の動作確認
> 2. [ ] GitHub Pages を有効化 → プライバシーポリシーURLを公開
>    （リポジトリ Settings → Pages → Source を **GitHub Actions** に設定。
>    その後 https://kkohei.github.io/kemachart/privacy.html が開けることを確認）
> 3. [ ] App Store Connect のメタデータ入力（本書§5のコピペ案を使用）
> 4. [ ] スクリーンショット6枚をアップロード
> 5. [ ] App プライバシー申告（§6: 収集なし）・年齢制限（§7: 4+）
> 6. [ ] 審査へ提出（§10）

このドキュメントは、Xcode を中心に開発しながら最短で App Store 審査提出まで進めるための手順書です。
コピペで使える日本語のストア掲載情報（メタデータ）案も用意しています。

前提として **macOS + Xcode + Apple Developer Program（年 $99）** が必要です。基本のビルド手順は
[docs/ios.md](./ios.md) を参照してください。

---

## 0. 申請までの全体像

```
① Xcodeで署名 → ② 実機/TestFlightで動作確認 → ③ Archive & アップロード
   → ④ App Store Connectでメタデータ入力 → ⑤ 審査提出
```

早期申請のコツ: まず **TestFlight（③まで）** に上げてしまい、審査に必要な情報（④）を並行で埋めるのが最速です。

---

## 1. Xcode 側の準備（初回のみ）

```bash
npm install
npm run ios        # build → cap sync ios → Xcode が開く
```

Xcode で `App` ターゲット → **Signing & Capabilities**:

- **Team**: 自分の Apple Developer チームを選択
- **Bundle Identifier**: `com.kema.myrecipi`（`capacitor.config.ts` と一致。変更する場合は両方を合わせる）
- **Automatically manage signing**: オン（初回はこれが簡単）

> Bundle ID は世界で一意である必要があります。`com.kema.myrecipi` が使えない場合は、ご自身のドメインや
> 名前を使ったもの（例 `com.<yourname>.kemamyrecipi`）に変更し、`capacitor.config.ts` の `appId` と
> `project.pbxproj` の `PRODUCT_BUNDLE_IDENTIFIER` を合わせてください。

### 済んでいる審査対策（このリポジトリで対応済み）

- ✅ **プライバシーマニフェスト** `ios/App/App/PrivacyInfo.xcprivacy`（2024年以降の必須要件）
- ✅ **カメラ／写真の利用目的**（日本語）を `Info.plist` に記載
- ✅ **輸出コンプライアンス**: `ITSAppUsesNonExemptEncryption = false`（毎回の質問をスキップ）
- ✅ **アプリアイコン／スプラッシュ**（KEMAデザイン）
- ✅ **画面の向き**: iPhoneは縦固定（UIが縦向き設計のため）

---

## 2. バージョン管理

| 項目 | 場所 | 現在値 |
| --- | --- | --- |
| 表示バージョン | Xcode → General → Version（`MARKETING_VERSION`） | `1.1` |
| ビルド番号 | Xcode → General → Build（`CURRENT_PROJECT_VERSION`） | `13` |

アップロードのたびに **ビルド番号を +1** します（表示バージョンは審査に出す単位で上げます）。

---

## 3. TestFlight / Archive

1. Xcode 上部の実行先を **Any iOS Device (arm64)** に変更
2. メニュー **Product → Archive**
3. Organizer が開いたら **Distribute App → App Store Connect → Upload**
4. アップロード後、App Store Connect の **TestFlight** タブに数分で表示されます
   - 自分の端末でテスト: TestFlight アプリ（App Store から）でインストール
   - 内部テスターに追加すれば審査なしですぐ配布できます

---

## 4. App Store Connect でアプリを登録

[App Store Connect](https://appstoreconnect.apple.com/) → **マイApp → ＋ → 新規App**

- プラットフォーム: iOS
- 名前: `KEMA my Recipi`
- プライマリ言語: 日本語
- バンドルID: 上で使ったものを選択
- SKU: 任意の管理用文字列（例 `kema-my-recipi-001`）

---

## 5. ストア掲載情報（コピペ用の日本語メタデータ案）

> 実際の内容はご自由に調整してください。文字数上限の目安も記載します。

**アプリ名（30字以内）**
```
KEMA my Recipi
```

**サブタイトル（30字以内）**
```
KEMA施術のダメージ記録＆レシピ
```

**プロモーションテキスト（170字以内・審査なしで随時変更可）**
```
来店時のダメージレベルを根元から毛先まで5段階で測定し、レシピとビフォーアフターを記録。自分の施術を見返して、次の一手に活かせます。
```

**説明（4000字以内）**
```
KEMA my Recipi は、美容室でKEMA施術を行う美容師のための施術記録アプリです。

■ ダメージレベル測定
頭部を根元から毛先まで5セクションに分け、それぞれをレベル1〜5で測定。5の5乗＝3125通りでお客様の髪の状態を細かく記録できます。原則は後ろ（バック）のみ、必要に応じて左右サイド・前髪〜トップも追加できます。

■ レシピ記録
前処理・1剤・2剤…と工程ごとに、使用薬剤・放置時間・メモを記録。施術のレシピを正確に残せます。

■ ビフォーアフター写真
施術前後の写真を記録。仕上がりの変化をひと目で見返せます。

■ かんたん共有
記録したダメージコードやレシピを、LINE・X・その他アプリへワンタップで共有できます。

■ データは端末内に保存
入力した記録はすべてお使いの端末内に保存され、外部に送信されません。バックアップの書き出し／読み込みにも対応しています。

まずは自分の施術を記録・見返すことから。KEMAのレシピづくりを、毎日の一枚から始めましょう。
```

**キーワード（100字以内・カンマ区切り）**
```
美容師,美容室,ヘアケア,ダメージ,トリートメント,施術記録,レシピ,カルテ,KEMA,サロン
```

**サポートURL（必須）**
```
https://github.com/kkohei/kemachart
```

**プライバシーポリシーURL（必須）**
```
https://kkohei.github.io/kemachart/privacy.html
```
> このリポジトリの `public/privacy.html` が GitHub Pages 公開時に上記URLで配信されます。

**マーケティングURL（任意）**
```
https://kkohei.github.io/kemachart/
```

**カテゴリ**
- プライマリ: 仕事効率化
- セカンダリ: ビジネス（任意）

---

## 6. App プライバシー（データ収集の申告）

App Store Connect → **App のプライバシー** で、次のように申告します（本アプリは収集なし）。

- **データを収集していますか？** → **いいえ（No, we do not collect data）**
  - すべてのデータは端末内に保存され、開発者は一切アクセスしません。

---

## 7. 年齢制限（レーティング）

コンテンツ表現はいずれも「なし」を選択 → 想定レーティングは **4+**。

---

## 8. スクリーンショット

必須サイズ（2025年時点の目安）:

- 6.9インチ（iPhone 16 Pro Max 等）: 必須
- 6.5インチ（iPhone 11 Pro Max 等）: 推奨

> シミュレータのスクリーンショット（⌘S）で問題ありません。
> 一覧・記録入力（ダメージチャート）・詳細（ビフォーアフター）の3〜5枚がおすすめです。

---

## 9. 審査メモ（Review Notes）に記載すると親切な内容

```
本アプリはログイン不要で、すべてのデータは端末内(localStorage)に保存されます。
サーバー通信・アカウント登録はありません。カメラ/写真は施術記録の撮影・選択にのみ使用します。
```

---

## 10. 提出

すべて入力したら、ビルドを選択して **「審査へ提出」**。
初回審査は通常1〜3日程度です。リジェクト時は Resolution Center の指摘に沿って修正し、再提出します。
