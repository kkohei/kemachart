import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { version } from "./package.json";

// 相対パス ("./") を使うことで、以下のすべてで同じビルドが動作します:
//  - GitHub Pages のプロジェクトサイト (https://kkohei.github.io/kemachart/)
//  - Capacitor による iOS/Android ネイティブアプリ (capacitor://localhost)
//  - ローカルの file:// やサブディレクトリ配信
// ハッシュルーティング (#/...) を使っているため、相対パスでもディープリンクは壊れません。
export default defineConfig({
  base: "./",
  plugins: [react()],
  define: {
    // 画面での実行バージョン確認用 (トップ下部に表示)
    __APP_VERSION__: JSON.stringify(version),
  },
});
