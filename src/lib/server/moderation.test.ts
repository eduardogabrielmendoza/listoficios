import { describe, expect, it } from "vitest";
import { moderateFields, normalizeModerationText } from "@/lib/server/moderation";

describe("moderación de texto", () => {
  it("normaliza tildes, mayúsculas y sustituciones comunes", () => {
    expect(normalizeModerationText("¡G4NÁNC1A   garantizada!!!")).toBe("ganancia garantizada");
  });

  it("no bloquea una palabra por una subcadena inocente", async () => {
    const result = await moderateFields("profile", { bio: "Trabajo responsable de pintura y albañilería." });
    expect(result.action).toBe("allow");
  });

  it("envía promesas sospechosas a revisión", async () => {
    const result = await moderateFields("service", { description: "Con este método tenés ganancia garantizada." });
    expect(result.action).toBe("review");
    expect(result.matches[0]?.field).toBe("description");
  });

  it("bloquea una regla inequívoca y asocia el campo", async () => {
    const result = await moderateFields("review", { body: "Esto contiene contenido sexual explícito." });
    expect(result.action).toBe("block");
    expect(result.fieldErrors.body).toBeTruthy();
  });
});
