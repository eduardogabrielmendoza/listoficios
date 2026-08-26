import Image from "next/image";

const palettes = {
  forest: { bg: "#e6f1ed", color: "#125849" },
  ocean: { bg: "#e4eef0", color: "#255f6d" },
  sunset: { bg: "#f3e9df", color: "#81513d" },
  plum: { bg: "#eee9f1", color: "#5f526b" },
};

export function Avatar({
  initials,
  tone,
  imageUrl,
  className = "",
}: {
  initials: string;
  tone: keyof typeof palettes;
  imageUrl?: string | null;
  className?: string;
}) {
  const palette = palettes[tone];

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-[22%] ${className}`}
      style={{ backgroundColor: palette.bg }}
      role="img"
      aria-label={imageUrl ? `Foto de perfil de ${initials}` : `Iniciales de ${initials}`}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill sizes="(max-width: 640px) 96px, 144px" className="object-cover" />
      ) : <span aria-hidden="true" className="grid h-full w-full place-items-center text-[.34em] font-semibold uppercase tracking-[-.02em]" style={{ color: palette.color }}>{initials.slice(0, 2)}</span>}
      <span className="sr-only">{imageUrl ? `Foto de ${initials}` : `Iniciales ${initials}`}</span>
    </span>
  );
}
