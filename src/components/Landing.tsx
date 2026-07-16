import type { TreatmentRecord } from "../types";
import { navigate } from "../hooks/useHashRoute";
import { DataMenu } from "./DataMenu";
import { BgSalon } from "./landing/Backgrounds";

const LOGO = `${import.meta.env.BASE_URL}brand/kema-logo-white.png`;

/** トップ (ハブ) 画面。サロンデザイン × ディープモカ。 */
export function Landing({
  records,
  onImport,
}: {
  records: TreatmentRecord[];
  onImport: (records: TreatmentRecord[]) => void;
}) {
  return (
    <div className="land land--salon land--mocha">
      <BgSalon />

      <div className="land__top">
        <DataMenu records={records} onImport={onImport} variant="light" />
      </div>

      <div className="land__brand">
        <img className="land__logo" src={LOGO} alt="KEMA — Advanced · Quality · Oriented" />
        <p className="land__subtitle">美容師のための施術カルテ</p>
        <div className="land__by">
          <span className="land__by-rule" />
          <span className="land__by-name">KEMA PRO SHOP</span>
          <span className="land__by-rule" />
        </div>
      </div>

      <div className="land__menu">
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
