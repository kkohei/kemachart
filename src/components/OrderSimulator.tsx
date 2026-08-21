import { useEffect, useMemo, useState } from "react";
import type { ShopItem } from "../data/shopPrices";
import { SHOP_CATEGORIES, SHOP_ITEMS, setPrice } from "../data/shopPrices";

/**
 * 注文金額シミュレーター。
 * KEMA PRO SHOP の実サロン価格 (src/data/shopPrices.ts) をもとに、
 * セット数を選ぶだけで注文金額を試算できる。数量は端末に保存される。
 */

const QTY_KEY = "kemachart.orderSim.qty.v2";
/** サロン専用機能の了承フラグ (アプリを開いている間だけ有効・次回起動時は再確認) */
const ACK_KEY = "kemachart.orderSim.ack.v1";

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

/** カテゴリ内を商品名ごとにまとめる (バリエーション行を束ねる) */
function groupByProduct(items: ShopItem[]): { name: string; items: ShopItem[] }[] {
  const groups: { name: string; items: ShopItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.name === item.name) last.items.push(item);
    else groups.push({ name: item.name, items: [item] });
  }
  return groups;
}

export function OrderSimulator() {
  const [acked, setAcked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ACK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [qty, setQty] = useState<Record<string, number>>(loadQty);

  useEffect(() => {
    try {
      localStorage.setItem(QTY_KEY, JSON.stringify(qty));
    } catch {
      // 保存失敗は無視 (試算は続けられる)
    }
  }, [qty]);

  function setCount(key: string, next: number) {
    const v = Math.max(0, Math.min(99, Math.floor(next)));
    setQty((prev) => {
      const copy = { ...prev };
      if (v === 0) delete copy[key];
      else copy[key] = v;
      return copy;
    });
  }

  const summary = useMemo(() => {
    let skus = 0;
    let sets = 0;
    let units = 0;
    let total = 0;
    const catSets: Record<string, number> = {};
    for (const cat of SHOP_CATEGORIES) {
      for (const item of SHOP_ITEMS[cat.key] ?? []) {
        const q = qty[item.key] ?? 0;
        if (q <= 0) continue;
        skus += 1;
        sets += q;
        units += item.units * q;
        total += setPrice(item) * q;
        catSets[cat.key] = (catSets[cat.key] ?? 0) + q;
      }
    }
    return { skus, sets, units, total, catSets };
  }, [qty]);

  function jumpToCategory(key: string) {
    document
      .getElementById(`osim-cat-${key}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildOrderText(): string {
    const lines: string[] = ["【KEMA PRO SHOP 注文シミュレーション】", ""];
    for (const cat of SHOP_CATEGORIES) {
      for (const item of SHOP_ITEMS[cat.key] ?? []) {
        const q = qty[item.key] ?? 0;
        if (q <= 0) continue;
        const codeStr = item.code ? `（${item.code}）` : "";
        lines.push(`・${item.name}／${item.variant}${codeStr} ×${q} ＝ ${fmt(setPrice(item) * q)}`);
      }
    }
    lines.push("");
    lines.push(`合計 ${summary.sets}セット・${summary.units}点`);
    lines.push(`注文金額 (サロン価格): ${fmt(summary.total)}`);
    lines.push("※ 2026年8月時点のサロン価格による試算。送料・税区分は注文時にご確認ください。");
    return lines.join("\n");
  }

  async function copyOrder() {
    if (summary.sets === 0) {
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
    if (summary.sets === 0) return;
    if (confirm("入力した数量をすべてクリアしますか？")) setQty({});
  }

  function acknowledge() {
    try {
      sessionStorage.setItem(ACK_KEY, "1");
    } catch {
      // 保存できなくても表示は許可する
    }
    setAcked(true);
  }

  // サロン様専用の注意喚起 (了承するまで価格は表示しない)
  if (!acked) {
    return (
      <div className="osim">
        <section className="card osim-gate">
          <div className="osim-gate__icon" aria-hidden="true">🔒</div>
          <h2 className="osim-gate__title">サロン様専用の機能です</h2>
          <p className="osim-gate__text">
            この先の画面には、KEMA PRO SHOPの<strong>サロン価格（仕入れ価格）</strong>が表示されます。
          </p>
          <ul className="osim-gate__list">
            <li>KEMA製品をお取り扱いの美容室・美容師様専用です</li>
            <li>お客様など第三者への提示はお控えください</li>
            <li>画面の共有・スクリーンショットのSNS掲載等はお控えください</li>
          </ul>
          <div className="osim-gate__actions">
            <button
              type="button"
              className="btn btn--primary"
              data-testid="osim-ack"
              onClick={acknowledge}
            >
              サロン関係者として了承し、表示する
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => history.back()}>
              戻る
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="osim">
      <p className="card__note osim__lead">
        KEMA PRO SHOPのサロン価格（2026年8月時点）で注文金額を試算できます。
        アイロン → パーマ剤 → 前処理剤 の順に選んでいけます。数量は保存されます。
      </p>

      <nav className="osim__nav" aria-label="カテゴリへ移動">
        {SHOP_CATEGORIES.map((cat) => {
          const count = summary.catSets[cat.key] ?? 0;
          return (
            <button
              type="button"
              key={cat.key}
              className={`osim__chip ${count > 0 ? "has-items" : ""}`}
              onClick={() => jumpToCategory(cat.key)}
            >
              {cat.step && (
                <span className="osim__chip-step">{cat.step.replace("STEP ", "")}</span>
              )}
              {cat.short}
              {count > 0 && <span className="osim__chip-count">{count}</span>}
            </button>
          );
        })}
      </nav>

      {SHOP_CATEGORIES.map((cat) => {
        const items = SHOP_ITEMS[cat.key] ?? [];
        if (items.length === 0) return null;
        return (
          <section className="card osim__cat" id={`osim-cat-${cat.key}`} key={cat.key}>
            <h2 className="card__title">
              {cat.step && <span className="osim__stepbadge">{cat.step}</span>}
              {cat.label}
            </h2>
            {groupByProduct(items).map((group) => (
              <div className="osim__product" key={group.name}>
                <div className="osim__pname">{group.name}</div>
                <ul className="osim__list">
                  {group.items.map((item) => {
                    const q = qty[item.key] ?? 0;
                    const price = setPrice(item);
                    return (
                      <li className={`osim__row ${q > 0 ? "is-active" : ""}`} key={item.key}>
                        <div className="osim__info">
                          <div className="osim__name">
                            {item.variant}
                            {item.code && <span className="osim__size">{item.code}</span>}
                          </div>
                          <div className="osim__prices">
                            <span className="osim__salon">{fmt(price)}</span>
                            {item.units > 1 && (
                              <span className="osim__retail">
                                （{fmt(item.unitPrice)} × {item.units}本）
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="osim__ctrl">
                          <button
                            type="button"
                            className="osim__step"
                            aria-label={`${item.name} ${item.variant}を減らす`}
                            onClick={() => setCount(item.key, q - 1)}
                            disabled={q <= 0}
                          >
                            −
                          </button>
                          <span className="osim__qty">{q}</span>
                          <button
                            type="button"
                            className="osim__step"
                            aria-label={`${item.name} ${item.variant}を増やす`}
                            onClick={() => setCount(item.key, q + 1)}
                          >
                            ＋
                          </button>
                        </div>
                        {q > 0 && <div className="osim__subtotal">{fmt(price * q)}</div>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        );
      })}

      <section className="card osim__summary" id="osim-summary">
        <h2 className="card__title">試算結果</h2>
        <dl className="osim__totals">
          <div className="osim__total-row">
            <dt>注文内容</dt>
            <dd>
              {summary.skus}種 / {summary.sets}セット / {summary.units}点
            </dd>
          </div>
          <div className="osim__total-row osim__total-row--main">
            <dt>注文金額 (サロン価格)</dt>
            <dd data-testid="osim-salon-total">{fmt(summary.total)}</dd>
          </div>
        </dl>
        <p className="card__note">
          ※ KEMA PRO SHOPのサロン価格（2026年8月時点）にもとづく試算です。
          送料・税区分・最新価格は注文時にPRO SHOPでご確認ください。
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

      {/* 画面下部に常時表示の合計バー (タップで試算結果へ) */}
      <button
        type="button"
        className="osim__bar"
        onClick={() =>
          document.getElementById("osim-summary")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        aria-label="試算結果を見る"
      >
        <span className="osim__bar-left">
          <span className="osim__bar-label">注文金額</span>
          <span className="osim__bar-meta">
            {summary.sets}セット・{summary.units}点
          </span>
        </span>
        <span className="osim__bar-total" data-testid="osim-bar-total">
          {fmt(summary.total)}
        </span>
      </button>
    </div>
  );
}
