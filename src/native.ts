import { Capacitor } from "@capacitor/core";

/**
 * ネイティブ (iOS/Android) 実行時の初期化。
 * Web実行時 (ブラウザ/PWA) では何もしません。
 */
export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // ネイティブ判定用のクラスを付与 (CSSの微調整に利用可能)
  document.documentElement.classList.add("is-native", `platform-${Capacitor.getPlatform()}`);

  try {
    const { StatusBar } = await import("@capacitor/status-bar");
    // WebViewをステータスバー下まで広げて全画面表示にする
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch {
    // StatusBarが使えない環境では無視
  }
}

/**
 * ステータスバーの文字色を背景の明暗に合わせて切り替えます。
 *  - dark = 暗い背景 → 白い文字
 *  - light = 明るい背景 → 黒い文字
 */
export async function setStatusBarForBackground(mode: "dark" | "light"): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: mode === "dark" ? Style.Dark : Style.Light });
  } catch {
    // 無視
  }
}
