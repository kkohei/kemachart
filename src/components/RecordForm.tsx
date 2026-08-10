import { useState } from "react";
import type {
  AreaMeasurement,
  DamageProfile,
  HeadAreaKey,
  RecipeStep,
  TitledPhoto,
  TreatmentRecord,
} from "../types";
import { EXTRA_AREAS, MAX_PHOTOS_PER_RECORD, MENU_PRESETS, areaDef } from "../constants";
import { MenuPicker } from "./MenuPicker";
import { todayISO } from "../utils/date";
import { uid } from "../utils/id";
import { defaultProfile, uniformProfile } from "../utils/damage";
import { deletePhoto, internRecordPhotos, photoRefsOf } from "../utils/photoStore";
import { navigate } from "../hooks/useHashRoute";
import type { KemaMenuDef } from "../data/kemaMenus";
import { DamageChartInput } from "./HairDamageChart";
import { ExtraPhotoInput } from "./ExtraPhotoInput";
import { MenuRecommend } from "./MenuRecommend";
import { PhotoInput } from "./PhotoInput";
import { RecipeEditor } from "./RecipeEditor";

interface Props {
  initial?: TreatmentRecord;
  onSave: (rec: TreatmentRecord) => void;
}

export function RecordForm({ initial, onSave }: Props) {
  const isEdit = !!initial;
  const isDraft = initial?.status === "draft";
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [menu, setMenu] = useState(initial?.menu ?? MENU_PRESETS[0]);
  const [damageBefore, setDamageBefore] = useState<DamageProfile>(
    initial?.damageBefore ?? defaultProfile(),
  );
  const [afterEnabled, setAfterEnabled] = useState<boolean>(!!initial?.damageAfter);
  const [damageAfter, setDamageAfter] = useState<DamageProfile>(
    initial?.damageAfter ?? uniformProfile(1),
  );
  const [extraAreas, setExtraAreas] = useState<AreaMeasurement[]>(initial?.extraAreas ?? []);
  const [damageNote, setDamageNote] = useState(initial?.damageNote ?? "");
  const [recipe, setRecipe] = useState<RecipeStep[]>(initial?.recipe ?? []);

  function addArea(area: HeadAreaKey) {
    setExtraAreas((prev) => [...prev, { area, before: defaultProfile() }]);
  }
  function removeArea(area: HeadAreaKey) {
    setExtraAreas((prev) => prev.filter((a) => a.area !== area));
  }
  function setAreaBefore(area: HeadAreaKey, before: DamageProfile) {
    setExtraAreas((prev) => prev.map((a) => (a.area === area ? { ...a, before } : a)));
  }
  function setAreaAfter(area: HeadAreaKey, after: DamageProfile) {
    setExtraAreas((prev) => prev.map((a) => (a.area === area ? { ...a, after } : a)));
  }
  const availableAreas = EXTRA_AREAS.filter((d) => !extraAreas.some((a) => a.area === d.key));
  const [beforePhotos, setBeforePhotos] = useState<string[]>(initial?.beforePhotos ?? []);
  const [afterPhotos, setAfterPhotos] = useState<string[]>(initial?.afterPhotos ?? []);
  const [extraPhotos, setExtraPhotos] = useState<TitledPhoto[]>(initial?.extraPhotos ?? []);
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [saving, setSaving] = useState(false);

  /** 提案メニューのレシピテンプレートをフォームに反映 */
  function applyKemaMenu(def: KemaMenuDef) {
    const hasContent = recipe.some((s) => s.name.trim() || s.product.trim());
    if (hasContent && !confirm(`レシピを「${def.name}」の標準手順で置き換えますか？`)) {
      return;
    }
    // メニュー種別に応じて大枠パートを割り当て (クリニック=clinic / ブリーチ・根元=design)
    const part: "clinic" | "design" | "care" = def.id === "clinic" ? "clinic" : "design";
    setMenu(def.name);
    setRecipe(
      def.steps.map((s) => ({
        id: uid(),
        part,
        name: s.name,
        // メモ欄に薬剤・手順＋温度メモをまとめて入れる
        product: s.note ? `${s.product}\n${s.note}` : s.product,
        minutes: s.minutes,
      })),
    );
  }

  function build(status: "draft" | "done"): TreatmentRecord {
    const now = Date.now();
    return {
      id: initial?.id ?? uid(),
      date,
      customerName: customerName.trim(),
      menu: menu.trim() || "KEMA施術",
      damageBefore,
      damageAfter: afterEnabled ? damageAfter : undefined,
      extraAreas: extraAreas.length
        ? extraAreas.map((a) => ({
            area: a.area,
            before: a.before,
            after: afterEnabled ? (a.after ?? uniformProfile(1)) : undefined,
          }))
        : undefined,
      damageNote: damageNote.trim() || undefined,
      recipe: recipe
        .filter((s) => s.name.trim() || s.product.trim())
        .map((s) => ({ ...s, name: s.name.trim(), product: s.product.trim() })),
      beforePhotos,
      afterPhotos,
      extraPhotos: extraPhotos.length
        ? extraPhotos.map((p) => ({ ...p, title: p.title.trim() }))
        : undefined,
      memo: memo.trim() || undefined,
      status,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
  }

  /** 写真を写真ストアへ保存 (参照化) してから記録を確定する */
  async function persist(status: "draft" | "done", to: (rec: TreatmentRecord) => string) {
    if (saving) return;
    setSaving(true);
    try {
      const rec = await internRecordPhotos(build(status));
      // 編集で外した写真をストアからも削除
      if (initial) {
        const kept = photoRefsOf([rec]);
        for (const ref of photoRefsOf([initial])) {
          if (!kept.has(ref)) void deletePhoto(ref);
        }
      }
      onSave(rec);
      navigate(to(rec));
    } catch (e) {
      alert(`保存に失敗しました: ${(e as Error).message ?? "不明なエラー"}`);
    } finally {
      setSaving(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    void persist("done", (rec) => `#/record/${rec.id}`);
  }

  function saveDraft() {
    void persist("draft", () => "#/records");
  }

  return (
    <form className="form" onSubmit={submit}>
      <section className="card">
        <div className="field">
          <label className="field__label" htmlFor="f-date">
            来店日 <span className="field__hint">(タップでカレンダー選択)</span>
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
          <label className="field__label">メニュー</label>
          <MenuPicker value={menu} onChange={setMenu} />
        </div>
      </section>

      <section className="card">
        <h2 className="card__title">ダメージレベル測定</h2>
        <p className="card__note">
          根元から毛先まで5セクションに分け、各セクションを Lv.1〜5 で測定します。原則は「後ろ
          (バック)」のみ。必要に応じて他の部位も追加できます。
        </p>
        <div className="field">
          <label className="field__label">後ろ (バック)・来店時 (施術前)</label>
          <DamageChartInput profile={damageBefore} onChange={setDamageBefore} />
        </div>
        <div className="field">
          <label className="field__label toggle-label">
            <input
              type="checkbox"
              checked={afterEnabled}
              onChange={(e) => setAfterEnabled(e.target.checked)}
            />
            施術後も記録する (全部位に適用)
          </label>
          {afterEnabled && (
            <>
              <div className="area-card__sub">後ろ (バック)・施術後</div>
              <DamageChartInput profile={damageAfter} onChange={setDamageAfter} />
            </>
          )}
        </div>

        {extraAreas.map((a) => (
          <div className="area-card" key={a.area}>
            <div className="area-card__head">
              <span className="area-card__title">{areaDef(a.area).label}</span>
              <button
                type="button"
                className="area-card__remove"
                onClick={() => removeArea(a.area)}
              >
                削除
              </button>
            </div>
            <div className="area-card__sub">施術前</div>
            <DamageChartInput profile={a.before} onChange={(p) => setAreaBefore(a.area, p)} />
            {afterEnabled && (
              <>
                <div className="area-card__sub">施術後</div>
                <DamageChartInput
                  profile={a.after ?? uniformProfile(1)}
                  onChange={(p) => setAreaAfter(a.area, p)}
                />
              </>
            )}
          </div>
        ))}

        {availableAreas.length > 0 && (
          <div className="area-add">
            <span className="area-add__label">部位を追加 (任意)</span>
            <div className="area-add__btns">
              {availableAreas.map((d) => (
                <button
                  type="button"
                  key={d.key}
                  className="btn btn--ghost area-add__btn"
                  onClick={() => addArea(d.key)}
                >
                  ＋ {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

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
        <h2 className="card__title">おすすめメニュー提案</h2>
        <MenuRecommend profile={damageBefore} onApply={applyKemaMenu} />
      </section>

      <section className="card">
        <h2 className="card__title">レシピ</h2>
        <RecipeEditor steps={recipe} onChange={setRecipe} />
      </section>

      <section className="card">
        <h2 className="card__title">ビフォー・アフター写真</h2>
        <p className="card__note">写真は1件の記録につき合計{MAX_PHOTOS_PER_RECORD}枚まで保存できます。</p>
        <PhotoInput
          label="ビフォー"
          photos={beforePhotos}
          remaining={MAX_PHOTOS_PER_RECORD - beforePhotos.length - afterPhotos.length}
          onChange={setBeforePhotos}
        />
        <PhotoInput
          label="アフター"
          photos={afterPhotos}
          remaining={MAX_PHOTOS_PER_RECORD - beforePhotos.length - afterPhotos.length}
          onChange={setAfterPhotos}
        />
      </section>

      <section className="card">
        <h2 className="card__title">その他の写真</h2>
        <p className="card__note">
          施術中の様子など、タイトルを付けて残せます（最大5枚・ビフォーアフターとは別枠）。
        </p>
        <ExtraPhotoInput photos={extraPhotos} onChange={setExtraPhotos} />
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

      <div className="form__actions form__actions--stack">
        <div className="form__actions-row">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate(isEdit && initial ? `#/record/${initial.id}` : "#/records")}
          >
            キャンセル
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "保存中…" : isDraft ? "確定して保存" : isEdit ? "更新する" : "保存する"}
          </button>
        </div>
        <button
          type="button"
          className="btn btn--soft form__draft"
          onClick={saveDraft}
          disabled={saving}
        >
          {saving ? "保存中…" : isDraft ? "下書きのまま保存" : "仮保存（下書き）"}
        </button>
      </div>
    </form>
  );
}
