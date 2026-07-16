import { useState } from "react";
import type { DamageProfile, TreatmentRecord } from "../types";
import { AREA_BACK, SECTIONS, areaDef, damageDef } from "../constants";
import { formatJP } from "../utils/date";
import { navigate } from "../hooks/useHashRoute";
import { HairStrand, DamageSummary } from "./HairDamageChart";
import { ShareButtons } from "./ShareButtons";

export function RecordDetail({
  record,
  onDelete,
}: {
  record: TreatmentRecord;
  onDelete: (id: string) => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);

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
        <h2 className="card__title">ダメージレベル (根元→毛先)</h2>
        <AreaDamage
          title={AREA_BACK.label}
          before={record.damageBefore}
          after={record.damageAfter}
        />
        {record.extraAreas?.map((a) => (
          <AreaDamage
            key={a.area}
            title={areaDef(a.area).label}
            before={a.before}
            after={a.after}
            divided
          />
        ))}
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

function AreaDamage({
  title,
  before,
  after,
  divided,
}: {
  title: string;
  before: DamageProfile;
  after?: DamageProfile;
  divided?: boolean;
}) {
  return (
    <div className={`area-damage ${divided ? "area-damage--divided" : ""}`}>
      <div className="area-damage__title">{title}</div>
      <div className={`dmg-view ${after ? "dmg-view--pair" : ""}`}>
        <DamageProfileView label="施術前" profile={before} />
        {after && <DamageProfileView label="施術後" profile={after} />}
      </div>
    </div>
  );
}

function DamageProfileView({ label, profile }: { label: string; profile: DamageProfile }) {
  return (
    <div className="dmg-view__col">
      <div className="dmg-view__label">{label}</div>
      <div className="dmg-view__body">
        <HairStrand profile={profile} width={64} />
        <ul className="dmg-view__list">
          {SECTIONS.map((s) => {
            const def = damageDef(profile[s.index]);
            return (
              <li key={s.index}>
                <span className="dmg-view__sec">{s.label}</span>
                <span
                  className="dmg-view__lvl"
                  style={{ background: def.color, color: def.text }}
                >
                  {def.short}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <DamageSummary profile={profile} />
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
