/**
 * canvas を JPEG として1枚のPDFに埋め込みます (依存ライブラリなし)。
 * A4縦に収まるよう画像を等比で配置します。
 */
export function canvasToPdfBlob(canvas: HTMLCanvasElement, quality = 0.85): Blob {
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const jpeg = dataURLtoUint8(dataUrl);

  // A4 (pt): 595 x 842
  const pageW = 595;
  const pageH = 842;
  const margin = 24;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const scale = Math.min(maxW / canvas.width, maxH / canvas.height);
  const drawW = canvas.width * scale;
  const drawH = canvas.height * scale;
  const offX = (pageW - drawW) / 2;
  const offY = pageH - margin - drawH; // 上寄せ

  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (chunk: Uint8Array | string) => {
    const u = typeof chunk === "string" ? enc.encode(chunk) : chunk;
    parts.push(u);
    length += u.length;
  };
  const startObj = () => offsets.push(length);

  push("%PDF-1.3\n");

  // 1: Catalog
  startObj();
  push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // 2: Pages
  startObj();
  push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // 3: Page
  startObj();
  push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
      `/Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`,
  );

  // 4: Content stream (place image)
  const content = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${offX.toFixed(2)} ${offY.toFixed(2)} cm\n/Im0 Do\nQ\n`;
  startObj();
  push(`4 0 obj\n<< /Length ${enc.encode(content).length} >>\nstream\n`);
  push(content);
  push("endstream\nendobj\n");

  // 5: Image XObject (JPEG via DCTDecode)
  startObj();
  push(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  push(jpeg);
  push("\nendstream\nendobj\n");

  // xref
  const xrefStart = length;
  const objCount = offsets.length + 1;
  let xref = `xref\n0 ${objCount}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  push(xref);
  push(`trailer\n<< /Size ${objCount} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}

function dataURLtoUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
