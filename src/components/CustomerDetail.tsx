import type { TreatmentRecord } from "../types";
import { formatJP } from "../utils/date";
import { progression, recordsForCustomer } from "../utils/customer";
import { navigate } from "../hooks/useHashRoute";
import { ProgressionChart } from "./ProgressionChart";
import { RecordCard } from "./RecordCard";

/** お客様1人の来店履歴とダメージ推移 */
export function CustomerDetail({
  name,
  records,
}: {
  name: string;
  records: TreatmentRecord[];
}) {
  const chrono = recordsForCustomer(records, name); // 古い→新しい
  const points = progression(chrono);

  if (chrono.length === 0) {
    return (
      <div className="empty">
        <h2 className="empty__title">記録が見つかりません</h2>
        <button className="btn btn--primary" onClick={() => navigate("#/")}>
          一覧へ戻る
        </button>
      </div>
    );
  }

  const first = chrono[0].date;
  const last = chrono[chrono.length - 1].date;
  // 表示は新しい順
  const recent = [...chrono].reverse();

  return (
    <div className="detail">
      <div className="detail__head">
        <div>
          <div className="detail__menu">お客様</div>
          <div className="detail__name">{name}</div>
          <div className="detail__date">
            来店 {chrono.length}回 ・ {formatJP(first)}
            {chrono.length > 1 ? ` 〜 ${formatJP(last)}` : ""}
          </div>
        </div>
      </div>

      <section className="card">
        <h2 className="card__title">ダメージ推移 (来店時・後ろ)</h2>
        <ProgressionChart points={points} />
      </section>

      <section className="card">
        <h2 className="card__title">来店履歴</h2>
        <ul className="record-cards record-cards--tight">
          {recent.map((r) => (
            <li key={r.id}>
              <RecordCard record={r} hideName />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
