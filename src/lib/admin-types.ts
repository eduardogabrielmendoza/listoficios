export type StaffRole = "user" | "moderator" | "admin";
export type Permission =
  | "moderation:read"
  | "moderation:write"
  | "support:write"
  | "profiles:correct"
  | "users:ban"
  | "users:roles"
  | "catalogs:write"
  | "site:write"
  | "audit:read";

export type ModerationScope = "profile" | "service" | "review" | "support" | "report";
export type ModerationAction = "allow" | "review" | "block";
export type ModerationDecision = "pending" | "approved" | "rejected" | "changes_requested";

export type ModerationMatch = {
  ruleId: string;
  field: string;
  category: string;
  action: "review" | "block";
};

export type ModerationResult = {
  action: ModerationAction;
  matches: ModerationMatch[];
  fieldErrors: Record<string, string[]>;
};

export type ModerationRule = {
  id: string;
  term: string;
  normalizedTerm: string;
  matchType: "word" | "phrase";
  action: "review" | "block";
  scopes: ModerationScope[];
  category: string;
  notes: string;
  active: boolean;
  hitCount: number;
  createdAt: string;
};

export type ModerationCase = {
  id: string;
  targetType: ModerationScope | "media";
  targetId: string | null;
  userId: string | null;
  payload: Record<string, unknown>;
  matches: ModerationMatch[];
  priority: "low" | "medium" | "high";
  status: "open" | "assigned" | "resolved" | "dismissed";
  decision: ModerationDecision;
  publicReason: string;
  internalNote: string;
  assignedTo: string | null;
  createdAt: string;
};

export type AuditEntry = {
  id: string;
  actorId: string;
  actorRole: StaffRole | null;
  targetType: string;
  targetId: string;
  action: string;
  reason: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  createdAt: string;
};
