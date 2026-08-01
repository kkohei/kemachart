import { useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import type { TreatmentRecord } from "../types";
import { buildBackup, parseBackup } from "../storage";
import { lastAutoBackupAt, readAutoBackup } from "../utils/autoBackup";

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
  const isNative = Capacitor.isNativePlatform();

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

  /** 取り込んだ記録を現在の記録とマージ (ID重複は取り込み側を優先) */
  function mergeIn(incoming: TreatmentRecord[]) {
    const map = new Map<string, TreatmentRecord>();
    for (const r of records) map.set(r.id, r);
    for (const r of incoming) map.set(r.id, r);
    onImport([...map.values()]);
  }

  async function importJSON(file: File) {
    try {
      const text = await file.text();
      const incoming = parseBackup(text);
      const mode = confirm(
        `${incoming.length}件の記録を読み込みます。\n\n「OK」= 現在の記録と統合\n「キャンセル」= 中止`,
      );
      if (!mode) return;
      mergeIn(incoming);
      alert("読み込みが完了しました。");
    } catch (e) {
      alert(`読み込みに失敗しました: ${(e as Error).message}`);
    } finally {
      setOpen(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function restoreFromAuto() {
    try {
      const backup = await readAutoBackup();
      if (!backup) {
        alert(
          "自動バックアップがまだありません。\n記録を保存すると、数秒後に端末内へ自動保存されます。",
        );
        return;
      }
      const when = backup.exportedAt
        ? new Date(backup.exportedAt).toLocaleString("ja-JP")
        : "日時不明";
      const ok = confirm(
        `自動バックアップ (${when} / ${backup.records.length}件) を読み込みます。\n\n「OK」= 現在の記録と統合\n「キャンセル」= 中止`,
      );
      if (!ok) return;
      mergeIn(backup.records);
      alert("復元が完了しました。");
    } catch (e) {
      alert(`復元に失敗しました: ${(e as Error).message}`);
    } finally {
      setOpen(false);
    }
  }

  function showAutoBackupInfo() {
    const last = lastAutoBackupAt();
    const when = last ? new Date(last).toLocaleString("ja-JP") : "まだありません";
    alert(
      `最終自動バックアップ: ${when}\n\n` +
        "記録を保存するたびに、端末内の「書類」フォルダへ自動でバックアップされます (直近7日分)。\n" +
        "iPhoneの「iCloudバックアップ」がオンなら、iCloudにも自動で含まれ、機種変更時に復元できます。\n\n" +
        "「ファイル」アプリ →「このiPhone内」→「KEMA my Recipi」→「バックアップ」からも確認・iCloud Driveへのコピーができます。",
    );
    setOpen(false);
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
            {isNative && (
              <>
                <button className="datamenu__item" onClick={restoreFromAuto}>
                  自動バックアップから復元
                </button>
                <button className="datamenu__item" onClick={showAutoBackupInfo}>
                  自動バックアップについて
                </button>
              </>
            )}
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
