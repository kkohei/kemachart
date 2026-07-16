import { useEffect, useState } from "react";
import type { TreatmentRecord } from "../types";
import { navigate } from "../hooks/useHashRoute";
import { DataMenu } from "./DataMenu";
import { BgAurora, BgTechNet, BgSalon, BgFoil } from "./landing/Backgrounds";

type VariantId = "aurora" | "tech" | "salon" | "foil";

const VARIANTS: { id: VariantId; label: string }[] = [
  { id: "aurora", label: "① オーロラ" },
  { id: "tech", label: "② テック" },
  { id: "salon", label: "③ サロン" },
  { id: "foil", label: "④ フォイル" },
];

const KEY = "kemachart.landingVariant";
const LOGO = `${import.meta.env.BASE_URL}brand/kema-logo-white.png`;

/** トップ (ハブ) 画面。4つのデザイン案を切り替えて選べます。 */
export function Landing({
  records,
  onImport,
}: {
  records: TreatmentRecord[];
  onImport: (records: TreatmentRecord[]) => void;
}) {
  const [variant, setVariant] = useState<VariantId>(() => {
    const v = localStorage.getItem(KEY);
    return (VARIANTS.some((x) => x.id === v) ? v : "aurora") as VariantId;
  });
  useEffect(() => {
    localStorage.setItem(KEY, variant);
  }, [variant]);

  return (
    <div className={`land land--${variant}`}>
      {variant === "aurora" && <BgAurora />}
      {variant === "tech" && <BgTechNet />}
      {variant === "salon" && <BgSalon />}
      {variant === "foil" && <BgFoil />}

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

      <div className="land__switch" role="tablist" aria-label="デザイン案">
        <span className="land__switch-label">デザイン案</span>
        <div className="land__switch-btns">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={variant === v.id}
              className={`land__switch-btn ${variant === v.id ? "is-active" : ""}`}
              onClick={() => setVariant(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
