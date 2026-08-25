import type { SVGProps } from "react";
import {
  ArrowLeft, ArrowRight, Bell, BrickWall, CalendarDays, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Eye, FileClock, Flame, Gauge,
  Hammer, Heart, ImageIcon, Leaf, LayoutDashboard, LockKeyhole, Mail, MapPin,
  Menu, MessageCircle, PaintRoller, Pencil, Phone, Plus, RotateCcw, Search,
  Settings2, ShieldCheck, Snowflake, Sparkles, Star, Tag, Trash2, UserRound,
  UsersRound, Wrench, X, Zap, type LucideIcon,
} from "lucide-react";

export type IconName =
  | "arrow-right" | "arrow-left" | "bolt" | "brick" | "calendar" | "check"
  | "chevron-down" | "chevron-left" | "chevron-right" | "clock" | "droplet"
  | "flame" | "heart" | "help" | "hammer" | "leaf" | "location" | "lock"
  | "mail" | "menu" | "message" | "paint" | "phone" | "plus" | "search"
  | "shield" | "snowflake" | "sparkles" | "star" | "trash" | "edit"
  | "user" | "users" | "x" | "wrench" | "dashboard" | "moderation"
  | "reports" | "support" | "images" | "settings" | "audit" | "eye"
  | "restore" | "bell" | "tag";

const icons: Record<IconName, LucideIcon> = {
  "arrow-right": ArrowRight, "arrow-left": ArrowLeft, bolt: Zap, brick: BrickWall,
  calendar: CalendarDays, check: Check, "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight, clock: Clock3,
  droplet: Wrench, flame: Flame, heart: Heart, help: CircleHelp, hammer: Hammer,
  leaf: Leaf, location: MapPin, lock: LockKeyhole, mail: Mail, menu: Menu,
  message: MessageCircle, paint: PaintRoller, phone: Phone, plus: Plus,
  search: Search, shield: ShieldCheck, snowflake: Snowflake, sparkles: Sparkles,
  star: Star, trash: Trash2, edit: Pencil, user: UserRound, users: UsersRound,
  x: X, wrench: Wrench, dashboard: LayoutDashboard, moderation: ShieldCheck,
  reports: FileClock, support: CircleHelp, images: ImageIcon, settings: Settings2,
  audit: Gauge, eye: Eye, restore: RotateCcw, bell: Bell, tag: Tag,
};

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, strokeWidth = 1.75, ...props }: IconProps) {
  const Component = icons[name] ?? Wrench;
  return <Component strokeWidth={strokeWidth} aria-hidden="true" {...props} />;
}

export const categoryIconNames: IconName[] = ["wrench", "bolt", "flame", "paint", "hammer", "brick", "leaf", "snowflake"];
