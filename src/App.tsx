import { useRecords } from "./hooks/useRecords";
import { navigate, useHashRoute } from "./hooks/useHashRoute";
import { RecordList } from "./components/RecordList";
import { RecordForm } from "./components/RecordForm";
import { RecordDetail } from "./components/RecordDetail";
import { CustomerDetail } from "./components/CustomerDetail";
import { DataMenu } from "./components/DataMenu";

export default function App() {
  const { records, upsert, remove, getById, replaceAll } = useRecords();
  const route = useHashRoute();

  const back = route.name !== "list";

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          {back ? (
            <button className="iconbtn" aria-label="戻る" onClick={() => history.back()}>
              ‹
            </button>
          ) : (
            <span className="iconbtn iconbtn--ghost" aria-hidden="true" />
          )}
          <button className="brand" onClick={() => navigate("#/")}>
            <img src="./icon.svg" alt="" className="brand__icon" />
            <span className="brand__name">KEMA my Recipi</span>
          </button>
          {route.name === "list" ? (
            <DataMenu records={records} onImport={replaceAll} />
          ) : (
            <span className="iconbtn iconbtn--ghost" aria-hidden="true" />
          )}
        </div>
      </header>

      <main className="content">
        {route.name === "list" && <RecordList records={records} />}

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
      </main>

      {route.name === "list" && records.length > 0 && (
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
      <button className="btn btn--primary" onClick={() => navigate("#/")}>
        一覧へ戻る
      </button>
    </div>
  );
}
