import { Capacitor } from "@capacitor/core";

export interface ExportResult {
  ok: boolean;
  message: string;
}

/**
 * Blob を保存/共有します。
 *  - ネイティブ (iOS/Android): キャッシュに書き出して共有シートを表示
 *  - Web/PWA: Web Share API (ファイル対応時) → 非対応ならダウンロード
 */
export async function saveOrShareFile(
  blob: Blob,
  filename: string,
  title: string,
): Promise<ExportResult> {
  if (Capacitor.isNativePlatform()) {
    try {
      const base64 = await blobToBase64(blob);
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const write = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
      });
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, files: [write.uri] });
      return { ok: true, message: "共有しました" };
    } catch (e) {
      const msg = (e as Error)?.message ?? "";
      if (msg.toLowerCase().includes("cancel")) return { ok: false, message: "キャンセルしました" };
      return { ok: false, message: "保存に失敗しました" };
    }
  }

  // Web: ファイル共有を試す
  const file = new File([blob], filename, { type: blob.type });
  const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ title, files: [file] });
      return { ok: true, message: "共有しました" };
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return { ok: false, message: "キャンセルしました" };
    }
  }

  // フォールバック: ダウンロード
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { ok: true, message: "ダウンロードしました" };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result);
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
