export const motionTokens = {
  ease: { reveal: "power3.out", scene: "power2.inOut" },
  reveal: { desktopStart: "top 78%", mobileStart: "top 82%", distance: 26 },
  story: { screens: 3.45, minimumDistance: 2800, scrub: 0.5 },
  services: { screens: 3.2, minimumDistance: 2800, scrub: 0.48 },
} as const;
