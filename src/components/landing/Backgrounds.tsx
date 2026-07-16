/** サロン: ゆらめく毛束のようなカーブ (背景アニメーション) */
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
