import { useRef, useState } from "react";
import type { TitledPhoto } from "../types";
import { MAX_EXTRA_PHOTOS } from "../constants";
import { uid } from "../utils/id";
import { fileToCompressedDataURL } from "../utils/image";

/**
 * タイトル付き写真の入力 (施術中など)。ビフォー/アフターとは別枠で最大5枚。
 */
export function ExtraPhotoInput({
  photos,
  onChange,
}: {
  photos: TitledPhoto[];
  onChange: (next: TitledPhoto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const remaining = MAX_EXTRA_PHOTOS - photos.length;
  const full = remaining <= 0;

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const allowed = images.slice(0, Math.max(0, remaining));
    if (images.length > allowed.length) {
      alert(`その他の写真は最大${MAX_EXTRA_PHOTOS}枚までです。追加できるのはあと${Math.max(0, remaining)}枚です。`);
    }
    if (allowed.length === 0) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setBusy(true);
    try {
      const added: TitledPhoto[] = [];
      for (const file of allowed) {
        added.push({ id: uid(), title: "", photo: await fileToCompressedDataURL(file) });
      }
      onChange([...photos, ...added]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function update(id: string, title: string) {
    onChange(photos.map((p) => (p.id === id ? { ...p, title } : p)));
  }
  function remove(id: string) {
    onChange(photos.filter((p) => p.id !== id));
  }

  return (
    <div className="xphoto">
      {photos.map((p) => (
        <div className="xphoto__item" key={p.id}>
          <img className="xphoto__img" src={p.photo} alt={p.title || "写真"} />
          <div className="xphoto__body">
            <input
              className="input xphoto__title"
              placeholder="タイトル（例: 施術中）"
              value={p.title}
              onChange={(e) => update(p.id, e.target.value)}
            />
          </div>
          <button
            type="button"
            className="xphoto__del"
            aria-label="写真を削除"
            onClick={() => remove(p.id)}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="photo-add xphoto__add"
        onClick={() => inputRef.current?.click()}
        disabled={busy || full}
      >
        {busy ? "処理中…" : full ? `上限${MAX_EXTRA_PHOTOS}枚` : "＋ 写真を追加"}
      </button>
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
