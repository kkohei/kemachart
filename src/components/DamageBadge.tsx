import type { DamageLevel } from "../types";
import { damageDef } from "../constants";

export function DamageBadge({ level, size = "md" }: { level: DamageLevel; size?: "sm" | "md" }) {
  const def = damageDef(level);
  return (
    <span
      className={`damage-badge ${size === "sm" ? "damage-badge--sm" : ""}`}
      style={{ backgroundColor: def.color }}
      title={def.description}
    >
      {def.label}
    </span>
  );
}

/** ダメージ選択 (1〜5のセグメントボタン) */
export function DamagePicker({
  value,
  onChange,
  allowClear = false,
}: {
  value: DamageLevel | undefined;
  onChange: (v: DamageLevel | undefined) => void;
  allowClear?: boolean;
}) {
  return (
    <div className="damage-picker">
      {[1, 2, 3, 4, 5].map((n) => {
        const def = damageDef(n as DamageLevel);
        const active = value === n;
        return (
          <button
            type="button"
            key={n}
            className={`damage-picker__btn ${active ? "is-active" : ""}`}
            style={active ? { backgroundColor: def.color, borderColor: def.color } : undefined}
            onClick={() => onChange(allowClear && active ? undefined : (n as DamageLevel))}
            aria-pressed={active}
          >
            <span className="damage-picker__num">{n}</span>
            <span className="damage-picker__label">{def.short}</span>
          </button>
        );
      })}
    </div>
  );
}
