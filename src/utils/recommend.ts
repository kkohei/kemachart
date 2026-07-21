import type { DamageProfile } from "../types";
import { KEMA_MENUS, type KemaMenuDef, type KemaMenuId } from "../data/kemaMenus";
import { avgDamage, maxDamage } from "./damage";

/** 適合度: ◎おすすめ / ○可 / △注意 / ✕非推奨 */
export type Suitability = "best" | "ok" | "caution" | "avoid";

export interface MenuRecommendation {
  menu: KemaMenuDef;
  suitability: Suitability;
  /** 判定の理由 (測定値に基づく説明) */
  reasons: string[];
}

export const SUITABILITY_LABEL: Record<Suitability, string> = {
  best: "◎ おすすめ",
  ok: "○ 可",
  caution: "△ 注意",
  avoid: "✕ 非推奨",
};

const ORDER: Record<Suitability, number> = { best: 0, ok: 1, caution: 2, avoid: 3 };

/**
 * 来店時 (施術前・後ろ) のダメージプロファイルから、
 * KEMAマニュアルの3メニューの適合度を判定します。
 *
 * 判定はマニュアルの考え方に基づくルール:
 *  - ダメージが大きいほどクリニック (集中補修) の優先度が上がる
 *  - ブリーチは既存ダメージが大きいほどリスク (Lv4=要注意, Lv5=非推奨)
 *  - 根元ボリュームは根元の状態が健康なほど適する
 */
export function recommendMenus(profile: DamageProfile): MenuRecommendation[] {
  const mx = maxDamage(profile);
  const avg = avgDamage(profile);
  const rootLv = Math.max(profile[0], profile[1]); // 根元〜上部
  const tipLv = Math.max(profile[3], profile[4]); // 下部〜毛先

  const out: MenuRecommendation[] = KEMA_MENUS.map((menu) => {
    switch (menu.id as KemaMenuId) {
      case "clinic": {
        if (mx >= 4)
          return rec(menu, "best", [
            `最大ダメージLv.${mx} — 集中補修を最優先`,
            tipLv >= 4 ? "毛先のハイダメージには トリートメントホワイト を使用" : "",
          ]);
        if (mx === 3)
          return rec(menu, "best", [`最大ダメージLv.${mx} — 進行を止める集中補修が有効`]);
        return rec(menu, "ok", [
          `平均ダメージ${avg} — 予防ケア・質感向上として`,
        ]);
      }
      case "bleach": {
        if (mx >= 5)
          return rec(menu, "avoid", [
            "Lv.5 (極度) の部位あり — 切れ毛・ビビり毛のリスクが高い",
            "先にクリニックで補修を",
          ]);
        if (mx === 4)
          return rec(menu, "caution", [
            "Lv.4 (重度) の部位あり — 塗り分け・保護を徹底し慎重に",
            "SUB BASE 30%配合とオーバータイム厳禁を厳守",
          ]);
        return rec(menu, "ok", [
          `最大ダメージLv.${mx} — SUB BASE配合でムラを抑えて施術可能`,
        ]);
      }
      case "rootVolume": {
        if (rootLv <= 2)
          return rec(menu, "best", [
            `根元がLv.${rootLv}と健康 — 立ち上げ施術に適した状態`,
            tipLv >= 4 ? "毛先はハイダメージのため、毛先への薬剤付着に注意" : "",
          ]);
        if (rootLv === 3)
          return rec(menu, "ok", [`根元Lv.${rootLv} — 施術可。ケア工程を丁寧に`]);
        return rec(menu, "caution", [
          `根元Lv.${rootLv} — 先に補修を優先し、状態を見て判断`,
        ]);
      }
      default:
        return rec(menu, "ok", []);
    }
  });

  return out.sort((a, b) => ORDER[a.suitability] - ORDER[b.suitability]);
}

function rec(menu: KemaMenuDef, suitability: Suitability, reasons: string[]): MenuRecommendation {
  return { menu, suitability, reasons: reasons.filter(Boolean) };
}
