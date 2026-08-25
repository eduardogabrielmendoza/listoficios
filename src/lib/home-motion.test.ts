import { describe, expect, it } from "vitest";
import { selectHomeMotionMode } from "@/lib/home-motion";

describe("selectHomeMotionMode", () => {
  it("uses the desktop narrative when every capability is available", () => {
    expect(selectHomeMotionMode({ enabled: true, reducedMotion: false, saveData: false, desktop: true })).toBe("desktop");
  });

  it("uses short mobile reveals on smaller screens", () => {
    expect(selectHomeMotionMode({ enabled: true, reducedMotion: false, saveData: false, desktop: false })).toBe("mobile");
  });

  it.each([
    { enabled: false, reducedMotion: false, saveData: false },
    { enabled: true, reducedMotion: true, saveData: false },
    { enabled: true, reducedMotion: false, saveData: true },
  ])("turns motion off for accessibility and efficiency preferences", (preferences) => {
    expect(selectHomeMotionMode({ ...preferences, desktop: true })).toBe("off");
  });
});
