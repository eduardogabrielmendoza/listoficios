import { describe, expect, it } from "vitest";
import { defaultSiteConfig, normalizeSiteConfig, siteConfigSchema } from "@/lib/site-config";

describe("configuración del sitio", () => {
  it("acepta la configuración inicial", () => {
    expect(siteConfigSchema.safeParse(defaultSiteConfig).success).toBe(true);
  });

  it("rechaza colores y destinos inseguros", () => {
    const invalid = structuredClone(defaultSiteConfig);
    invalid.theme.brand = "red";
    invalid.home.primaryCtaHref = "https://sitio-ajeno.example";
    expect(siteConfigSchema.safeParse(invalid).success).toBe(false);
  });

  it("actualiza una configuración anterior con valores seguros de movimiento", () => {
    const legacy = structuredClone(defaultSiteConfig) as unknown as Record<string, unknown>;
    legacy.schemaVersion = 1;
    delete legacy.motion;
    const migrated = normalizeSiteConfig(legacy);
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.motion.enabled).toBe(true);
    expect(migrated.motion.smoothScrollEnabled).toBe(true);
    expect(migrated.motion.searchText).toContain("pérdida");
    expect(migrated.motion.servicesTitle).toBe("Servicios cerca tuyo");
  });
});
