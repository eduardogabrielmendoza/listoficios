import type { PricingMode, ServiceMode } from "@/lib/app-types";

export type ProfileStatus = "draft" | "published" | "paused" | "suspended";
export type ProfileRow = {
  id: string;
  user_id: string | null;
  slug: string;
  display_name: string;
  headline: string;
  bio: string;
  experience_years: number;
  phone_ciphertext: string | null;
  phone_iv: string | null;
  phone_preview: string | null;
  accent_color: string;
  service_mode: ServiceMode;
  status: ProfileStatus;
  moderation_status?: "pending" | "approved" | "rejected" | "changes_requested";
  moderation_note?: string | null;
  is_demo: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  profile_id: string;
  slug: string;
  title: string;
  description: string;
  custom_service: string | null;
  pricing_mode: PricingMode;
  price_amount: number | null;
  published: boolean;
  moderation_status?: "pending" | "approved" | "rejected" | "changes_requested";
  moderation_note?: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceView = {
  id: string;
  profileId: string;
  slug: string;
  title: string;
  description: string;
  customService: string | null;
  pricingMode: PricingMode;
  priceAmount: number | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ZoneRow = { id: string; slug: string; name: string; description: string; sort_order: number; active: boolean };
export type CategoryRow = { id: string; slug: string; name: string; description: string; icon: string; sort_order: number; active: boolean };
export type PortfolioRow = { id: string; profile_id: string; storage_key: string; alt: string; caption?: string; kind?: "avatar" | "cover" | "work"; focal_x?: number; focal_y?: number; sort_order: number; width: number; height: number; created_at: string; updated_at?: string };

export type ProfileGraph = ProfileRow & {
  services: (ServiceRow & { service_categories: { category_id: string; categories: { name: string } | null }[] })[];
  profile_zones: { zone_id: string; zones: { name: string } | null }[];
  reviews: { rating: number; status: string }[];
  portfolio_items: PortfolioRow[];
};

export type NotificationRow = { id: string; user_id: string; kind: string; title: string; body: string; href: string | null; read_at: string | null; created_at: string };
export type ReviewRow = { id: string; user_id: string; profile_id: string; rating: number; title: string; body: string; status: string; moderation_note: string | null; created_at: string; updated_at: string };
export type ReportRow = { id: string; reporter_user_id: string | null; target_type: string; target_id: string; reason: string; description: string; status: string; visitor_hash: string | null; resolved_by: string | null; resolved_at: string | null; created_at: string; updated_at: string };
export type SupportRow = { id: string; number: string; user_id: string | null; name: string; email: string; user_type: string; topic: string; message: string; status: string; admin_notes: string | null; created_at: string; updated_at: string };
