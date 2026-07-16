import { useCallback, useEffect, useState } from "react";
import type { TreatmentRecord } from "../types";
import { loadRecords, saveRecords } from "../storage";

/** 施術記録の状態管理 + localStorage 永続化 */
export function useRecords() {
  const [records, setRecords] = useState<TreatmentRecord[]>(() => loadRecords());

  // 変更のたびに保存
  useEffect(() => {
    saveRecords(records);
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
