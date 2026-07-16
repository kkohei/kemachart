import { useState } from "react";
import type { DamageLevel, RecipeStep, TreatmentRecord } from "../types";
import { MENU_PRESETS } from "../constants";
import { todayISO } from "../utils/date";
import { uid } from "../utils/id";
import { navigate } from "../hooks/useHashRoute";
import { DamagePicker } from "./DamageBadge";
import { PhotoInput } from "./PhotoInput";
import { RecipeEditor } from "./RecipeEditor";

interface Props {
  initial?: TreatmentRecord;
  onSave: (rec: TreatmentRecord) => void;
}

export function RecordForm({ initial, onSave }: Props) {
  const isEdit = !!initial;
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [menu, setMenu] = useState(initial?.menu ?? MENU_PRESETS[0]);
  const [damageBefore, setDamageBefore] = useState<DamageLevel>(initial?.damageBefore ?? 3);
  const [damageAfter, setDamageAfter] = useState<DamageLevel | undefined>(initial?.damageAfter);
  const [damageNote, setDamageNote] = useState(initial?.damageNote ?? "");
  const [recipe, setRecipe] = useState<RecipeStep[]>(initial?.recipe ?? []);
  const [beforePhotos, setBeforePhotos] = useState<string[]>(initial?.beforePhotos ?? []);
  const [afterPhotos, setAfterPhotos] = useState<string[]>(initial?.afterPhotos ?? []);
  const [memo, setMemo] = useState(initial?.memo ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const now = Date.now();
    const rec: TreatmentRecord = {
      id: initial?.id ?? uid(),
      date,
      customerName: customerName.trim(),
      menu: menu.trim() || "KEMA施術",
      damageBefore,
      damageAfter,
      damageNote: damageNote.trim() || undefined,
      recipe: recipe
        .filter((s) => s.name.trim() || s.product.trim())
        .map((s) => ({ ...s, name: s.name.trim(), product: s.product.trim() })),
      beforePhotos,
      afterPhotos,
      memo: memo.trim() || undefined,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(rec);
    navigate(`#/record/${rec.id}`);
  }

  return (
    <form className="form" onSubmit={submit}>
      <section className="card">
        <div className="field">
          <label className="field__label" htmlFor="f-date">
            来店日
          </label>
          <input
            id="f-date"
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="f-name">
            お客様名 <span className="field__hint">(任意・ニックネーム可)</span>
          </label>
          <input
            id="f-name"
            className="input"
            placeholder="例: Aさま"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="f-menu">
            メニュー
          </label>
          <input
            id="f-menu"
            className="input"
            list="menu-presets"
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
          />
          <datalist id="menu-presets">
            {MENU_PRESETS.map((m) => (
              <option value={m} key={m} />
            ))}
          </datalist>
        </div>
      </section>

      <section className="card">
        <h2 className="card__title">ダメージレベル測定</h2>
        <div className="field">
          <label className="field__label">来店時 (施術前)</label>
          <DamagePicker value={damageBefore} onChange={(v) => v && setDamageBefore(v)} />
        </div>
        <div className="field">
          <label className="field__label">
            施術後 <span className="field__hint">(任意)</span>
          </label>
          <DamagePicker value={damageAfter} onChange={setDamageAfter} allowClear />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="f-dnote">
            測定所見メモ
          </label>
          <textarea
            id="f-dnote"
            className="input textarea"
            placeholder="例: 中間から毛先にかけて多孔質。濡らすと弾力低下。"
            rows={2}
            value={damageNote}
            onChange={(e) => setDamageNote(e.target.value)}
          />
        </div>
      </section>

      <section className="card">
        <h2 className="card__title">レシピ</h2>
        <RecipeEditor steps={recipe} onChange={setRecipe} />
      </section>

      <section className="card">
        <h2 className="card__title">ビフォー・アフター写真</h2>
        <PhotoInput label="ビフォー" photos={beforePhotos} onChange={setBeforePhotos} />
        <PhotoInput label="アフター" photos={afterPhotos} onChange={setAfterPhotos} />
      </section>

      <section className="card">
        <div className="field">
          <label className="field__label" htmlFor="f-memo">
            振り返りメモ
          </label>
          <textarea
            id="f-memo"
            className="input textarea"
            placeholder="仕上がりの手触り、次回への申し送りなど"
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </section>

      <div className="form__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => navigate(isEdit && initial ? `#/record/${initial.id}` : "#/")}
        >
          キャンセル
        </button>
        <button type="submit" className="btn btn--primary">
          {isEdit ? "更新する" : "保存する"}
        </button>
      </div>
    </form>
  );
}
