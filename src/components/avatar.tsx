const palettes = {
  forest: { bg: "#d8eee3", skin: "#c98557", shirt: "#16604f", hair: "#29362f" },
  ocean: { bg: "#dcebf0", skin: "#ad6c45", shirt: "#296678", hair: "#2c2825" },
  sunset: { bg: "#f7e0cf", skin: "#d18b60", shirt: "#c85f45", hair: "#5d382c" },
  plum: { bg: "#eadff0", skin: "#b97652", shirt: "#66507c", hair: "#30262f" },
};

export function Avatar({
  initials,
  tone,
  className = "",
}: {
  initials: string;
  tone: keyof typeof palettes;
  className?: string;
}) {
  const palette = palettes[tone];

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-[22%] ${className}`}
      style={{ backgroundColor: palette.bg }}
      role="img"
      aria-label={`Foto de perfil de ${initials}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <circle cx="79" cy="19" r="18" fill="white" opacity=".38" />
        <path d="M15 101c2-28 16-41 35-41s33 13 35 41H15Z" fill={palette.shirt} />
        <path d="M39 56h22v15c-6 5-16 5-22 0V56Z" fill={palette.skin} />
        <ellipse cx="50" cy="40" rx="21" ry="25" fill={palette.skin} />
        <path d="M29 39c0-21 11-29 24-29 15 0 23 11 21 28-5-4-8-10-9-16-8 8-19 12-36 12v5Z" fill={palette.hair} />
        <path d="M34 34c-5 0-7 4-5 9 1 4 4 6 7 5m28-14c5 0 7 4 5 9-1 4-4 6-7 5" fill={palette.skin} />
        <circle cx="42" cy="41" r="1.7" fill="#2d2521" />
        <circle cx="58" cy="41" r="1.7" fill="#2d2521" />
        <path d="M44 51c4 3 8 3 12 0" fill="none" stroke="#8d4f3e" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{initials}</span>
    </span>
  );
}
