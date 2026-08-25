export type GlobalScrollMode = "smooth" | "native" | "off";

export function selectGlobalScrollMode({ enabled, reducedMotion, saveData, finePointer }: {
  enabled: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  finePointer: boolean;
}): GlobalScrollMode {
  if (!enabled || reducedMotion || saveData) return "off";
  return finePointer ? "smooth" : "native";
}
