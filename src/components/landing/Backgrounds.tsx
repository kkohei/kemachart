import { useEffect, useRef } from "react";

/** ① オーロラ: ピンクゴールドのグラデに、ゆっくり漂う光のブロブ */
export function BgAurora() {
  return (
    <div className="bg-aurora" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

/** ② テック: 深色グラデに、動くパーティクル・ネットワーク (Canvas) */
export function BgTechNet() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0,
      h = 0,
      raf = 0;
    const N = 40;
    const pts: { x: number; y: number; vx: number; vy: number }[] = [];
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      pts.length = 0;
      for (let i = 0; i < N; i++) {
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
        });
      }
    }
    function frame() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i],
            b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 118) {
            ctx!.globalAlpha = (1 - d / 118) * 0.45;
            ctx!.strokeStyle = "rgba(255,232,214,1)";
            ctx!.lineWidth = 0.7;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }
      ctx!.globalAlpha = 0.92;
      for (const p of pts) {
        ctx!.fillStyle = "rgba(255,240,228,1)";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    resize();
    init();
    frame();
    const onResize = () => {
      resize();
      init();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />;
}

/** ③ サロン: ピンクゴールドに、ゆらめく毛束のようなカーブ */
export function BgSalon() {
  const strands = [40, 95, 150, 205, 260, 315, 360];
  return (
    <svg
      className="bg-salon"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {strands.map((x, i) => (
        <path
          key={i}
          className="bg-salon__strand"
          style={{ animationDelay: `${(i % 4) * -1.6}s` }}
          d={`M ${x} -20 C ${x - 34} 200, ${x + 34} 480, ${x - 18} 820`}
        />
      ))}
    </svg>
  );
}

/** ④ フォイル: ローズゴールドに斜めのシマー (箔) がゆっくり流れる */
export function BgFoil() {
  return (
    <div className="bg-foil" aria-hidden="true">
      <div className="bg-foil__sheen" />
    </div>
  );
}
