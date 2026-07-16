import type { TreatmentRecord } from "../types";
import { navigate } from "../hooks/useHashRoute";
import { DataMenu } from "./DataMenu";

/** トップ (ハブ) 画面: ピンクゴールドのグラデ背景に2つの入口 */
export function Landing({
  records,
  onImport,
}: {
  records: TreatmentRecord[];
  onImport: (records: TreatmentRecord[]) => void;
}) {
  return (
    <div className="landing">
      <div className="landing__sheen" aria-hidden="true" />

      <div className="landing__top">
        <DataMenu records={records} onImport={onImport} variant="light" />
      </div>

      <div className="landing__brand">
        <div className="landing__mark">
          <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden="true">
            <defs>
              <linearGradient id="landStrand" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#d99f89" />
                <stop offset="1" stopColor="#b9765f" />
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="92" height="92" rx="26" fill="#ffffff" />
            <g fill="none" stroke="url(#landStrand)" strokeWidth="5" strokeLinecap="round">
              <path d="M33 22 C 23 42, 23 64, 34 80" />
              <path d="M50 20 C 41 42, 41 66, 50 82" />
              <path d="M67 22 C 77 42, 77 64, 66 80" />
            </g>
            <circle cx="50" cy="50" r="7" fill="#b9765f" />
          </svg>
        </div>
        <h1 className="landing__title">KEMA my Recipi</h1>
        <p className="landing__tagline">美容師のための施術カルテ</p>
        <div className="landing__by">
          <span className="landing__by-rule" />
          <span className="landing__by-name">KEMA PRO SHOP</span>
          <span className="landing__by-rule" />
        </div>
      </div>

      <div className="landing__menu">
        <button className="hub-card" onClick={() => navigate("#/records")}>
          <span className="hub-card__icon" aria-hidden="true">✍️</span>
          <span className="hub-card__body">
            <span className="hub-card__title">レシピを記入する</span>
            <span className="hub-card__desc">ダメージ測定・レシピ・写真を記録／見返す</span>
          </span>
          <span className="hub-card__chev" aria-hidden="true">›</span>
        </button>

        <button className="hub-card hub-card--soon" disabled aria-disabled="true">
          <span className="hub-card__icon" aria-hidden="true">🧴</span>
          <span className="hub-card__body">
            <span className="hub-card__title">商品情報を見る</span>
            <span className="hub-card__desc">KEMA製品のラインナップ・使い方</span>
          </span>
          <span className="hub-card__soon">Coming Soon</span>
        </button>
      </div>
    </div>
  );
}
