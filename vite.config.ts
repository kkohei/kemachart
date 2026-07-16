import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 相対パス ("./") を使うことで、以下のすべてで同じビルドが動作します:
//  - GitHub Pages のプロジェクトサイト (https://kkohei.github.io/kemachart/)
//  - Capacitor による iOS/Android ネイティブアプリ (capacitor://localhost)
//  - ローカルの file:// やサブディレクトリ配信
// ハッシュルーティング (#/...) を使っているため、相対パスでもディープリンクは壊れません。
export default defineConfig({
  base: "./",
  plugins: [react()],
});
