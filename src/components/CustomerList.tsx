import type { TreatmentRecord } from "../types";
import { formatJP } from "../utils/date";
import { damageCode } from "../utils/damage";
import { groupByCustomer } from "../utils/customer";
import { navigate } from "../hooks/useHashRoute";
import { HairStrand } from "./HairDamageChart";
import { PhotoImg } from "./PhotoImg";

/** お客様の一覧 (来店回数・最終来店・最新ダメージコード) */
export function CustomerList({ records }: { records: TreatmentRecord[] }) {
  const groups = groupByCustomer(records);

  if (groups.length === 0) {
    return (
      <p className="list__none">
        お客様名を入力した記録がまだありません。記録にお客様名を追加すると、ここに来店履歴がまとまります。
      </p>
    );
  }

  return (
    <ul className="record-cards">
      {groups.map((g) => {
        const latest = g.records[0];
        return (
          <li key={g.name}>
            <button
              className="record-card"
              onClick={() => navigate(`#/customer/${encodeURIComponent(g.name)}`)}
            >
              <div className="record-card__thumb">
                {latest.beforePhotos[0] ? (
                  <PhotoImg src={latest.beforePhotos[0]} alt="" />
                ) : (
                  <HairStrand profile={latest.damageBefore} width={40} showNumbers={false} />
                )}
              </div>
              <div className="record-card__body">
                <div className="record-card__row">
                  <span className="record-card__menu">{g.name}</span>
                  <span className="customer-visits">{g.records.length}回</span>
                </div>
                <div className="record-card__meta">
                  <span className="record-card__code">最新 {damageCode(latest.damageBefore)}</span>
                  <span className="record-card__date">{formatJP(g.lastVisit)}</span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
