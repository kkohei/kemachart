import { useRef, useState } from "react";
import type { TreatmentRecord } from "../types";
import { buildBackup, parseBackup } from "../storage";

/**
 * データのバックアップ (エクスポート) と復元 (インポート)。
 * 将来的な「本部への共有」の土台となるJSON入出力です。
 */
export function DataMenu({
  records,
  onImport,
  variant = "default",
}: {
  records: TreatmentRecord[];
  onImport: (records: TreatmentRecord[]) => void;
  variant?: "default" | "light";
}) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function exportJSON() {
    const payload = buildBackup(records);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `kemachart-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  async function importJSON(file: File) {
    try {
      const text = await file.text();
      const incoming = parseBackup(text);
      const mode = confirm(
        `${incoming.length}件の記録を読み込みます。\n\n「OK」= 現在の記録と統合\n「キャンセル」= 中止`,
      );
      if (!mode) return;
      // ID重複は取り込み側を優先してマージ
      const map = new Map<string, TreatmentRecord>();
      for (const r of records) map.set(r.id, r);
      for (const r of incoming) map.set(r.id, r);
      onImport([...map.values()]);
      alert("読み込みが完了しました。");
    } catch (e) {
      alert(`読み込みに失敗しました: ${(e as Error).message}`);
    } finally {
      setOpen(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="datamenu">
      <button
        className={`iconbtn ${variant === "light" ? "iconbtn--light" : ""}`}
        aria-label="データメニュー"
        onClick={() => setOpen((v) => !v)}
      >
        ⋯
      </button>
      {open && (
        <>
          <div className="datamenu__backdrop" onClick={() => setOpen(false)} />
          <div className="datamenu__pop" role="menu">
            <button className="datamenu__item" onClick={exportJSON}>
              バックアップを書き出す
            </button>
            <button className="datamenu__item" onClick={() => fileRef.current?.click()}>
              バックアップを読み込む
            </button>
            <button
              className="datamenu__item"
              onClick={() => {
                const err = localStorage.getItem("kemachart.lastError");
                alert(err ? `直近のエラー:\n\n${err}` : "記録されたエラーはありません。");
                setOpen(false);
              }}
            >
              直近のエラーを表示
            </button>
          </div>
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJSON(f);
        }}
      />
    </div>
  );
}
