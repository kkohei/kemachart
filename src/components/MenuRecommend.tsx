import { useMemo, useState } from "react";
import type { DamageProfile } from "../types";
import type { KemaMenuDef } from "../data/kemaMenus";
import { SUITABILITY_LABEL, recommendMenus, type Suitability } from "../utils/recommend";
import { navigate } from "../hooks/useHashRoute";

const BADGE_STYLE: Record<Suitability, { bg: string; fg: string }> = {
  best: { bg: "#4c9a76", fg: "#fff" },
  ok: { bg: "#7bb662", fg: "#fff" },
  caution: { bg: "#e0a63c", fg: "#fff" },
  avoid: { bg: "#cf5757", fg: "#fff" },
};

/**
 * ダメージ測定に基づく KEMAメニュー提案。
 * メニューを選ぶと、マニュアル準拠のレシピをフォームに反映できます。
 */
export function MenuRecommend({
  profile,
  onApply,
}: {
  profile: DamageProfile;
  onApply: (menu: KemaMenuDef) => void;
}) {
  const recs = useMemo(() => recommendMenus(profile), [profile]);
  const [open, setOpen] = useState<string | null>(recs[0]?.menu.id ?? null);

  return (
    <div className="reco">
      <p className="reco__lead">
        測定したダメージ (根元→毛先 {profile.join("-")}) に基づく、KEMA湿熱システムのメニュー判定です。
      </p>
      {recs.map(({ menu, suitability, reasons }) => {
        const badge = BADGE_STYLE[suitability];
        const expanded = open === menu.id;
        return (
          <div className={`reco-item ${expanded ? "is-open" : ""}`} key={menu.id}>
            <button
              type="button"
              className="reco-item__head"
              onClick={() => setOpen(expanded ? null : menu.id)}
              aria-expanded={expanded}
            >
              <span className="reco-item__name">{menu.short}</span>
              <span className="reco-item__badge" style={{ background: badge.bg, color: badge.fg }}>
                {SUITABILITY_LABEL[suitability]}
              </span>
              <span className="reco-item__chev">{expanded ? "▴" : "▾"}</span>
            </button>
            {expanded && (
              <div className="reco-item__body">
                <p className="reco-item__desc">{menu.description}</p>
                {reasons.length > 0 && (
                  <ul className="reco-item__reasons">
                    {reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  className="btn btn--primary reco-item__apply"
                  onClick={() => onApply(menu)}
                  disabled={suitability === "avoid"}
                >
                  {suitability === "avoid" ? "非推奨のため適用不可" : "このレシピをフォームに入れる"}
                </button>
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="reco__guide" onClick={() => navigate("#/guide")}>
        📖 KEMAメニューガイド (手順・温度/タイム早見表) を見る
      </button>
    </div>
  );
}
