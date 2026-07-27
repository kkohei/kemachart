import type { TreatmentRecord } from "../types";
import { formatJP } from "../utils/date";
import { damageCode, maxDamage } from "../utils/damage";
import { navigate } from "../hooks/useHashRoute";
import { DamageBadge } from "./DamageBadge";
import { HairStrand } from "./HairDamageChart";

/** 一覧・お客様履歴で共通利用する施術記録カード */
export function RecordCard({ record: r, hideName }: { record: TreatmentRecord; hideName?: boolean }) {
  return (
    <button className="record-card" onClick={() => navigate(`#/record/${r.id}`)}>
      <div className="record-card__thumb">
        {r.beforePhotos[0] ? (
          <img src={r.beforePhotos[0]} alt="" />
        ) : (
          <HairStrand profile={r.damageBefore} width={40} showNumbers={false} />
        )}
      </div>
      <div className="record-card__body">
        <div className="record-card__row">
          <span className="record-card__menu">{r.menu}</span>
          {r.status === "draft" ? (
            <span className="draft-pill">下書き</span>
          ) : (
            <DamageBadge level={maxDamage(r.damageBefore)} size="sm" />
          )}
        </div>
        {!hideName && <div className="record-card__name">{r.customerName || "お客様"}</div>}
        <div className="record-card__meta">
          <span className="record-card__code">{damageCode(r.damageBefore)}</span>
          {r.extraAreas && r.extraAreas.length > 0 && (
            <span className="record-card__areas">＋{r.extraAreas.length}部位</span>
          )}
          <span className="record-card__date">{formatJP(r.date)}</span>
        </div>
      </div>
    </button>
  );
}
