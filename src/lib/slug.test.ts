import { describe, expect, it } from "vitest";
import { createSlug } from "@/lib/slug";

describe("createSlug", () => {
  it("normaliza acentos, espacios y signos", () => {
    expect(createSlug("  Reparación de Cañerías 24 h  ")).toBe("reparacion-de-canerias-24-h");
  });
});
