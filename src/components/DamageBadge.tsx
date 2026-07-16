import type { DamageLevel } from "../types";
import { damageDef } from "../constants";

/** 単一レベルのバッジ (一覧カードなどで使用) */
export function DamageBadge({ level, size = "md" }: { level: DamageLevel; size?: "sm" | "md" }) {
  const def = damageDef(level);
  return (
    <span
      className={`damage-badge ${size === "sm" ? "damage-badge--sm" : ""}`}
      style={{ backgroundColor: def.color, color: def.text }}
      title={def.description}
    >
      {def.label}
    </span>
  );
}
