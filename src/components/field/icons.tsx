/** Small inline icons for the scene controls. `off` adds a red slash. */

function Slash() {
  return <line x1="3" y1="3" x2="21" y2="21" stroke="#ff5a5a" strokeWidth="2.2" />;
}

const svgProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function MusicIcon({ off }: { off: boolean }) {
  return (
    <svg {...svgProps}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
      {off && <Slash />}
    </svg>
  );
}

export function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg {...svgProps}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <Slash />}
    </svg>
  );
}

export function PersonIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}
