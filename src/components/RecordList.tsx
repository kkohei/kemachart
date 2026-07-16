import { useMemo, useState } from "react";
import type { DamageLevel, TreatmentRecord } from "../types";
import { DAMAGE_LEVELS } from "../constants";
import { formatJP } from "../utils/date";
import { navigate } from "../hooks/useHashRoute";
import { DamageBadge } from "./DamageBadge";

export function RecordList({ records }: { records: TreatmentRecord[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<DamageLevel | "all">("all");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return records.filter((r) => {
      if (filter !== "all" && r.damageBefore !== filter) return false;
      if (!kw) return true;
      return (
        r.customerName.toLowerCase().includes(kw) ||
        r.menu.toLowerCase().includes(kw) ||
        (r.memo ?? "").toLowerCase().includes(kw) ||
        r.recipe.some((s) => s.product.toLowerCase().includes(kw))
      );
    });
  }, [records, q, filter]);

  if (records.length === 0) {
    return (
      <div className="empty">
        <div className="empty__icon">✂️</div>
        <h2 className="empty__title">まだ記録がありません</h2>
        <p className="empty__text">
          最初のKEMA施術を記録しましょう。ダメージレベル・レシピ・ビフォーアフター写真をまとめて残せます。
        </p>
        <button className="btn btn--primary" onClick={() => navigate("#/new")}>
          ＋ 施術を記録する
        </button>
      </div>
    );
  }

  return (
    <div className="list">
      <div className="list__controls">
        <input
          className="input list__search"
          placeholder="お客様名・メニュー・薬剤で検索"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="chips">
          <button
            className={`chip ${filter === "all" ? "is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            すべて
          </button>
          {DAMAGE_LEVELS.map((d) => (
            <button
              key={d.level}
              className={`chip ${filter === d.level ? "is-active" : ""}`}
              style={filter === d.level ? { backgroundColor: d.color, borderColor: d.color, color: "#fff" } : undefined}
              onClick={() => setFilter(d.level)}
            >
              {d.short}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="list__none">条件に合う記録が見つかりませんでした。</p>
      ) : (
        <ul className="record-cards">
          {filtered.map((r) => (
            <li key={r.id}>
              <button className="record-card" onClick={() => navigate(`#/record/${r.id}`)}>
                <div className="record-card__thumb">
                  {r.beforePhotos[0] ? (
                    <img src={r.beforePhotos[0]} alt="" />
                  ) : (
                    <span className="record-card__noimg">No Photo</span>
                  )}
                </div>
                <div className="record-card__body">
                  <div className="record-card__row">
                    <span className="record-card__menu">{r.menu}</span>
                    <DamageBadge level={r.damageBefore} size="sm" />
                  </div>
                  <div className="record-card__name">
                    {r.customerName || "お客様"}
                  </div>
                  <div className="record-card__date">{formatJP(r.date)}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
