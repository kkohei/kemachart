import type { RecipeStep } from "../types";
import { STEP_NAME_PRESETS } from "../constants";
import { uid } from "../utils/id";

/** レシピ工程の追加・編集・並び替え */
export function RecipeEditor({
  steps,
  onChange,
}: {
  steps: RecipeStep[];
  onChange: (next: RecipeStep[]) => void;
}) {
  function update(id: string, patch: Partial<RecipeStep>) {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function add() {
    onChange([...steps, { id: uid(), name: "", product: "" }]);
  }
  function remove(id: string) {
    onChange(steps.filter((s) => s.id !== id));
  }
  function move(id: string, dir: -1 | 1) {
    const i = steps.findIndex((s) => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="recipe-editor">
      {steps.length === 0 && (
        <p className="recipe-editor__empty">工程を追加してレシピを記録しましょう。</p>
      )}
      {steps.map((s, i) => (
        <div className="recipe-step" key={s.id}>
          <div className="recipe-step__top">
            <span className="recipe-step__idx">{i + 1}</span>
            <input
              className="recipe-step__name"
              list="step-presets"
              placeholder="工程名 (例: 1剤)"
              value={s.name}
              onChange={(e) => update(s.id, { name: e.target.value })}
            />
            <div className="recipe-step__moves">
              <button type="button" onClick={() => move(s.id, -1)} disabled={i === 0} aria-label="上へ">
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(s.id, 1)}
                disabled={i === steps.length - 1}
                aria-label="下へ"
              >
                ↓
              </button>
              <button
                type="button"
                className="recipe-step__del"
                onClick={() => remove(s.id)}
                aria-label="工程を削除"
              >
                ×
              </button>
            </div>
          </div>
          <textarea
            className="recipe-step__product"
            placeholder="使用薬剤・製品 (例: KEMA base + water 1:1)"
            rows={2}
            value={s.product}
            onChange={(e) => update(s.id, { product: e.target.value })}
          />
          <div className="recipe-step__meta">
            <label className="recipe-step__min">
              放置
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={s.minutes ?? ""}
                onChange={(e) =>
                  update(s.id, {
                    minutes: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
              分
            </label>
            <input
              className="recipe-step__note"
              placeholder="メモ (任意)"
              value={s.note ?? ""}
              onChange={(e) => update(s.id, { note: e.target.value })}
            />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--ghost recipe-editor__add" onClick={add}>
        ＋ 工程を追加
      </button>
      <datalist id="step-presets">
        {STEP_NAME_PRESETS.map((n) => (
          <option value={n} key={n} />
        ))}
      </datalist>
    </div>
  );
}
