export type HomeMotionMode = "off" | "mobile" | "desktop";

export type HomeMotionCapabilities = {
  enabled: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  desktop: boolean;
};

export function selectHomeMotionMode(capabilities: HomeMotionCapabilities): HomeMotionMode {
  if (!capabilities.enabled || capabilities.reducedMotion || capabilities.saveData) return "off";
  return capabilities.desktop ? "desktop" : "mobile";
}
