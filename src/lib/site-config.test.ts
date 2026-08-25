import { describe, expect, it } from "vitest";
import { defaultSiteConfig, siteConfigSchema } from "@/lib/site-config";

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
});
