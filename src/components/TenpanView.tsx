import { useState, type ReactNode } from "react";
import {
  FIRST30,
  KARTE_4,
  NG3,
  PRINCIPLES,
  QA,
  QUICK_TABLE,
  REPHRASE,
  TENPAN_CATEGORIES,
  TENPAN_PRODUCTS,
  TOUCHPOINTS,
} from "../data/tenpanManual";

/** 章のアコーディオン */
function Chapter({
  no,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  no: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`tp-chapter ${open ? "is-open" : ""}`}>
      <button type="button" className="tp-chapter__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="tp-chapter__no">{no}</span>
        <span className="tp-chapter__titles">
          <span className="tp-chapter__title">{title}</span>
          {subtitle && <span className="tp-chapter__sub">{subtitle}</span>}
        </span>
        <span className="tp-chapter__chev">{open ? "▴" : "▾"}</span>
      </button>
      {open && <div className="tp-chapter__body">{children}</div>}
    </section>
  );
}

/** 商品カード (開閉式) */
function ProductCard({ p }: { p: (typeof TENPAN_PRODUCTS)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`tp-product ${open ? "is-open" : ""}`}>
      <button type="button" className="tp-product__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="tp-product__name">
          {p.name}
          <span className="tp-product__tagline">{p.tagline}</span>
        </span>
        <span className="tp-product__price">
          {p.size}｜{p.price}
        </span>
        <span className="tp-chapter__chev">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="tp-product__body">
          <div className="tp-tags">
            {p.tags.map((t) => (
              <span className="tp-tag" key={t}>
                {t}
              </span>
            ))}
          </div>
          <div className="tp-block">
            <div className="tp-block__label">こんなサインが出たら</div>
            <ul className="tp-signs">
              {p.signs.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="tp-block tp-block--talk">
            <div className="tp-block__label">そのまま使えるひとこと</div>
            <p className="tp-talk">「{p.talk}」</p>
          </div>
          <div className="tp-block">
            <div className="tp-block__label">成分メモ</div>
            <p>{p.ingredients}</p>
          </div>
          {p.cost && (
            <div className="tp-block">
              <div className="tp-block__label">コスパ</div>
              <p>{p.cost}</p>
            </div>
          )}
          <div className="tp-block tp-block--push">
            <div className="tp-block__label">◆ ひと押し</div>
            <p>{p.push}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** 店販ワークマニュアル ビューア */
export function TenpanView() {
  return (
    <div className="tenpan">
      <p className="tenpan__intro">
        サロンでの、お客様へのおすすめのすすめ方（2026.08｜KEMA JAPAN）。
        <br />
        合言葉は <strong>悩み1つ × 工程1つ × 商品1本</strong> —— これ以上は欲張らない。
      </p>

      <Chapter no="01" title="考え方" subtitle="売らない。処方する。" defaultOpen>
        <p className="tp-lead">
          店販は「物売り」ではありません。サロンでつくった髪を、次のご来店まで守るための“自宅での処方”です。
          プロが髪を見て選んだ1本を案内しないことは、お客様から見れば「教えてもらえなかった」ことと同じ。
        </p>
        <ol className="tp-principles">
          {PRINCIPLES.map((p, i) => (
            <li key={i}>
              <strong>{p.title}</strong>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
        <div className="tp-ng">
          {NG3.map((n, i) => (
            <p key={i}>× {n}</p>
          ))}
        </div>
      </Chapter>

      <Chapter no="02" title="接客フロー" subtitle="6つの接点 — 購入の意思は④仕上げでほぼ決まる">
        {TOUCHPOINTS.map((t) => (
          <div className="tp-touch" key={t.no}>
            <div className="tp-touch__head">
              <span className="tp-touch__no">{t.no}</span>
              <span className="tp-touch__title">{t.title}</span>
            </div>
            <p className="tp-touch__goal">目的：{t.goal}</p>
            <p className="tp-talk">「{t.phrase}」</p>
            <p className="tp-touch__detail">{t.detail}</p>
          </div>
        ))}
      </Chapter>

      <Chapter no="03" title="商品ガイド" subtitle="ホームケア全13品 — 洗う／満たす／整える／仕上げる">
        <p className="tp-lead">
          迷ったら基本の3ステップ：<strong>洗う（クレマシャンプー）→ 満たす（ブラック or ホワイト）→
          仕上げる（バーム／オイル1品）</strong>。1本だけなら、体験直後の「仕上げる」から。
        </p>
        {TENPAN_CATEGORIES.map((cat) => (
          <div className="tp-cat" key={cat.key}>
            <div className="tp-cat__head">
              <span className="tp-cat__step">{cat.step}</span>
              <span className="tp-cat__label">{cat.label}</span>
            </div>
            <p className="tp-cat__note">{cat.note}</p>
            {TENPAN_PRODUCTS.filter((p) => p.category === cat.key).map((p) => (
              <ProductCard p={p} key={p.name} />
            ))}
          </div>
        ))}
        <p className="tenpan__note">価格はすべて税込メーカー希望小売価格（2026年8月時点）</p>
      </Chapter>

      <Chapter no="04" title="お悩み別 早見表" subtitle="どれを薦めるか迷ったら">
        <div className="tp-table-wrap">
          <table className="tp-table">
            <thead>
              <tr>
                <th>お悩み・サイン</th>
                <th>まずこの1本</th>
                <th>あわせて</th>
              </tr>
            </thead>
            <tbody>
              {QUICK_TABLE.map((r, i) => (
                <tr key={i}>
                  <td>{r.worry}</td>
                  <td className="tp-table__first">{r.first}</td>
                  <td>{r.second}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="tp-points">
          {QUICK_TABLE.map((r, i) => (
            <li key={i}>
              <strong>{r.first}</strong>：{r.point}
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter no="05" title="Q&A・切り返し" subtitle="よくある反応には“型”で返す">
        {QA.map((qa, i) => (
          <div className="tp-qa" key={i}>
            <p className="tp-qa__q">Q {qa.q}</p>
            <p className="tp-qa__pattern">型：{qa.pattern}</p>
            <p className="tp-talk">「{qa.a}」</p>
            <p className="tp-qa__note">{qa.note}</p>
          </div>
        ))}
        <div className="tp-block tp-block--push">
          <div className="tp-block__label">言い換え表（薬機法）— 迷ったら「整える・補う・保つ」</div>
          {REPHRASE.map((r, i) => (
            <p className="tp-rephrase" key={i}>
              <span className="tp-rephrase__ng">×「{r.ng}」</span>
              <br />
              <span className="tp-rephrase__ok">○「{r.ok}」</span>
            </p>
          ))}
        </div>
      </Chapter>

      <Chapter no="06" title="はじめの30日" subtitle="売ることより、声をかける習慣を">
        {FIRST30.map((w, i) => (
          <div className="tp-week" key={i}>
            <div className="tp-week__head">
              <span className="tp-week__no">{w.week}</span>
              <span className="tp-week__title">{w.title}</span>
            </div>
            <p>{w.body}</p>
            <p className="tp-week__goal">今週のゴール：{w.goal}</p>
          </div>
        ))}
        <div className="tp-block">
          <div className="tp-block__label">カルテに残す4点</div>
          <ol className="tp-karte4">
            {KARTE_4.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ol>
        </div>
      </Chapter>

      <p className="tenpan__note">
        出典: KEMA 店販ワークマニュアル（2026.08）。内容・価格は作成時点のものです。
        表現・価格の変更がある場合は最新のご案内を優先してください。
      </p>
    </div>
  );
}
