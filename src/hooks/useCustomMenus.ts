import { useCallback, useEffect, useState } from "react";

const KEY = "kemachart.customMenus.v1";

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** ユーザーが追加したカスタムメニュー名の管理 (localStorage 永続化) */
export function useCustomMenus() {
  const [menus, setMenus] = useState<string[]>(() => load());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(menus));
  }, [menus]);

  const add = useCallback((name: string) => {
    const n = name.trim();
    if (!n) return;
    setMenus((prev) => (prev.includes(n) ? prev : [...prev, n]));
  }, []);

  const remove = useCallback((name: string) => {
    setMenus((prev) => prev.filter((m) => m !== name));
  }, []);

  return { menus, add, remove };
}
