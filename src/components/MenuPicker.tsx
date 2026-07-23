import { useState } from "react";
import { MENU_PRESETS } from "../constants";
import { useCustomMenus } from "../hooks/useCustomMenus";

/**
 * メニューの選択式ピッカー。
 * プリセット＋自分で追加したカスタムメニューをタップで選択。
 * 「＋ 新しいメニュー」で名前を追加でき、候補として保存されます。
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

  // 表示する候補: プリセット + カスタム + 現在値 (未保存の場合) を重複なく
  const options = Array.from(
    new Set([...MENU_PRESETS, ...custom, ...(value ? [value] : [])]),
  );
  const isCustom = (name: string) => custom.includes(name);

  function commitAdd() {
    const n = draft.trim();
    if (!n) {
      setAdding(false);
      return;
    }
    add(n);
    onChange(n);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="menu-picker">
      <div className="menu-chips">
        {options.map((name) => {
          const active = value === name;
          return (
            <span key={name} className={`menu-chip ${active ? "is-active" : ""}`}>
              <button type="button" className="menu-chip__label" onClick={() => onChange(name)}>
                {name}
              </button>
              {isCustom(name) && (
                <button
                  type="button"
                  className="menu-chip__del"
                  aria-label={`「${name}」を候補から削除`}
                  onClick={() => {
                    if (confirm(`「${name}」を候補から削除しますか？\n(過去の記録は変わりません)`)) {
                      remove(name);
                    }
                  }}
                >
                  ×
                </button>
              )}
            </span>
          );
        })}

        {!adding && (
          <button
            type="button"
            className="menu-chip menu-chip--add"
            onClick={() => setAdding(true)}
          >
            ＋ 新しいメニュー
          </button>
        )}
      </div>

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
