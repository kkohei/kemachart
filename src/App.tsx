import { useEffect } from "react";
import { useRecords } from "./hooks/useRecords";
import { navigate, useHashRoute } from "./hooks/useHashRoute";
import { setStatusBarForBackground } from "./native";
import { Landing } from "./components/Landing";
import { RecordList } from "./components/RecordList";
import { RecordForm } from "./components/RecordForm";
import { RecordDetail } from "./components/RecordDetail";
import { CustomerDetail } from "./components/CustomerDetail";
import { GuideView } from "./components/GuideView";
import { TenpanView } from "./components/TenpanView";

export default function App() {
  const { records, upsert, remove, getById, replaceAll } = useRecords();
  const route = useHashRoute();

  const isLanding = route.name === "home";

  // 背景の明暗に合わせて、ステータスバー文字色と端の背景色を切り替える
  useEffect(() => {
    document.documentElement.classList.toggle("theme--dark", isLanding);
    void setStatusBarForBackground(isLanding ? "dark" : "light");
  }, [isLanding]);

  // トップ (ハブ) は全面グラデのため、共通トップバー/コンテンツ枠の外で描画
  if (isLanding) {
    return <Landing records={records} onImport={replaceAll} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <button className="iconbtn" aria-label="戻る" onClick={() => history.back()}>
            ‹
          </button>
          <button className="brand" onClick={() => navigate("#/")}>
            <img
              src={`${import.meta.env.BASE_URL}brand/kema-symbol-black.png`}
              alt=""
              className="brand__icon"
            />
            <span className="brand__name">KEMA my Recipi</span>
          </button>
          <span className="iconbtn iconbtn--ghost" aria-hidden="true" />
        </div>
      </header>

      <main className="content">
        {route.name === "records" && (
          <>
            <PageTitle>施術記録</PageTitle>
            <RecordList records={records} />
          </>
        )}

        {route.name === "new" && (
          <>
            <PageTitle>新規施術記録</PageTitle>
            <RecordForm onSave={upsert} />
          </>
        )}

        {route.name === "edit" &&
          (() => {
            const rec = getById(route.id);
            if (!rec) return <NotFound />;
            return (
              <>
                <PageTitle>記録を編集</PageTitle>
                <RecordForm initial={rec} onSave={upsert} />
              </>
            );
          })()}

        {route.name === "detail" &&
          (() => {
            const rec = getById(route.id);
            if (!rec) return <NotFound />;
            return <RecordDetail record={rec} onDelete={remove} />;
          })()}

        {route.name === "customer" && <CustomerDetail name={route.customer} records={records} />}

        {route.name === "guide" && (
          <>
            <PageTitle>KEMAメニューガイド</PageTitle>
            <GuideView />
          </>
        )}

        {route.name === "tenpan" && (
          <>
            <PageTitle>店販ワークマニュアル</PageTitle>
            <TenpanView />
          </>
        )}
      </main>

      {route.name === "records" && records.length > 0 && (
        <button className="fab" onClick={() => navigate("#/new")} aria-label="施術を記録する">
          ＋
        </button>
      )}
    </div>
  );
}

function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="page-title">{children}</h1>;
}

function NotFound() {
  return (
    <div className="empty">
      <h2 className="empty__title">記録が見つかりません</h2>
      <button className="btn btn--primary" onClick={() => navigate("#/records")}>
        一覧へ戻る
      </button>
    </div>
  );
}
