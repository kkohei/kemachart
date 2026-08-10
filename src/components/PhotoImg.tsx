import { useEffect, useState } from "react";
import { isPhotoRef, loadPhoto } from "../utils/photoStore";

/**
 * 写真参照 (kphoto:...) を非同期に解決して表示する img。
 * dataURL ならそのまま表示 (旧データ互換)。
 */
export function usePhotoSrc(src: string | undefined | null): string | undefined {
  const [resolved, setResolved] = useState<string | undefined>(() =>
    src && !isPhotoRef(src) ? src : undefined,
  );

  useEffect(() => {
    let alive = true;
    if (!src) {
      setResolved(undefined);
      return;
    }
    if (!isPhotoRef(src)) {
      setResolved(src);
      return;
    }
    setResolved(undefined);
    void loadPhoto(src).then((d) => {
      if (alive) setResolved(d ?? undefined);
    });
    return () => {
      alive = false;
    };
  }, [src]);

  return resolved;
}

export function PhotoImg({
  src,
  alt,
  className,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
}) {
  const resolved = usePhotoSrc(src);
  if (!resolved) {
    return <span className={`photo-pending ${className ?? ""}`} role="img" aria-label={alt} />;
  }
  return <img className={className} src={resolved} alt={alt} />;
}
