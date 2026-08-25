import { describe, expect, it } from "vitest";
import { selectGlobalScrollMode } from "@/lib/global-scroll";

describe("selectGlobalScrollMode", () => {
  it("suaviza únicamente dispositivos con puntero preciso", () => {
    expect(selectGlobalScrollMode({ enabled: true, reducedMotion: false, saveData: false, finePointer: true })).toBe("smooth");
    expect(selectGlobalScrollMode({ enabled: true, reducedMotion: false, saveData: false, finePointer: false })).toBe("native");
  });

  it("desactiva mejoras con movimiento reducido, ahorro de datos o CMS apagado", () => {
    expect(selectGlobalScrollMode({ enabled: true, reducedMotion: true, saveData: false, finePointer: true })).toBe("off");
    expect(selectGlobalScrollMode({ enabled: true, reducedMotion: false, saveData: true, finePointer: true })).toBe("off");
    expect(selectGlobalScrollMode({ enabled: false, reducedMotion: false, saveData: false, finePointer: true })).toBe("off");
  });
});
