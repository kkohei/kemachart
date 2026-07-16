import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // App Store の Bundle ID。実際の申請時はご自身のドメイン等に合わせて変更してください。
  appId: "com.kema.myrecipi",
  appName: "KEMA my Recipi",
  // vite の出力先。`npm run build` で dist/ が生成されます。
  webDir: "dist",
  ios: {
    // ノッチ/ホームインジケータの安全領域はCSSの env(safe-area-inset) で対応済み
    contentInset: "always",
  },
};

export default config;
