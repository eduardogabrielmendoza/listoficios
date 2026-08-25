import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/permissions";

describe("permisos del equipo", () => {
  it("permite al moderador resolver casos, pero no corregir perfiles", () => {
    expect(hasPermission("moderator", "moderation:write")).toBe(true);
    expect(hasPermission("moderator", "profiles:correct")).toBe(false);
  });

  it("reserva roles, catálogo y CMS para administradores", () => {
    expect(hasPermission("admin", "users:roles")).toBe(true);
    expect(hasPermission("admin", "catalogs:write")).toBe(true);
    expect(hasPermission("admin", "site:write")).toBe(true);
    expect(hasPermission("user", "site:write")).toBe(false);
  });
});
