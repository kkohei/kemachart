import { useState } from "react";
import type { TreatmentRecord } from "../types";
import { damageDef } from "../constants";
import { formatJP } from "../utils/date";
import { navigate } from "../hooks/useHashRoute";
import { DamageBadge } from "./DamageBadge";
import { ShareButtons } from "./ShareButtons";

export function RecordDetail({
  record,
  onDelete,
}: {
  record: TreatmentRecord;
  onDelete: (id: string) => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const before = damageDef(record.damageBefore);

  function handleDelete() {
    if (confirm("この記録を削除しますか？この操作は取り消せません。")) {
      onDelete(record.id);
      navigate("#/");
    }
  }

  return (
    <div className="detail">
      <div className="detail__head">
        <div>
          <div className="detail__menu">{record.menu}</div>
          <div className="detail__name">{record.customerName || "お客様"}</div>
          <div className="detail__date">{formatJP(record.date)}</div>
        </div>
      </div>

      <section className="card">
        <h2 className="card__title">ダメージレベル</h2>
        <div className="detail__damage">
          <DamageBadge level={record.damageBefore} />
          {record.damageAfter && (
            <>
              <span className="detail__arrow">→</span>
              <DamageBadge level={record.damageAfter} />
            </>
          )}
        </div>
        <p className="detail__damage-desc">{before.description}</p>
        {record.damageNote && <p className="detail__note">{record.damageNote}</p>}
      </section>

      {(record.beforePhotos.length > 0 || record.afterPhotos.length > 0) && (
        <section className="card">
          <h2 className="card__title">ビフォー・アフター</h2>
          <div className="ba">
            <BAColumn label="Before" photos={record.beforePhotos} onOpen={setLightbox} />
            <BAColumn label="After" photos={record.afterPhotos} onOpen={setLightbox} />
          </div>
        </section>
      )}

      {record.recipe.length > 0 && (
        <section className="card">
          <h2 className="card__title">レシピ</h2>
          <ol className="recipe-view">
            {record.recipe.map((s, i) => (
              <li className="recipe-view__item" key={s.id}>
                <span className="recipe-view__idx">{i + 1}</span>
                <div className="recipe-view__body">
                  <div className="recipe-view__line">
                    <span className="recipe-view__name">{s.name || "工程"}</span>
                    {typeof s.minutes === "number" && (
                      <span className="recipe-view__min">{s.minutes}分</span>
                    )}
                  </div>
                  <div className="recipe-view__product">{s.product}</div>
                  {s.note && <div className="recipe-view__note">{s.note}</div>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {record.memo && (
        <section className="card">
          <h2 className="card__title">振り返りメモ</h2>
          <p className="detail__memo">{record.memo}</p>
        </section>
      )}

      <section className="card">
        <h2 className="card__title">友達・仲間に共有</h2>
        <ShareButtons record={record} />
      </section>

      <div className="detail__actions">
        <button className="btn btn--ghost" onClick={() => navigate(`#/edit/${record.id}`)}>
          編集
        </button>
        <button className="btn btn--danger" onClick={handleDelete}>
          削除
        </button>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="拡大写真" />
          <button className="lightbox__close" aria-label="閉じる">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function BAColumn({
  label,
  photos,
  onOpen,
}: {
  label: string;
  photos: string[];
  onOpen: (src: string) => void;
}) {
  return (
    <div className="ba__col">
      <div className="ba__label">{label}</div>
      {photos.length === 0 ? (
        <div className="ba__empty">なし</div>
      ) : (
        <div className="ba__photos">
          {photos.map((p, i) => (
            <button className="ba__photo" key={i} onClick={() => onOpen(p)}>
              <img src={p} alt={`${label} ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
