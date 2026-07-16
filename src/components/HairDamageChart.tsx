import type { DamageLevel, DamageProfile } from "../types";
import { DAMAGE_LEVELS, SECTIONS, damageDef } from "../constants";
import { avgDamage, damageCode, maxDamage } from "../utils/damage";

/** 毛束ダイアグラム: 根元(上)→毛先(下)の5セクションを色で表示 */
export function HairStrand({
  profile,
  width = 68,
  showNumbers = true,
  active,
  onPick,
}: {
  profile: DamageProfile;
  width?: number;
  showNumbers?: boolean;
  /** 選択中セクション (入力時のハイライト) */
  active?: number;
  /** セクションをタップした時 */
  onPick?: (index: number) => void;
}) {
  return (
    <div className="strand" style={{ width }}>
      {profile.map((lv, i) => {
        const def = damageDef(lv);
        const Tag = onPick ? "button" : "div";
        return (
          <Tag
            key={i}
            type={onPick ? "button" : undefined}
            className={`strand__seg ${active === i ? "is-active" : ""}`}
            style={{ background: def.color, color: def.text }}
            onClick={onPick ? () => onPick(i) : undefined}
            aria-label={onPick ? `${SECTIONS[i].label} (現在Lv.${lv})` : undefined}
          >
            {showNumbers && <span className="strand__num">{i + 1}</span>}
          </Tag>
        );
      })}
    </div>
  );
}

/** ダメージ測定の入力 (毛束ダイアグラム + セクションごとのレベル選択) */
export function DamageChartInput({
  profile,
  onChange,
}: {
  profile: DamageProfile;
  onChange: (next: DamageProfile) => void;
}) {
  function setSection(index: number, level: DamageLevel) {
    const next = [...profile] as DamageProfile;
    next[index] = level;
    onChange(next);
  }

  return (
    <div className="chart-input">
      <div className="chart-input__main">
        <div className="chart-input__strand">
          <HairStrand profile={profile} width={76} />
          <div className="chart-input__ends">
            <span>根元</span>
            <span>毛先</span>
          </div>
        </div>
        <div className="chart-input__rows">
          {SECTIONS.map((s) => (
            <div className="sec-row" key={s.index}>
              <span className="sec-row__label">
                <span className="sec-row__n">{s.index + 1}</span>
                {s.label}
              </span>
              <div className="sec-row__picker">
                {DAMAGE_LEVELS.map((d) => {
                  const active = profile[s.index] === d.level;
                  return (
                    <button
                      type="button"
                      key={d.level}
                      className={`lvl-dot ${active ? "is-active" : ""}`}
                      style={{ background: d.color, color: d.text }}
                      onClick={() => setSection(s.index, d.level)}
                      aria-pressed={active}
                      aria-label={`${s.label}をLv.${d.level}に`}
                    >
                      {d.level}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <DamageSummary profile={profile} />
    </div>
  );
}

/** ダメージコード・最大・平均のサマリー */
export function DamageSummary({ profile }: { profile: DamageProfile }) {
  const mx = damageDef(maxDamage(profile));
  return (
    <div className="dmg-summary">
      <span className="dmg-summary__code">
        コード <strong>{damageCode(profile)}</strong>
      </span>
      <span className="dmg-summary__badge" style={{ background: mx.color, color: mx.text }}>
        最大 {mx.short}
      </span>
      <span className="dmg-summary__avg">平均 {avgDamage(profile)}</span>
    </div>
  );
}
