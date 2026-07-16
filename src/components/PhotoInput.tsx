import { useRef, useState } from "react";
import { fileToCompressedDataURL } from "../utils/image";

/** 複数枚の写真をカメラ/ライブラリから追加・削除できる入力 */
export function PhotoInput({
  label,
  photos,
  onChange,
}: {
  label: string;
  photos: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        added.push(await fileToCompressedDataURL(file));
      }
      onChange([...photos, ...added]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

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
          disabled={busy}
        >
          {busy ? "処理中…" : "＋ 写真"}
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
