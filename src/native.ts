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

  // iOSはキーボード表示時に画面を押し上げ、閉じた後もスクロール位置が
  // ずれたまま残ることがある。入力を離れたら位置を正常範囲に戻す。
  window.addEventListener("focusout", () => {
    setTimeout(() => {
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      ) {
        return; // まだ別の入力にフォーカス中なら何もしない
      }
      const doc = document.scrollingElement ?? document.documentElement;
      const max = Math.max(0, doc.scrollHeight - window.innerHeight);
      const y = Math.min(Math.max(0, window.scrollY), max);
      window.scrollTo({ top: y });
    }, 80);
  });
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
