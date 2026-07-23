import { useState } from "react";
import { MENU_PRESETS } from "../constants";
import { useCustomMenus } from "../hooks/useCustomMenus";

const NEW = "__new__";

/**
 * メニューのプルダウン (ドロップダウン) 選択。
 * プリセット＋カスタムメニューを選択でき、「＋ 新しいメニューを作成」で追加できます。
 */
export function MenuPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const { menus: custom, add, remove } = useCustomMenus();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  // 選択肢: プリセット + カスタム + 現在値(未保存の場合) を重複なく
  const options = Array.from(
    new Set([...MENU_PRESETS, ...custom, ...(value ? [value] : [])]),
  );

  function handleSelect(v: string) {
    if (v === NEW) {
      setAdding(true);
      return;
    }
    onChange(v);
  }

  function commitAdd() {
    const n = draft.trim();
    if (!n) {
      setAdding(false);
      setDraft("");
      return;
    }
    add(n);
    onChange(n);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="menu-picker">
      <div className="select-wrap">
        <select
          className="input select"
          value={value}
          onChange={(e) => handleSelect(e.target.value)}
        >
          {options.map((name) => (
            <option value={name} key={name}>
              {name}
              {custom.includes(name) ? "（カスタム）" : ""}
            </option>
          ))}
          <option value={NEW}>＋ 新しいメニューを作成…</option>
        </select>
        <span className="select-wrap__chev" aria-hidden="true">▾</span>
      </div>

      {custom.includes(value) && (
        <button
          type="button"
          className="menu-picker__del"
          onClick={() => {
            if (confirm(`「${value}」を候補から削除しますか？\n(過去の記録は変わりません)`)) {
              remove(value);
              onChange(MENU_PRESETS[0]);
            }
          }}
        >
          このカスタムメニューを候補から削除
        </button>
      )}

      {adding && (
        <div className="menu-add">
          <input
            className="input"
            autoFocus
            placeholder="新しいメニュー名 (例: KEMA酸熱)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitAdd();
              }
            }}
          />
          <button type="button" className="btn btn--primary menu-add__ok" onClick={commitAdd}>
            追加
          </button>
          <button
            type="button"
            className="btn btn--ghost menu-add__cancel"
            onClick={() => {
              setAdding(false);
              setDraft("");
            }}
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
