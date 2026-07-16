/** トップ画面のブランドヒーロー (ピンクゴールドのグラデ) */
export function Hero() {
  return (
    <section className="hero">
      <div className="hero__sheen" aria-hidden="true" />
      <div className="hero__mark">
        <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden="true">
          <defs>
            <linearGradient id="heroStrand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d99f89" />
              <stop offset="1" stopColor="#b9765f" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="92" height="92" rx="26" fill="#ffffff" />
          <g fill="none" stroke="url(#heroStrand)" strokeWidth="5" strokeLinecap="round">
            <path d="M33 22 C 23 42, 23 64, 34 80" />
            <path d="M50 20 C 41 42, 41 66, 50 82" />
            <path d="M67 22 C 77 42, 77 64, 66 80" />
          </g>
          <circle cx="50" cy="50" r="7" fill="#b9765f" />
        </svg>
      </div>

      <h1 className="hero__title">KEMA my Recipi</h1>
      <p className="hero__tagline">美容師のための施術カルテ</p>

      <div className="hero__brand">
        <span className="hero__brand-rule" />
        <span className="hero__brand-name">KEMA PRO SHOP</span>
        <span className="hero__brand-rule" />
      </div>
    </section>
  );
}
