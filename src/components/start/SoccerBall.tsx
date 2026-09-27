/** A classic white ball with black patches, drawn for a black background. */
export function SoccerBall({ className }: { className?: string }) {
  // Center pentagon and the five patches around it, cut off by the ball's edge.
  const pentagon = (cx: number, cy: number, r: number, rotate = 0) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = ((i * 72 - 90 + rotate) * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ");

  const outer = Array.from({ length: 5 }, (_, i) => {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    return [50 + 43 * Math.cos(a), 50 + 43 * Math.sin(a)] as const;
  });

  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <clipPath id="ball-clip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#f4f6f4" />
      <g clipPath="url(#ball-clip)" fill="#0b0d10" stroke="#0b0d10" strokeWidth="1.6">
        <polygon points={pentagon(50, 50, 15)} />
        {outer.map(([x, y], i) => (
          <polygon key={i} points={pentagon(x, y, 14, 36)} />
        ))}
        {/* Seams from the center patch out to the edge patches. */}
        {Array.from({ length: 5 }, (_, i) => {
          const a = ((i * 72 - 90) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={50 + 15 * Math.cos(a)}
              y1={50 + 15 * Math.sin(a)}
              x2={50 + 30 * Math.cos(a)}
              y2={50 + 30 * Math.sin(a)}
              fill="none"
            />
          );
        })}
      </g>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#d9dde0" strokeWidth="1.5" />
    </svg>
  );
}
