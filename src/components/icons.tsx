import type { SVGProps } from "react";

export type IconName =
  | "arrow-right"
  | "arrow-left"
  | "bolt"
  | "brick"
  | "calendar"
  | "check"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "clock"
  | "droplet"
  | "flame"
  | "heart"
  | "help"
  | "hammer"
  | "leaf"
  | "location"
  | "lock"
  | "mail"
  | "menu"
  | "message"
  | "paint"
  | "phone"
  | "plus"
  | "search"
  | "shield"
  | "snowflake"
  | "sparkles"
  | "star"
  | "trash"
  | "edit"
  | "user"
  | "users"
  | "x";

const paths: Record<IconName, React.ReactNode> = {
  "arrow-right": <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  "arrow-left": <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
  bolt: <path d="M13 2 4.8 13h6.4L11 22l8.2-11h-6.4L13 2Z"/>,
  brick: <><path d="M3 6h18v12H3z"/><path d="M8 6v4m8-4v4M3 10h18M6 10v4m8-4v4m7 4H3m5-4v4m8-4v4"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  "chevron-down": <path d="m7 10 5 5 5-5"/>,
  "chevron-left": <path d="m15 18-6-6 6-6"/>,
  "chevron-right": <path d="m9 18 6-6-6-6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  droplet: <path d="M12 2.5S5.5 9.6 5.5 14.4A6.5 6.5 0 0 0 18.5 14.4C18.5 9.6 12 2.5 12 2.5Z"/>,
  flame: <path d="M12.5 2.5c.8 4-2.1 5.2-2.1 8 0 1.3.8 2.1 1.8 2.1 1.8 0 2.8-1.7 2.3-4.2 2.7 2.1 4.2 4.4 4.2 7A6.7 6.7 0 0 1 5.3 15c0-4.3 2.8-8 7.2-12.5Z"/>,
  heart: <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.15c-.8.42-1.3.92-1.3 1.85M12 17h.01"/></>,
  hammer: <><path d="m14 4 6 6-3 3-6-6 3-3Z"/><path d="m12.5 8.5-9 9a2.1 2.1 0 0 0 3 3l9-9"/></>,
  leaf: <><path d="M20.5 3.5C12 3.5 5 7.4 5 14a5.5 5.5 0 0 0 5.5 5.5c6.6 0 10-7 10-16Z"/><path d="M4 21c3-6 7-9 13-12"/></>,
  location: <><path d="M20 10c0 5.6-8 12-8 12S4 15.6 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  message: <path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.5-4A9 9 0 1 1 21 12Z"/>,
  paint: <><path d="m14 4 6 6-8.5 8.5a3 3 0 0 1-4.2 0l-1.8-1.8a3 3 0 0 1 0-4.2L14 4Z"/><path d="m12 6 6 6M5 20c-.2 1.4-1 2-2 2 0-1.7.6-2.5 2-2Z"/></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.12.9.34 1.8.65 2.65a2 2 0 0 1-.45 2.1L8 9.75a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.85.31 1.74.53 2.65.65A2 2 0 0 1 22 16.9Z"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  shield: <><path d="M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  snowflake: <><path d="M12 2v20M4 7l16 10M4 17 20 7"/><path d="m9 4 3 3 3-3m-6 16 3-3 3 3M5 10l4 .5-1-4m11 7-4-.5 1 4M5 14l4-.5-1 4m11-7-4 .5 1-4"/></>,
  sparkles: <><path d="m12 3 1.2 3.2L16 8l-2.8 1.8L12 13l-1.2-3.2L8 8l2.8-1.8L12 3Z"/><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Zm13-1 .7 1.8 1.8.7-1.8.7L18 18l-.7-1.8-1.8-.7 1.8-.7L18 13Z"/></>,
  star: <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z"/>,
  trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
  x: <><path d="m6 6 12 12M18 6 6 18"/></>,
};

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
