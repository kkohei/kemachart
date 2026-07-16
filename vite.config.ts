import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages でホストする場合、リポジトリ名がベースパスになります。
// 例: https://kkohei.github.io/kemachart/  →  base = "/kemachart/"
// 独自ドメインやローカルでは "/" を使います。
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/kemachart/" : "/",
  plugins: [react()],
}));
