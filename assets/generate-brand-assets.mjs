/**
 * アプリアイコン・スプラッシュ・PWAアイコンを正規KEMAロゴから生成するスクリプト。
 *
 * ロゴのソースは public/brand/ の正規ロゴ (KEMAブランドアイデンティティPDF由来)。
 * 背景はトップ画面と同じディープモカのグラデーション。
 *
 * 実行方法:
 *   npm i --no-save sharp && node assets/generate-brand-assets.mjs
 *
 * 出力先:
 *   - ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png (1024x1024)
 *   - ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732*.png (2732x2732 ×3)
 *   - public/icon.png (512x512, favicon / PWA / apple-touch-icon)
 */
import sharp from "sharp";

const BRAND = new URL("../public/brand/", import.meta.url).pathname;
const IOS = new URL("../ios/App/App/Assets.xcassets/", import.meta.url).pathname;
const PUB = new URL("../public/", import.meta.url).pathname;

const mochaSvg = (w, h) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0.55" y2="1">
          <stop offset="0" stop-color="#7c584e"/>
          <stop offset="0.52" stop-color="#533a34"/>
          <stop offset="1" stop-color="#33221f"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
    </svg>`,
  );

// アプリアイコン (不透明必須): モカ背景 + 正規シンボル(白)
const symbol = await sharp(`${BRAND}kema-symbol-white.png`).resize({ width: 560 }).toBuffer();
await sharp(mochaSvg(1024, 1024))
  .composite([{ input: symbol, gravity: "center" }])
  .flatten({ background: "#533a34" })
  .png()
  .toFile(`${IOS}AppIcon.appiconset/AppIcon-512@2x.png`);

// スプラッシュ: モカ背景 + 正規ロゴ全体(白)
const logo = await sharp(`${BRAND}kema-logo-white.png`).resize({ width: 860 }).toBuffer();
const splash = await sharp(mochaSvg(2732, 2732))
  .composite([{ input: logo, gravity: "center" }])
  .flatten({ background: "#533a34" })
  .png()
  .toBuffer();
for (const name of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) {
  await sharp(splash).toFile(`${IOS}Splash.imageset/${name}`);
}

// favicon / PWA アイコン
const symSmall = await sharp(`${BRAND}kema-symbol-white.png`).resize({ width: 300 }).toBuffer();
await sharp(mochaSvg(512, 512))
  .composite([{ input: symSmall, gravity: "center" }])
  .png()
  .toFile(`${PUB}icon.png`);

console.log("brand assets generated.");
