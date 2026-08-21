import { useEffect, useMemo, useState } from "react";
import { TENPAN_CATEGORIES, TENPAN_PRODUCTS } from "../data/tenpanManual";

/**
 * 注文金額シミュレーター。
 * 店販商品の数量を選ぶと、サロン金額 (小売価格 × 掛け率) ベースで
 * 仕入れ合計を試算できる。参考として小売合計・粗利見込みも表示。
 * 掛け率と数量は端末に保存され、次回開いたときも残る。
 */

const QTY_KEY = "kemachart.orderSim.qty.v1";
const RATE_KEY = "kemachart.orderSim.rate.v1";
const DEFAULT_RATE = 60;

/** "¥9,020" → 9020 */
function yen(price: string): number {
  return Number(price.replace(/[^0-9]/g, "")) || 0;
}

function fmt(n: number): string {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function loadQty(): Record<string, number> {
  try {
    const raw = localStorage.getItem(QTY_KEY);
    const obj = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    return typeof obj === "object" && obj ? obj : {};
  } catch {
    return {};
  }
}

function loadRate(): number {
  const n = Number(localStorage.getItem(RATE_KEY));
  return Number.isFinite(n) && n >= 1 && n <= 100 ? n : DEFAULT_RATE;
}

export function OrderSimulator() {
  const [qty, setQty] = useState<Record<string, number>>(loadQty);
  const [rate, setRate] = useState<number>(loadRate);

  useEffect(() => {
    try {
      localStorage.setItem(QTY_KEY, JSON.stringify(qty));
    } catch {
      // 保存失敗は無視 (試算は続けられる)
    }
  }, [qty]);

  useEffect(() => {
    try {
      localStorage.setItem(RATE_KEY, String(rate));
    } catch {
      // 無視
    }
  }, [rate]);

  function setCount(name: string, next: number) {
    const v = Math.max(0, Math.min(99, Math.floor(next)));
    setQty((prev) => {
      const copy = { ...prev };
      if (v === 0) delete copy[name];
      else copy[name] = v;
      return copy;
    });
  }

  /** サロン単価 (小売 × 掛け率) */
  const salonUnit = (price: string) => Math.round((yen(price) * rate) / 100);

  const summary = useMemo(() => {
    let items = 0;
    let count = 0;
    let salon = 0;
    let retail = 0;
    for (const p of TENPAN_PRODUCTS) {
      const q = qty[p.name] ?? 0;
      if (q <= 0) continue;
      items += 1;
      count += q;
      salon += salonUnit(p.price) * q;
      retail += yen(p.price) * q;
    }
    const profit = retail - salon;
    return { items, count, salon, retail, profit, profitRate: retail > 0 ? (profit / retail) * 100 : 0 };
  }, [qty, rate]);

  function buildOrderText(): string {
    const lines: string[] = ["【KEMA 注文シミュレーション】", `掛け率: ${rate}%`, ""];
    for (const p of TENPAN_PRODUCTS) {
      const q = qty[p.name] ?? 0;
      if (q <= 0) continue;
      lines.push(`・${p.name} ${p.size} ×${q} ＝ ${fmt(salonUnit(p.price) * q)}`);
    }
    lines.push("");
    lines.push(`仕入合計 (サロン金額): ${fmt(summary.salon)}`);
    lines.push(`参考小売合計: ${fmt(summary.retail)} ／ 粗利見込み: ${fmt(summary.profit)}`);
    return lines.join("\n");
  }

  async function copyOrder() {
    if (summary.count === 0) {
      alert("数量が入力されていません。商品ごとの「＋」で数量を選んでください。");
      return;
    }
    try {
      await navigator.clipboard.writeText(buildOrderText());
      alert("注文内容をコピーしました。LINEやメールに貼り付けて使えます。");
    } catch {
      alert("コピーできませんでした。");
    }
  }

  function clearAll() {
    if (summary.count === 0) return;
    if (confirm("入力した数量をすべてクリアしますか？")) setQty({});
  }

  return (
    <div className="osim">
      <section className="card">
        <h2 className="card__title">掛け率の設定</h2>
        <p className="card__note">
          サロン金額（仕入れ単価）＝ メーカー希望小売価格 × 掛け率 で計算します。
          ご契約の掛け率に合わせて調整してください（設定は保存されます）。
        </p>
        <div className="osim__rate">
          <div className="osim__rate-presets">
            {[50, 55, 60, 65, 70].map((r) => (
              <button
                type="button"
                key={r}
                className={`osim__preset ${rate === r ? "is-on" : ""}`}
                onClick={() => setRate(r)}
              >
                {r}%
              </button>
            ))}
          </div>
          <label className="osim__rate-custom">
            <span>手入力</span>
            <input
              type="number"
              className="input osim__rate-input"
              inputMode="numeric"
              min={1}
              max={100}
              value={rate}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n >= 1 && n <= 100) setRate(Math.round(n));
              }}
            />
            <span>%</span>
          </label>
        </div>
      </section>

      {TENPAN_CATEGORIES.map((cat) => {
        const products = TENPAN_PRODUCTS.filter((p) => p.category === cat.key);
        if (products.length === 0) return null;
        return (
          <section className="card" key={cat.key}>
            <h2 className="card__title">{cat.label}</h2>
            <ul className="osim__list">
              {products.map((p) => {
                const q = qty[p.name] ?? 0;
                const unit = salonUnit(p.price);
                return (
                  <li className={`osim__row ${q > 0 ? "is-active" : ""}`} key={p.name}>
                    <div className="osim__info">
                      <div className="osim__name">
                        {p.name} <span className="osim__size">{p.size}</span>
                      </div>
                      <div className="osim__prices">
                        <span className="osim__salon">サロン {fmt(unit)}</span>
                        <span className="osim__retail">小売 {p.price}</span>
                      </div>
                    </div>
                    <div className="osim__ctrl">
                      <button
                        type="button"
                        className="osim__step"
                        aria-label={`${p.name}を減らす`}
                        onClick={() => setCount(p.name, q - 1)}
                        disabled={q <= 0}
                      >
                        −
                      </button>
                      <span className="osim__qty">{q}</span>
                      <button
                        type="button"
                        className="osim__step"
                        aria-label={`${p.name}を増やす`}
                        onClick={() => setCount(p.name, q + 1)}
                      >
                        ＋
                      </button>
                    </div>
                    {q > 0 && <div className="osim__subtotal">{fmt(unit * q)}</div>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <section className="card osim__summary">
        <h2 className="card__title">試算結果</h2>
        <dl className="osim__totals">
          <div className="osim__total-row">
            <dt>商品数 / 数量</dt>
            <dd>
              {summary.items}品 / {summary.count}個
            </dd>
          </div>
          <div className="osim__total-row osim__total-row--main">
            <dt>注文金額 (サロン金額 {rate}%)</dt>
            <dd data-testid="osim-salon-total">{fmt(summary.salon)}</dd>
          </div>
          <div className="osim__total-row">
            <dt>参考: 小売合計</dt>
            <dd>{fmt(summary.retail)}</dd>
          </div>
          <div className="osim__total-row">
            <dt>参考: 店販粗利見込み</dt>
            <dd>
              {fmt(summary.profit)}（{summary.profitRate.toFixed(0)}%）
            </dd>
          </div>
        </dl>
        <p className="card__note">
          ※ メーカー希望小売価格（税込・2026年8月時点）をもとにした試算です。
          実際の仕入れ条件・送料等は取引条件をご確認ください。
        </p>
        <div className="osim__actions">
          <button type="button" className="btn btn--ghost" onClick={clearAll}>
            クリア
          </button>
          <button type="button" className="btn btn--primary" onClick={copyOrder}>
            注文内容をコピー
          </button>
        </div>
      </section>
    </div>
  );
}
