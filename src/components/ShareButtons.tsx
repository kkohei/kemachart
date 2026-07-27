import { useState } from "react";
import type { TreatmentRecord } from "../types";
import { nativeShare, shareToKakao, snsShareLinks } from "../utils/share";

/** SNS共有ボタン群 (ネイティブ共有 + LINE / X / カカオトーク) */
export function ShareButtons({ record }: { record: TreatmentRecord }) {
  const [toast, setToast] = useState<string | null>(null);
  const links = snsShareLinks(record);

  function flash(msg: string) {
    if (!msg) return;
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  async function handleNative() {
    const res = await nativeShare(record);
    flash(res.message);
  }

  async function handleKakao() {
    const res = await shareToKakao(record);
    flash(res.message);
  }

  return (
    <div className="share">
      <button type="button" className="btn btn--primary share__native" onClick={handleNative}>
        <ShareIcon /> 共有する
      </button>
      <div className="share__sns">
        {links.map((l) => (
          <a
            key={l.label}
            className="share__sns-btn"
            style={{ backgroundColor: l.color, color: l.text }}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {l.label}
          </a>
        ))}
        <button
          type="button"
          className="share__sns-btn"
          style={{ backgroundColor: "#FEE500", color: "#3c1e1e" }}
          onClick={handleKakao}
        >
          カカオトーク
        </button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .17 1L8.98 8.6a3 3 0 1 0 0 6.8l6.19 3.6A3 3 0 1 0 18 16a3 3 0 0 0-2.02.79l-6.19-3.6a3 3 0 0 0 0-2.38l6.19-3.6A3 3 0 0 0 18 8Z"
        fill="currentColor"
      />
    </svg>
  );
}
