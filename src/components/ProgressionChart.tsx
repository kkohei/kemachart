import type { DamageLevel } from "../types";
import { damageDef } from "../constants";
import type { ProgressionPoint } from "../utils/customer";

/**
 * ダメージ推移グラフ (来店時=施術前・後ろの状態)。
 * 縦軸: 下=Lv.1(健康) 〜 上=Lv.5(ダメージ)。線が下がるほど改善。
 */
export function ProgressionChart({ points }: { points: ProgressionPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="prog-empty">
        来店が2回以上になると、ダメージの推移グラフが表示されます。
      </p>
    );
  }

  const W = 320;
  const H = 150;
  const padL = 26;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const x = (i: number) => padL + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  // level 1 → 下, level 5 → 上
  const y = (lv: number) => padT + ((5 - lv) / 4) * plotH;

  const avgPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.avg).toFixed(1)}`).join(" ");

  return (
    <div className="prog">
      <svg viewBox={`0 0 ${W} ${H}`} className="prog__svg" role="img" aria-label="ダメージ推移グラフ">
        {/* グリッド線 (Lv.1〜5) */}
        {[1, 2, 3, 4, 5].map((lv) => (
          <g key={lv}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(lv)}
              y2={y(lv)}
              stroke="var(--line)"
              strokeWidth={1}
              strokeDasharray={lv === 1 || lv === 5 ? "0" : "3 3"}
            />
            <text x={4} y={y(lv) + 4} className="prog__ytick">
              {lv}
            </text>
          </g>
        ))}

        {/* 平均ダメージの折れ線 */}
        <path d={avgPath} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {/* 各来店の点 (最大ダメージの色) */}
        {points.map((p, i) => {
          const def = damageDef(Math.round(p.max) as DamageLevel);
          return (
            <circle
              key={i}
              cx={x(i)}
              cy={y(p.avg)}
              r={5}
              fill={def.color}
              stroke="#fff"
              strokeWidth={2}
            />
          );
        })}
      </svg>
      <div className="prog__legend">
        <span className="prog__legend-line">— 平均ダメージ</span>
        <span className="prog__legend-dot">● 点の色 = その回の最大ダメージ</span>
      </div>
      <div className="prog__axis-note">下ほど健康 (Lv.1) ・ 上ほどダメージ (Lv.5)</div>
    </div>
  );
}
