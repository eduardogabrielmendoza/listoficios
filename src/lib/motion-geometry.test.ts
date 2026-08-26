import { describe, expect, it } from "vitest";
import { createConnectorPath } from "@/lib/motion-geometry";

describe("createConnectorPath", () => {
  it("connects each card center and finishes at the final card", () => {
    const path = createConnectorPath([{ x: 80, y: 60 }, { x: 320, y: 180 }, { x: 90, y: 310 }]);
    expect(path).toBe("M 80 60 C 80 120, 320 120, 320 180 C 320 245, 90 245, 90 310");
  });

  it("does not create an incomplete connector", () => {
    expect(createConnectorPath([])).toBe("");
    expect(createConnectorPath([{ x: 20, y: 30 }])).toBe("");
  });
});
