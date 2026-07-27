import { Capacitor } from "@capacitor/core";
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
  const title = `KEMA my Recipi｜${rec.menu}`;

  // Capacitor ネイティブ (iOS/Android) ではネイティブ共有シートを使用
  if (Capacitor.isNativePlatform()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, text, dialogTitle: "施術記録を共有" });
      return { ok: true, method: "native", message: "共有しました" };
    } catch (e) {
      if ((e as Error)?.message?.includes("cancel")) {
        return { ok: false, method: "native", message: "共有をキャンセルしました" };
      }
      // 続けてWeb経路を試す
    }
  }

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

/** URLで共有できるSNS (LINE / X) のリンクを生成 */
export function snsShareLinks(
  rec: TreatmentRecord,
): { label: string; url: string; color: string; text: string }[] {
  const text = buildShareText(rec);
  const enc = encodeURIComponent(text);
  return [
    {
      label: "LINE",
      url: `https://line.me/R/msg/text/?${enc}`,
      color: "#06c755",
      text: "#ffffff",
    },
    {
      label: "X",
      url: `https://twitter.com/intent/tweet?text=${enc}`,
      color: "#000000",
      text: "#ffffff",
    },
  ];
}

/**
 * カカオトークへ共有します。
 * KakaoTalkはWebの公式テキスト共有URLが無い(SDK要)ため、
 * レシピ文をクリップボードにコピーし、カカオトークを起動して貼り付けてもらう方式。
 */
export async function shareToKakao(rec: TreatmentRecord): Promise<ShareResult> {
  const text = buildShareText(rec);
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    copied = false;
  }
  // カカオトークを起動 (インストール時)
  try {
    window.location.href = "kakaotalk://";
  } catch {
    // スキームが無い環境では無視
  }
  return {
    ok: copied,
    method: copied ? "clipboard" : "none",
    message: copied
      ? "レシピをコピーしました。カカオトークで貼り付けて送信してください"
      : "コピーできませんでした。上の「共有する」からお試しください",
  };
}
