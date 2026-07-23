import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // App Store の Bundle ID。実際の申請時はご自身のドメイン等に合わせて変更してください。
  appId: "com.kema.myrecipi",
  appName: "KEMA my Recipi",
  // vite の出力先。`npm run build` で dist/ が生成されます。
  webDir: "dist",
  ios: {
    // WebViewを画面全体に広げる (真の全画面)。ノッチ/ホームインジケータの
    // 安全領域は CSS の env(safe-area-inset) 側でパディングとして確保する。
    contentInset: "never",
  },
};

export default config;
