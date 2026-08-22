export type ApiMeta = {
  requestId?: string;
  nextCursor?: string | null;
  total?: number;
};

export type ApiResponse<T> = { data: T; meta?: ApiMeta };
export type ApiFieldErrors = Record<string, string[]>;
export type ApiError = {
  error: {
    code: string;
    message: string;
    fieldErrors?: ApiFieldErrors;
    requestId: string;
  };
};

export type UserRole = "user" | "admin";
export type ProfileStatus = "draft" | "published" | "paused" | "suspended";
export type ReviewStatus = "pending" | "published" | "rejected";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export type ServiceListing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  categories: string[];
  customService: string | null;
  pricingMode: "from" | "hourly" | "fixed" | "quote";
  priceAmount: number | null;
};

export type PortfolioItem = { id: string; url: string; alt: string; width: number; height: number };
export type PublicProfessionalProfile = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  experienceYears: number;
  zones: string[];
  serviceMode: "domicilio" | "taller" | "ambos";
  phonePreview: string | null;
  accentColor: string;
  services: ServiceListing[];
  portfolio: PortfolioItem[];
  rating: number | null;
  reviewCount: number;
  isDemo: boolean;
};

export type ProfessionalAnalytics = { day: string; views: number; contacts: number; favorites: number };
export type NotificationEntry = { id: string; kind: string; title: string; body: string; href: string | null; readAt: string | null; createdAt: string };
