import { useCallback, useEffect, useRef, useState } from "react";
import type { TreatmentRecord } from "../types";
import { loadRecords, saveRecords } from "../storage";
import { scheduleAutoBackup } from "../utils/autoBackup";
import {
  cleanupOrphanPhotos,
  deletePhoto,
  migratePhotos,
  photoRefsOf,
} from "../utils/photoStore";

/** 施術記録の状態管理 + localStorage 永続化 (写真は写真ストアに分離) */
export function useRecords() {
  const [records, setRecords] = useState<TreatmentRecord[]>(() => loadRecords());
  const warnedRef = useRef(false);

  // 旧形式 (写真がlocalStorageに埋め込み) からの自動移行 + 参照されない写真の掃除
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const migrated = await migratePhotos(loadRecords());
      if (migrated && !cancelled) {
        setRecords(migrated);
      }
      // 掃除は「移行後の記録 + 最新のlocalStorage」の両方を参照対象にして安全側に
      const current = migrated ?? loadRecords();
      await cleanupOrphanPhotos([...current, ...loadRecords()]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 変更のたびに保存 (失敗してもアプリは落とさない)
  useEffect(() => {
    const res = saveRecords(records);
    if (res.ok) {
      warnedRef.current = false;
      scheduleAutoBackup(records);
      return;
    }
    if (!warnedRef.current) {
      warnedRef.current = true;
      alert(
        res.quota
          ? "保存容量がいっぱいのため、この変更を保存できませんでした。\n\n・右上メニューからバックアップを書き出したうえで、古い記録を削除する\nなどで容量を空けてから、もう一度お試しください。"
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
    setRecords((prev) => {
      const target = prev.find((r) => r.id === id);
      const next = prev.filter((r) => r.id !== id);
      if (target) {
        // この記録だけが使っている写真をストアからも削除
        const stillUsed = photoRefsOf(next);
        for (const ref of photoRefsOf([target])) {
          if (!stillUsed.has(ref)) void deletePhoto(ref);
        }
      }
      return next;
    });
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
