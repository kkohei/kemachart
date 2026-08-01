import { useCallback, useEffect, useRef, useState } from "react";
import type { TreatmentRecord } from "../types";
import { loadRecords, saveRecords } from "../storage";

/** 施術記録の状態管理 + localStorage 永続化 */
export function useRecords() {
  const [records, setRecords] = useState<TreatmentRecord[]>(() => loadRecords());
  const warnedRef = useRef(false);

  // 変更のたびに保存 (失敗してもアプリは落とさない)
  useEffect(() => {
    const res = saveRecords(records);
    if (res.ok) {
      warnedRef.current = false;
      return;
    }
    if (!warnedRef.current) {
      warnedRef.current = true;
      alert(
        res.quota
          ? "保存容量がいっぱいのため、この変更を保存できませんでした。\n\n・写真の枚数を減らす\n・右上メニューからバックアップを書き出したうえで、古い記録を削除する\nなどで容量を空けてから、もう一度お試しください。"
          : `保存に失敗しました: ${res.error ?? "不明なエラー"}`,
      );
    }
  }, [records]);

  // 別タブでの変更を同期
  useEffect(() => {
    const onStorage = () => setRecords(loadRecords());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const upsert = useCallback((rec: TreatmentRecord) => {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === rec.id);
      const next = idx >= 0 ? prev.map((r) => (r.id === rec.id ? rec : r)) : [rec, ...prev];
      return [...next].sort((a, b) =>
        a.date !== b.date ? (a.date < b.date ? 1 : -1) : b.createdAt - a.createdAt,
      );
    });
  }, []);

  const remove = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getById = useCallback(
    (id: string) => records.find((r) => r.id === id),
    [records],
  );

  const replaceAll = useCallback((next: TreatmentRecord[]) => {
    setRecords([...next].sort((a, b) =>
      a.date !== b.date ? (a.date < b.date ? 1 : -1) : b.createdAt - a.createdAt,
    ));
  }, []);

  return { records, upsert, remove, getById, replaceAll };
}
