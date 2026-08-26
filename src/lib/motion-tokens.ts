export const motionTokens = {
  ease: { reveal: "power3.out", scene: "power2.inOut" },
  reveal: { desktopStart: "top 78%", mobileStart: "top 82%", distance: 26 },
  story: { screens: 3.45, minimumDistance: 2800, mobileScreens: 4.35, mobileMinimumDistance: 3000, scrub: 0.5 },
  services: { screens: 3.8, minimumDistance: 3300, mobileScreens: 5.1, mobileMinimumDistance: 3700, scrub: 0.48 },
} as const;
