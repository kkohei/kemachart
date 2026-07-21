import { KEMA_MENUS, QUICK_REFERENCE } from "../data/kemaMenus";

/** KEMA湿熱システムのメニューガイド (マニュアルのダイジェスト) */
export function GuideView() {
  return (
    <div className="guide">
      <p className="guide__intro">
        KEMA湿熱システム — 水分と熱をコントロールしながら施術を組み立てる、KEMAのサロンワーク体系。
        ミストで水分を与え、低温のプレスで蒸らしながら整える。高温のアイロンは完全乾燥後の仕上げだけ。
      </p>

      <section className="card">
        <h2 className="card__title">基本の4ステップ</h2>
        <ol className="guide__concept">
          <li><strong>水分を与える</strong> — EQミストで髪をうるおす</li>
          <li><strong>低温で蒸らす</strong> — STC 100〜120℃の湿熱プレス</li>
          <li><strong>ケアで満たす</strong> — ケマチン・トリートメントで補修</li>
          <li><strong>高温は最後だけ</strong> — 完全乾燥後に DBST 200〜220℃</li>
        </ol>
      </section>

      {KEMA_MENUS.map((menu) => (
        <section className="card" key={menu.id}>
          <h2 className="card__title">
            {menu.short} <span className="guide__en">{menu.english}</span>
          </h2>
          <p className="guide__desc">{menu.description}</p>
          <ol className="recipe-view">
            {menu.steps.map((s, i) => (
              <li className="recipe-view__item" key={i}>
                <span className="recipe-view__idx">{i + 1}</span>
                <div className="recipe-view__body">
                  <div className="recipe-view__line">
                    <span className="recipe-view__name">{s.name}</span>
                    {typeof s.minutes === "number" && (
                      <span className="recipe-view__min">{s.minutes}分</span>
                    )}
                  </div>
                  <div className="recipe-view__product">{s.product}</div>
                  {s.note && <div className="recipe-view__note">{s.note}</div>}
                </div>
              </li>
            ))}
          </ol>
          <div className="guide__cautions">
            {menu.cautions.map((c, i) => (
              <p key={i}>⚠ {c}</p>
            ))}
          </div>
        </section>
      ))}

      <section className="card">
        <h2 className="card__title">温度セッティング早見表</h2>
        <table className="guide__table">
          <tbody>
            {QUICK_REFERENCE.temperatures.map((t, i) => (
              <tr key={i}>
                <td className="guide__table-tool">{t.tool}</td>
                <td className="guide__table-temp">{t.temp}</td>
                <td>{t.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="card__title">タイムセッティング早見表</h2>
        <table className="guide__table">
          <tbody>
            {QUICK_REFERENCE.timings.map((t, i) => (
              <tr key={i}>
                <td className="guide__table-tool">{t.item}</td>
                <td className="guide__table-temp">{t.time}</td>
                <td>{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="card__title">3つの原則</h2>
        <ol className="guide__concept">
          {QUICK_REFERENCE.principles.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      </section>

      <p className="guide__source">
        出典: KEMA MOIST-HEAT SYSTEM サロンワーク・マニュアル (2026.07)。
        ダメージ度合いや毛質により、使用する機器・薬剤は変わる場合があります。
      </p>
    </div>
  );
}
