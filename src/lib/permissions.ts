import type { Permission, StaffRole } from "@/lib/admin-types";

const permissions: Record<StaffRole, ReadonlySet<Permission>> = {
  user: new Set(),
  moderator: new Set([
    "moderation:read",
    "moderation:write",
    "support:write",
  ]),
  admin: new Set([
    "moderation:read",
    "moderation:write",
    "support:write",
    "profiles:correct",
    "users:ban",
    "users:roles",
    "catalogs:write",
    "site:write",
    "audit:read",
  ]),
};

export function hasPermission(role: StaffRole, permission: Permission) {
  return permissions[role].has(permission);
}

export function isStaff(role: StaffRole) {
  return role === "moderator" || role === "admin";
}
