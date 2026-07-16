import type { TreatmentRecord } from "../types";
import { areaDef, damageDef } from "../constants";
import { formatJP } from "./date";
import { damageCode, maxDamage } from "./damage";
import { dataURLtoBlob } from "./image";

/** 記録から共有用のテキストを生成 */
export function buildShareText(rec: TreatmentRecord): string {
  const lines: string[] = [];
  lines.push(`【KEMA施術記録】${rec.menu}`);
  lines.push(`来店日: ${formatJP(rec.date)}`);
  const hasExtra = rec.extraAreas && rec.extraAreas.length > 0;
  const backLabel = hasExtra ? "後ろ " : "";
  const beforeCode = `根元→毛先 ${damageCode(rec.damageBefore)} (最大${damageDef(maxDamage(rec.damageBefore)).short})`;
  const afterCode = rec.damageAfter ? ` ⇒ 施術後 ${damageCode(rec.damageAfter)}` : "";
  lines.push(`ダメージ: ${backLabel}${beforeCode}${afterCode}`);
  if (rec.extraAreas) {
    for (const a of rec.extraAreas) {
      const ac = a.after ? ` ⇒ 施術後 ${damageCode(a.after)}` : "";
      lines.push(`　${areaDef(a.area).short}: ${damageCode(a.before)}${ac}`);
    }
  }
  if (rec.recipe.length) {
    lines.push("レシピ:");
    for (const s of rec.recipe) {
      const t = s.minutes ? ` (${s.minutes}分)` : "";
      lines.push(`・${s.name}: ${s.product}${t}`);
    }
  }
  if (rec.memo) lines.push(`メモ: ${rec.memo}`);
  lines.push("#KEMA #美容師 #施術記録");
  return lines.join("\n");
}

export interface ShareResult {
  ok: boolean;
  method: "native" | "clipboard" | "none";
  message: string;
}

/**
 * ネイティブ共有 (Web Share API) を試みます。
 * 画像付き共有に対応している端末では写真も添付します。
 */
export async function nativeShare(rec: TreatmentRecord): Promise<ShareResult> {
  const text = buildShareText(rec);
  const title = `KEMA施術記録 - ${rec.menu}`;

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };

  // 画像添付を試みる
  const files: File[] = [];
  const photos = [...rec.beforePhotos.slice(0, 1), ...rec.afterPhotos.slice(0, 1)];
  photos.forEach((p, i) => {
    const blob = dataURLtoBlob(p);
    if (blob) files.push(new File([blob], `kema-${i === 0 ? "before" : "after"}.jpg`, { type: blob.type }));
  });

  if (nav.share) {
    try {
      if (files.length && nav.canShare?.({ files })) {
        await nav.share({ title, text, files });
      } else {
        await nav.share({ title, text });
      }
      return { ok: true, method: "native", message: "共有しました" };
    } catch (e) {
      // ユーザーがキャンセルした場合など
      if ((e as Error)?.name === "AbortError") {
        return { ok: false, method: "native", message: "共有をキャンセルしました" };
      }
      // フォールバックへ
    }
  }

  // フォールバック: クリップボードにコピー
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true, method: "clipboard", message: "内容をクリップボードにコピーしました" };
  } catch {
    return { ok: false, method: "none", message: "この端末では共有に対応していません" };
  }
}

/** 各SNSの共有URLを生成 (テキストベース) */
export function snsShareLinks(rec: TreatmentRecord): { label: string; url: string; color: string }[] {
  const text = buildShareText(rec);
  const enc = encodeURIComponent(text);
  const pageUrl = encodeURIComponent(location.href);
  return [
    {
      label: "LINE",
      url: `https://line.me/R/msg/text/?${enc}`,
      color: "#06c755",
    },
    {
      label: "X",
      url: `https://twitter.com/intent/tweet?text=${enc}`,
      color: "#000000",
    },
    {
      label: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${enc}`,
      color: "#1877f2",
    },
  ];
}
