export const motionTokens = {
  ease: { reveal: "power3.out", scene: "power2.inOut" },
  reveal: { desktopStart: "top 78%", mobileStart: "top 82%", distance: 26 },
  story: { screens: 3.45, minimumDistance: 2800, mobileScreens: 4.35, mobileMinimumDistance: 3000, scrub: 0.28 },
  services: { screens: 4.15, minimumDistance: 3600, mobileScreens: 5.45, mobileMinimumDistance: 3900, scrub: 0.24 },
} as const;
