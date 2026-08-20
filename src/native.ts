import { Capacitor } from "@capacitor/core";

/**
 * ネイティブ (iOS/Android) 実行時の初期化。
 * Web実行時 (ブラウザ/PWA) では何もしません。
 */
export async function initNative(): Promise<void> {
  // キーボード開閉での表示ズレ対策はWeb (iOS Safari/PWA) でも有効化する
  setupKeyboardViewportGuard();

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

  setupKeyboardViewportGuard();
}

/**
 * iOSはキーボード表示時に画面全体を押し上げ、閉じた後もスクロール位置や
 * 表示領域がズレたまま残ることがある (WKWebViewの既知の問題)。
 * ネイティブ側 (AppDelegate) のリセットに加えて、JS側でも
 * キーボードの閉じを検知して表示を正常範囲へ戻す。
 */
function setupKeyboardViewportGuard(): void {
  /** スクロール位置を正常範囲 (0〜最大) にクランプ */
  function clampScroll(): void {
    const doc = document.scrollingElement ?? document.documentElement;
    const max = Math.max(0, doc.scrollHeight - window.innerHeight);
    const y = Math.min(Math.max(0, window.scrollY), max);
    window.scrollTo({ top: y, left: 0 });
  }

  /** 表示のズレを修復: クランプ + WKWebViewに描画領域を再計算させる */
  function fixViewport(): void {
    requestAnimationFrame(() => {
      clampScroll();
      // 一瞬だけ無害なtransformを当てて外すことで、ズレて固まった
      // ビューポートの再レイアウトを強制する (見た目には変化なし)
      const html = document.documentElement;
      html.style.transform = "translateZ(0)";
      requestAnimationFrame(() => {
        html.style.transform = "";
        clampScroll();
      });
    });
  }

  // 1) visualViewport でキーボードの開閉を検知 (閉じた瞬間に修復)
  const vv = window.visualViewport;
  if (vv) {
    let keyboardOpen = false;
    vv.addEventListener("resize", () => {
      const shrunk = vv.height < window.innerHeight - 40;
      if (keyboardOpen && !shrunk) {
        fixViewport();
      }
      keyboardOpen = shrunk;
    });
  }

  // 2) 入力を離れたときにも修復 (visualViewportが発火しないケースの保険)
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
      fixViewport();
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
