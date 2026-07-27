import { useState } from "react";
import type { RecipePart, RecipeStep } from "../types";
import { RECIPE_PARTS, STEP_PRESETS_BY_PART, recipePartOf } from "../constants";
import { uid } from "../utils/id";

const CUSTOM = "__custom__";

/** レシピ工程の編集。クリニック/デザイン/ケアの3パートで構成。 */
export function RecipeEditor({
  steps,
  onChange,
}: {
  steps: RecipeStep[];
  onChange: (next: RecipeStep[]) => void;
}) {
  const [customIds, setCustomIds] = useState<Set<string>>(new Set());
  const setCustom = (id: string, on: boolean) =>
    setCustomIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  function update(id: string, patch: Partial<RecipeStep>) {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function add(part: RecipePart) {
    onChange([...steps, { id: uid(), part, name: "", product: "" }]);
  }
  function remove(id: string) {
    setCustom(id, false);
    onChange(steps.filter((s) => s.id !== id));
  }
  /** 同じパート内で並び替え */
  function move(id: string, dir: -1 | 1) {
    const target = steps.find((s) => s.id === id);
    if (!target) return;
    const part = recipePartOf(target);
    const group = steps.filter((s) => recipePartOf(s) === part);
    const gi = group.findIndex((s) => s.id === id);
    const gj = gi + dir;
    if (gj < 0 || gj >= group.length) return;
    [group[gi], group[gj]] = [group[gj], group[gi]];
    let k = 0;
    onChange(steps.map((s) => (recipePartOf(s) === part ? group[k++] : s)));
  }

  return (
    <div className="recipe-editor">
      {RECIPE_PARTS.map((part) => {
        const group = steps.filter((s) => recipePartOf(s) === part.key);
        return (
          <div className={`recipe-part recipe-part--${part.key}`} key={part.key}>
            <div className="recipe-part__head">{part.label}</div>

            {group.length === 0 && <p className="recipe-part__empty">工程なし</p>}

            {group.map((s, i) => {
              const custom = customIds.has(s.id);
              const presets = STEP_PRESETS_BY_PART[part.key];
              const isPreset = presets.includes(s.name);
              return (
                <div className="recipe-step" key={s.id}>
                  <div className="recipe-step__top">
                    <span className="recipe-step__idx">{i + 1}</span>

                    {custom ? (
                      <div className="recipe-step__name-wrap">
                        <input
                          className="recipe-step__name"
                          autoFocus
                          placeholder="工程名を入力"
                          value={s.name}
                          onChange={(e) => update(s.id, { name: e.target.value })}
                        />
                        <button
                          type="button"
                          className="recipe-step__name-toggle"
                          onClick={() => setCustom(s.id, false)}
                        >
                          候補
                        </button>
                      </div>
                    ) : (
                      <select
                        className="recipe-step__name recipe-step__name--select"
                        value={s.name}
                        onChange={(e) => {
                          if (e.target.value === CUSTOM) setCustom(s.id, true);
                          else update(s.id, { name: e.target.value });
                        }}
                      >
                        <option value="">工程名を選択</option>
                        {presets.map((n) => (
                          <option value={n} key={n}>
                            {n}
                          </option>
                        ))}
                        {s.name && !isPreset && <option value={s.name}>{s.name}</option>}
                        <option value={CUSTOM}>＋ 自由入力…</option>
                      </select>
                    )}

                    <div className="recipe-step__moves">
                      <button type="button" onClick={() => move(s.id, -1)} disabled={i === 0} aria-label="上へ">
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(s.id, 1)}
                        disabled={i === group.length - 1}
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
                    placeholder="メモ（薬剤・手順・温度など）"
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
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className="btn btn--ghost recipe-part__add"
              onClick={() => add(part.key)}
            >
              ＋ {part.short}に工程を追加
            </button>
          </div>
        );
      })}
    </div>
  );
}
