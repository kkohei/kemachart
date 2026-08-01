/**
 * 画像ファイルを縮小・圧縮して dataURL (JPEG) に変換します。
 * localStorage の容量を圧迫しないよう、長辺を maxSize px 以下に縮小します。
 */
export async function fileToCompressedDataURL(
  file: File,
  maxSize = 1024,
  quality = 0.68,
): Promise<string> {
  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > maxSize || height > maxSize) {
    const scale = maxSize / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl; // フォールバック
  ctx.drawImage(img, 0, 0, width, height);

  try {
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return dataUrl;
  }
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = src;
  });
}

/** dataURL を Blob に変換 (Web Share API での画像共有に使用) */
export function dataURLtoBlob(dataUrl: string): Blob | null {
  try {
    const [head, body] = dataUrl.split(",");
    const mime = head.match(/:(.*?);/)?.[1] ?? "image/jpeg";
    const bin = atob(body);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch {
    return null;
  }
}
