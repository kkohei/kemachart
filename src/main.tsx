import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initNative } from "./native";
import "./styles.css";

// 想定外エラーを端末内に記録 (右上メニュー「直近のエラーを表示」で確認可能)
const LAST_ERROR_KEY = "kemachart.lastError";
function recordError(kind: string, detail: string) {
  try {
    const entry = `[${new Date().toISOString()}] ${kind}\n${detail}`.slice(0, 4000);
    localStorage.setItem(LAST_ERROR_KEY, entry);
  } catch {
    // 記録できない場合は諦める
  }
}
window.addEventListener("error", (e) => {
  recordError("error", `${e.message}\n${e.filename}:${e.lineno}:${e.colno}\n${e.error?.stack ?? ""}`);
});
window.addEventListener("unhandledrejection", (e) => {
  const r = e.reason as Error | undefined;
  recordError("unhandledrejection", `${r?.message ?? String(e.reason)}\n${r?.stack ?? ""}`);
});

void initNative();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
