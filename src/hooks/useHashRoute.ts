import { useEffect, useState } from "react";

/**
 * 依存ライブラリ不要の軽量ハッシュルーター。
 * GitHub Pages などの静的ホスティングでも 404 にならず動作します。
 *
 *   #/            → トップ (ハブ)
 *   #/records     → 記録一覧
 *   #/new         → 新規作成
 *   #/record/:id  → 詳細
 *   #/edit/:id    → 編集
 */
export type Route =
  | { name: "home" }
  | { name: "records" }
  | { name: "new" }
  | { name: "detail"; id: string }
  | { name: "edit"; id: string }
  | { name: "customer"; customer: string }
  | { name: "guide" }
  | { name: "tenpan" };

function parse(hash: string): Route {
  const path = hash.replace(/^#/, "");
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "records") return { name: "records" };
  if (parts[0] === "guide") return { name: "guide" };
  if (parts[0] === "tenpan") return { name: "tenpan" };
  if (parts[0] === "new") return { name: "new" };
  if (parts[0] === "record" && parts[1]) return { name: "detail", id: parts[1] };
  if (parts[0] === "edit" && parts[1]) return { name: "edit", id: parts[1] };
  if (parts[0] === "customer" && parts[1]) return { name: "customer", customer: decodeURIComponent(parts[1]) };
  return { name: "home" };
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function navigate(to: string): void {
  location.hash = to;
}
