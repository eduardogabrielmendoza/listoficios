import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const profileStatusEnum = pgEnum("profile_status", ["draft", "published", "paused", "suspended"]);
export const serviceModeEnum = pgEnum("service_mode", ["domicilio", "taller", "ambos"]);
export const pricingModeEnum = pgEnum("pricing_mode", ["from", "hourly", "fixed", "quote"]);
export const contactChannelEnum = pgEnum("contact_channel", ["whatsapp", "phone"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "published", "rejected"]);
export const reportTargetEnum = pgEnum("report_target", ["profile", "service", "review"]);
export const reportStatusEnum = pgEnum("report_status", ["open", "reviewing", "resolved", "dismissed"]);
export const supportStatusEnum = pgEnum("support_status", ["open", "reviewing", "resolved", "closed"]);
export const notificationKindEnum = pgEnum("notification_kind", ["review", "moderation", "publication", "support", "system"]);

// Better Auth
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user").notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  createdAt,
  updatedAt,
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt,
  updatedAt,
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
}, (table) => [index("session_user_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt,
  updatedAt,
}, (table) => [index("account_user_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

// Marketplace
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt,
  updatedAt,
});

export const zones = pgTable("zones", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt,
  updatedAt,
});

export const professionalProfiles = pgTable("professional_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").unique().references(() => user.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  headline: text("headline").notNull(),
  bio: text("bio").notNull(),
  experienceYears: integer("experience_years").default(0).notNull(),
  phoneCiphertext: text("phone_ciphertext"),
  phoneIv: text("phone_iv"),
  phonePreview: text("phone_preview"),
  avatarKey: text("avatar_key"),
  coverKey: text("cover_key"),
  accentColor: text("accent_color").default("forest").notNull(),
  serviceMode: serviceModeEnum("service_mode").default("domicilio").notNull(),
  status: profileStatusEnum("status").default("draft").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("profiles_status_idx").on(table.status), index("profiles_user_idx").on(table.userId)]);

export const profileZones = pgTable("profile_zones", {
  profileId: uuid("profile_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  zoneId: text("zone_id").notNull().references(() => zones.id, { onDelete: "restrict" }),
}, (table) => [primaryKey({ columns: [table.profileId, table.zoneId] }), index("profile_zones_zone_idx").on(table.zoneId)]);

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  customService: text("custom_service"),
  pricingMode: pricingModeEnum("pricing_mode").default("quote").notNull(),
  priceAmount: integer("price_amount"),
  published: boolean("published").default(true).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("services_profile_slug_uq").on(table.profileId, table.slug), index("services_profile_idx").on(table.profileId)]);

export const serviceCategories = pgTable("service_categories", {
  serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
}, (table) => [primaryKey({ columns: [table.serviceId, table.categoryId] }), index("service_categories_category_idx").on(table.categoryId)]);

export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull().unique(),
  alt: text("alt").default("").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  createdAt,
}, (table) => [index("portfolio_profile_idx").on(table.profileId)]);

export const favorites = pgTable("favorites", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  createdAt,
}, (table) => [primaryKey({ columns: [table.userId, table.profileId] }), index("favorites_profile_idx").on(table.profileId)]);

export const contactEvents = pgTable("contact_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  profileId: uuid("profile_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  channel: contactChannelEnum("channel").notNull(),
  visitorHash: text("visitor_hash"),
  createdAt,
}, (table) => [index("contacts_profile_created_idx").on(table.profileId, table.createdAt), index("contacts_user_idx").on(table.userId)]);

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: reviewStatusEnum("status").default("pending").notNull(),
  moderationNote: text("moderation_note"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("reviews_user_profile_uq").on(table.userId, table.profileId), index("reviews_profile_status_idx").on(table.profileId, table.status)]);

export const reviewReplies = pgTable("review_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id").notNull().unique().references(() => reviews.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt,
  updatedAt,
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterUserId: text("reporter_user_id").references(() => user.id, { onDelete: "set null" }),
  targetType: reportTargetEnum("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  description: text("description").default("").notNull(),
  status: reportStatusEnum("status").default("open").notNull(),
  visitorHash: text("visitor_hash"),
  resolvedBy: text("resolved_by").references(() => user.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [index("reports_status_created_idx").on(table.status, table.createdAt), index("reports_target_idx").on(table.targetType, table.targetId)]);

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: text("number").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  userType: text("user_type").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  status: supportStatusEnum("status").default("open").notNull(),
  adminNotes: text("admin_notes"),
  createdAt,
  updatedAt,
}, (table) => [index("support_status_created_idx").on(table.status, table.createdAt)]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  kind: notificationKindEnum("kind").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  href: text("href"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt,
}, (table) => [index("notifications_user_read_idx").on(table.userId, table.readAt)]);

export const profileDailyStats = pgTable("profile_daily_stats", {
  profileId: uuid("profile_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  day: date("day").notNull(),
  views: integer("views").default(0).notNull(),
  contacts: integer("contacts").default(0).notNull(),
  favorites: integer("favorites").default(0).notNull(),
}, (table) => [primaryKey({ columns: [table.profileId, table.day] })]);

export const moderationActions = pgTable("moderation_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminUserId: text("admin_user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  action: text("action").notNull(),
  reason: text("reason").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt,
}, (table) => [index("moderation_target_idx").on(table.targetType, table.targetId)]);

export const rateLimits = pgTable("rate_limits", {
  keyHash: text("key_hash").notNull(),
  action: text("action").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").default(1).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [primaryKey({ columns: [table.keyHash, table.action, table.windowStart] }), index("rate_limits_expiry_idx").on(table.expiresAt)]);

export const schema = {
  user, session, account, verification,
  categories, zones, professionalProfiles, profileZones, services, serviceCategories,
  portfolioItems, favorites, contactEvents, reviews, reviewReplies, reports,
  supportTickets, notifications, profileDailyStats, moderationActions, rateLimits,
};
