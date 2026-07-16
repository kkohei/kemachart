import { useState } from "react";
import type { TreatmentRecord } from "../types";
import { renderKarteCanvas } from "../utils/karte";
import { canvasToPdfBlob } from "../utils/pdf";
import { saveOrShareFile } from "../utils/exportFile";

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("png failed"))), "image/png");
  });
}

function baseName(rec: TreatmentRecord): string {
  const name = (rec.customerName || "お客様").replace(/[\\/:*?"<>|\s]+/g, "_");
  return `KEMA_${name}_${rec.date}`;
}

export function KarteExport({ record }: { record: TreatmentRecord }) {
  const [busy, setBusy] = useState<null | "image" | "pdf">(null);
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  async function exportAs(kind: "image" | "pdf") {
    if (busy) return;
    setBusy(kind);
    try {
      const canvas = await renderKarteCanvas(record);
      if (kind === "image") {
        const blob = await canvasToPngBlob(canvas);
        const res = await saveOrShareFile(blob, `${baseName(record)}.png`, "施術カルテ");
        flash(res.message);
      } else {
        const blob = canvasToPdfBlob(canvas);
        const res = await saveOrShareFile(blob, `${baseName(record)}.pdf`, "施術カルテ");
        flash(res.message);
      }
    } catch {
      flash("出力に失敗しました");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="karte-export">
      <div className="karte-export__btns">
        <button
          className="btn btn--ghost"
          onClick={() => exportAs("image")}
          disabled={busy !== null}
        >
          {busy === "image" ? "作成中…" : "🖼 画像で保存"}
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => exportAs("pdf")}
          disabled={busy !== null}
        >
          {busy === "pdf" ? "作成中…" : "📄 PDFで保存"}
        </button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
