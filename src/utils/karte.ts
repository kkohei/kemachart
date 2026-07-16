import type { DamageProfile, TreatmentRecord } from "../types";
import { AREA_BACK, SECTIONS, areaDef, damageDef } from "../constants";
import { damageCode, maxDamage } from "./damage";
import { formatJP } from "./date";

const W = 820;
const PAD = 40;
const INK = "#33291f";
const INK2 = "#7a6a58";
const ACCENT = "#6f5738";
const LINE = "#e8ddcf";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

/** 記録を1枚のカルテ画像 (canvas) に描画します */
export async function renderKarteCanvas(rec: TreatmentRecord): Promise<HTMLCanvasElement> {
  // 写真を先読み
  const beforeImgs = await Promise.all(rec.beforePhotos.slice(0, 3).map(loadImage).map((p) => p.catch(() => null)));
  const afterImgs = await Promise.all(rec.afterPhotos.slice(0, 3).map(loadImage).map((p) => p.catch(() => null)));

  // 高さは大きめに確保して描画後にクロップ
  const scratch = document.createElement("canvas");
  scratch.width = W;
  scratch.height = 4000;
  const ctx = scratch.getContext("2d")!;
  ctx.textBaseline = "alphabetic";

  // 背景
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, scratch.height);

  let y = 0;

  // ヘッダーバー
  ctx.fillStyle = "#f4ece0";
  ctx.fillRect(0, 0, W, 70);
  ctx.fillStyle = ACCENT;
  ctx.font = "700 26px sans-serif";
  ctx.fillText("KEMA my Recipi", PAD, 45);
  ctx.fillStyle = INK2;
  ctx.font = "500 18px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("施術カルテ", W - PAD, 45);
  ctx.textAlign = "left";
  y = 70 + 34;

  // お客様・メニュー・日付
  ctx.fillStyle = ACCENT;
  ctx.font = "700 15px sans-serif";
  ctx.fillText(rec.menu, PAD, y);
  y += 34;
  ctx.fillStyle = INK;
  ctx.font = "800 30px sans-serif";
  ctx.fillText(rec.customerName || "お客様", PAD, y);
  y += 26;
  ctx.fillStyle = INK2;
  ctx.font = "400 16px sans-serif";
  ctx.fillText(formatJP(rec.date), PAD, y);
  y += 30;

  // ダメージ (後ろ + 追加部位)
  y = section(ctx, "ダメージレベル (根元→毛先)", y);
  y = drawArea(ctx, AREA_BACK.label, rec.damageBefore, rec.damageAfter, beforeImgs, y);
  for (const a of rec.extraAreas ?? []) {
    y = drawArea(ctx, areaDef(a.area).label, a.before, a.after, [], y);
  }
  if (rec.damageNote) {
    y = wrapText(ctx, rec.damageNote, PAD, y + 4, W - PAD * 2, 22, INK2, "400 15px sans-serif");
  }
  y += 20;

  // レシピ
  if (rec.recipe.length) {
    y = section(ctx, "レシピ", y);
    ctx.font = "400 16px sans-serif";
    rec.recipe.forEach((s, i) => {
      ctx.fillStyle = ACCENT;
      ctx.font = "700 16px sans-serif";
      const head = `${i + 1}. ${s.name || "工程"}${typeof s.minutes === "number" ? `  (${s.minutes}分)` : ""}`;
      ctx.fillText(head, PAD, y);
      y += 24;
      ctx.fillStyle = INK;
      y = wrapText(ctx, s.product, PAD + 18, y, W - PAD * 2 - 18, 22, INK, "400 15px sans-serif");
      if (s.note) {
        y = wrapText(ctx, s.note, PAD + 18, y, W - PAD * 2 - 18, 20, INK2, "400 14px sans-serif");
      }
      y += 8;
    });
    y += 12;
  }

  // 写真
  const hasPhotos = beforeImgs.some(Boolean) || afterImgs.some(Boolean);
  if (hasPhotos) {
    y = section(ctx, "ビフォー・アフター", y);
    y = drawPhotoRow(ctx, "Before", beforeImgs, y);
    y = drawPhotoRow(ctx, "After", afterImgs, y);
    y += 8;
  }

  // フッター
  y += 8;
  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 26;
  ctx.fillStyle = INK2;
  ctx.font = "400 13px sans-serif";
  ctx.fillText("KEMA my Recipi でエクスポート", PAD, y);
  y += 30;

  // 使用範囲でクロップ
  const out = document.createElement("canvas");
  out.width = W;
  out.height = Math.ceil(y);
  const octx = out.getContext("2d")!;
  octx.drawImage(scratch, 0, 0, W, out.height, 0, 0, W, out.height);
  return out;
}

function section(ctx: CanvasRenderingContext2D, title: string, y: number): number {
  ctx.fillStyle = "#f4ece0";
  ctx.fillRect(PAD, y, W - PAD * 2, 34);
  ctx.fillStyle = ACCENT;
  ctx.font = "700 16px sans-serif";
  ctx.fillText(title, PAD + 12, y + 23);
  return y + 34 + 20;
}

function drawArea(
  ctx: CanvasRenderingContext2D,
  label: string,
  before: DamageProfile,
  after: DamageProfile | undefined,
  photos: (HTMLImageElement | null)[],
  y: number,
): number {
  void photos;
  ctx.fillStyle = INK;
  ctx.font = "700 15px sans-serif";
  ctx.fillText(label, PAD, y);
  y += 14;

  const startY = y;
  // 毛束 (before) を描画
  drawStrand(ctx, PAD, y, 52, 120, before);
  // コード・セクション表 (before)
  const tx = PAD + 78;
  ctx.font = "400 14px sans-serif";
  let ty = y + 14;
  SECTIONS.forEach((s) => {
    const def = damageDef(before[s.index]);
    ctx.fillStyle = INK2;
    ctx.fillText(`${s.label}`, tx, ty);
    chip(ctx, tx + 108, ty - 13, def.short, def.color, def.text);
    ty += 22;
  });
  ctx.fillStyle = ACCENT;
  ctx.font = "700 16px sans-serif";
  ctx.fillText(`コード ${damageCode(before)}  最大${damageDef(maxDamage(before)).short}`, tx, ty + 4);

  // after があれば右側に
  if (after) {
    const ax = W / 2 + 40;
    drawStrand(ctx, ax, startY, 52, 120, after);
    const atx = ax + 78;
    ctx.font = "400 13px sans-serif";
    ctx.fillStyle = INK2;
    ctx.fillText("施術後", atx, startY + 4);
    ctx.fillStyle = ACCENT;
    ctx.font = "700 15px sans-serif";
    ctx.fillText(`${damageCode(after)}`, atx, startY + 26);
    ctx.fillStyle = INK2;
    ctx.font = "400 13px sans-serif";
    ctx.fillText(`最大${damageDef(maxDamage(after)).short}`, atx, startY + 48);
  }

  return Math.max(ty + 20, startY + 130);
}

/** 逆台形の毛束を描画 (根元=太い→毛先=細い) */
function drawStrand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  topW: number,
  h: number,
  profile: DamageProfile,
) {
  const botW = topW * 0.42;
  const cx = x + topW / 2;
  const widthAt = (t: number) => topW + (botW - topW) * t;
  const segH = h / profile.length;
  profile.forEach((lv, i) => {
    const t0 = i / profile.length;
    const t1 = (i + 1) / profile.length;
    const w0 = widthAt(t0);
    const w1 = widthAt(t1);
    const yy0 = y + i * segH;
    const yy1 = yy0 + segH;
    const def = damageDef(lv);
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.moveTo(cx - w0 / 2, yy0);
    ctx.lineTo(cx + w0 / 2, yy0);
    ctx.lineTo(cx + w1 / 2, yy1);
    ctx.lineTo(cx - w1 / 2, yy1);
    ctx.closePath();
    ctx.fill();
    // 番号
    ctx.fillStyle = def.text;
    ctx.font = "700 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), cx, yy0 + segH / 2 + 4);
    ctx.textAlign = "left";
  });
}

function chip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bg: string,
  fg: string,
) {
  ctx.font = "700 13px sans-serif";
  const w = ctx.measureText(text).width + 18;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, 20, 10);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.fillText(text, x + 9, y + 15);
}

function drawPhotoRow(
  ctx: CanvasRenderingContext2D,
  label: string,
  imgs: (HTMLImageElement | null)[],
  y: number,
): number {
  ctx.fillStyle = ACCENT;
  ctx.font = "700 14px sans-serif";
  ctx.fillText(label, PAD, y + 4);
  const valid = imgs.filter(Boolean) as HTMLImageElement[];
  if (valid.length === 0) {
    ctx.fillStyle = INK2;
    ctx.font = "400 14px sans-serif";
    ctx.fillText("なし", PAD + 70, y + 4);
    return y + 28;
  }
  const size = 150;
  const gap = 12;
  let x = PAD + 70;
  const rowY = y - 12;
  for (const img of valid) {
    const ratio = img.width / img.height;
    let dw = size,
      dh = size,
      sx = 0,
      sy = 0,
      sw = img.width,
      sh = img.height;
    // 正方形にセンタークロップ
    if (ratio > 1) {
      sw = img.height;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width;
      sy = (img.height - sh) / 2;
    }
    roundRect(ctx, x, rowY, dw, dh, 12);
    ctx.save();
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, x, rowY, dw, dh);
    ctx.restore();
    x += size + gap;
  }
  return rowY + size + 20;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  color: string,
  font: string,
): number {
  ctx.fillStyle = color;
  ctx.font = font;
  const chars = [...text];
  let line = "";
  for (const ch of chars) {
    if (ch === "\n") {
      ctx.fillText(line, x, y);
      line = "";
      y += lineH;
      continue;
    }
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = ch;
      y += lineH;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lineH;
  }
  return y;
}
