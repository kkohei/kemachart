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
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // 明るい背景に合わせて、ステータスバーの文字を暗色に
    await StatusBar.setStyle({ style: Style.Light });
    // iOSではWebViewがステータスバー下に潜り込まないようにする
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // StatusBarが使えない環境では無視
  }
}
