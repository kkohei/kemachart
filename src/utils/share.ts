import { Capacitor } from "@capacitor/core";
import type { HeadAreaKey, RecipePart, TreatmentRecord } from "../types";
import { damageDef, formatMix, groupRecipe } from "../constants";
import { formatJP, formatKO } from "./date";
import { damageCode, maxDamage } from "./damage";
import { dataURLtoBlob } from "./image";

/** 共有テキストの言語 */
export type ShareLang = "ja" | "ko";

interface ShareStrings {
  title: (menu: string) => string;
  date: string;
  damage: string;
  rootToTip: string;
  max: string;
  afterArrow: (code: string) => string;
  backPrefix: string;
  recipe: string;
  min: (m: number) => string;
  memo: string;
  tags: string;
  areaShort: Record<HeadAreaKey, string>;
  partLabel: Record<RecipePart, string>;
  fmtDate: (iso: string) => string;
}

const STRINGS: Record<ShareLang, ShareStrings> = {
  ja: {
    title: (menu) => `【KEMA施術記録】${menu}`,
    date: "来店日",
    damage: "ダメージ",
    rootToTip: "根元→毛先",
    max: "最大",
    afterArrow: (code) => ` ⇒ 施術後 ${code}`,
    backPrefix: "後ろ ",
    recipe: "レシピ",
    min: (m) => ` (${m}分)`,
    memo: "メモ",
    tags: "#KEMA #美容師 #施術記録",
    areaShort: { back: "後ろ", leftSide: "左", rightSide: "右", frontTop: "前" },
    partLabel: { clinic: "クリニックパート", design: "デザインパート", care: "ケアパート" },
    fmtDate: formatJP,
  },
  ko: {
    title: (menu) => `[KEMA 시술기록] ${menu}`,
    date: "방문일",
    damage: "데미지",
    rootToTip: "뿌리→모발끝",
    max: "최대",
    afterArrow: (code) => ` ⇒ 시술 후 ${code}`,
    backPrefix: "뒷머리 ",
    recipe: "레시피",
    min: (m) => ` (${m}분)`,
    memo: "메모",
    tags: "#KEMA #미용사 #시술기록",
    areaShort: { back: "뒷머리", leftSide: "좌", rightSide: "우", frontTop: "앞" },
    partLabel: { clinic: "클리닉 파트", design: "디자인 파트", care: "케어 파트" },
    fmtDate: formatKO,
  },
};

/** 記録から共有用のテキストを生成 (言語指定可) */
export function buildShareText(rec: TreatmentRecord, lang: ShareLang = "ja"): string {
  const t = STRINGS[lang];
  const lines: string[] = [];
  lines.push(t.title(rec.menu));
  lines.push(`${t.date}: ${t.fmtDate(rec.date)}`);
  const hasExtra = rec.extraAreas && rec.extraAreas.length > 0;
  const backLabel = hasExtra ? t.backPrefix : "";
  const beforeCode = `${t.rootToTip} ${damageCode(rec.damageBefore)} (${t.max}${damageDef(maxDamage(rec.damageBefore)).short})`;
  const afterCode = rec.damageAfter ? t.afterArrow(damageCode(rec.damageAfter)) : "";
  lines.push(`${t.damage}: ${backLabel}${beforeCode}${afterCode}`);
  if (rec.extraAreas) {
    for (const a of rec.extraAreas) {
      const ac = a.after ? t.afterArrow(damageCode(a.after)) : "";
      lines.push(`　${t.areaShort[a.area]}: ${damageCode(a.before)}${ac}`);
    }
  }
  if (rec.recipe.length) {
    lines.push(`${t.recipe}:`);
    for (const g of groupRecipe(rec.recipe)) {
      lines.push(`［${t.partLabel[g.key]}］`);
      for (const s of g.steps) {
        const tm = s.minutes ? t.min(s.minutes) : "";
        const mix = s.mix && s.mix.length > 0 ? formatMix(s.mix) : "";
        const detail = [mix, s.product].filter(Boolean).join(" / ");
        lines.push(`・${s.name}: ${detail}${tm}`);
      }
    }
  }
  if (rec.memo) lines.push(`${t.memo}: ${rec.memo}`);
  lines.push(t.tags);
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
export async function nativeShare(rec: TreatmentRecord, lang: ShareLang = "ja"): Promise<ShareResult> {
  const text = buildShareText(rec, lang);
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
  lang: ShareLang = "ja",
): { label: string; url: string; color: string; text: string }[] {
  const text = buildShareText(rec, lang);
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
export async function shareToKakao(rec: TreatmentRecord, lang: ShareLang = "ja"): Promise<ShareResult> {
  const text = buildShareText(rec, lang);
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
