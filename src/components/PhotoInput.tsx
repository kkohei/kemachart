import { useRef, useState } from "react";
import { MAX_PHOTOS_PER_RECORD } from "../constants";
import { fileToCompressedDataURL } from "../utils/image";

/**
 * 複数枚の写真をカメラ/ライブラリから追加・削除できる入力。
 * remaining = この記録であと何枚追加できるか (ビフォー+アフター合計10枚まで)。
 */
export function PhotoInput({
  label,
  photos,
  remaining,
  onChange,
}: {
  label: string;
  photos: string[];
  remaining: number;
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const allowed = images.slice(0, Math.max(0, remaining));
    if (images.length > allowed.length) {
      alert(`写真は1件の記録につき合計${MAX_PHOTOS_PER_RECORD}枚までです。追加できるのはあと${Math.max(0, remaining)}枚です。`);
    }
    if (allowed.length === 0) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setBusy(true);
    try {
      const added: string[] = [];
      for (const file of allowed) {
        added.push(await fileToCompressedDataURL(file));
      }
      onChange([...photos, ...added]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const full = remaining <= 0;

  return (
    <div className="photo-input">
      <div className="photo-input__head">
        <span className="photo-input__label">{label}</span>
        <span className="photo-input__count">{photos.length}枚</span>
      </div>
      <div className="photo-grid">
        {photos.map((p, i) => (
          <div className="photo-thumb" key={i}>
            <img src={p} alt={`${label} ${i + 1}`} />
            <button
              type="button"
              className="photo-thumb__del"
              onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
              aria-label="写真を削除"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="photo-add"
          onClick={() => inputRef.current?.click()}
          disabled={busy || full}
        >
          {busy ? "処理中…" : full ? "上限10枚" : "＋ 写真"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
