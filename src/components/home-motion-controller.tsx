"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomeMotionMode } from "@/lib/home-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function reveal(selector: string, trigger: string, stagger = 0.08) {
  const items = gsap.utils.toArray<HTMLElement>(selector);
  if (!items.length) return;
  gsap.from(items, {
    y: 30,
    opacity: 0,
    duration: 0.75,
    stagger,
    ease: "power3.out",
    scrollTrigger: { trigger, start: "top 82%", toggleActions: "play none none reverse" },
  });
}

export default function HomeMotionController({ mode }: { mode: HomeMotionMode }) {
  useGSAP(() => {
    const home = document.querySelector<HTMLElement>("[data-motion-home]");
    if (!home) return;

    home.classList.add("home-motion-ready", `home-motion-${mode}`);

    const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
    entrance
      .from("[data-motion-hero-eyebrow]", { yPercent: 115, opacity: 0, duration: 0.55 })
      .from("[data-motion-title-line]", { yPercent: 110, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.25")
      .from("[data-motion-highlight]", { "--motion-sweep": "0%", duration: 0.7 }, "-=0.35")
      .from("[data-motion-hero-copy]", { y: 20, opacity: 0, duration: 0.55 }, "-=0.4")
      .from("[data-motion-search]", { y: 22, opacity: 0, scale: 0.985, duration: 0.65 }, "-=0.35")
      .from("[data-motion-hero-card]", { y: 36, opacity: 0, scale: 0.94, duration: 0.8 }, "-=0.55");

    if (mode === "desktop") {
      gsap.to("[data-motion-hero-copy-group]", {
        yPercent: 9,
        ease: "none",
        scrollTrigger: { trigger: "[data-motion-hero]", start: "top top", end: "bottom top", scrub: 0.7 },
      });
      gsap.to("[data-motion-hero-card]", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: "[data-motion-hero]", start: "top top", end: "bottom top", scrub: 0.7 },
      });
    }

    reveal("[data-motion-category-card]", "[data-motion-categories]", 0.07);
    gsap.from("[data-motion-category-rule]", {
      scaleX: 0,
      transformOrigin: "left center",
      ease: "none",
      scrollTrigger: { trigger: "[data-motion-categories]", start: "top 78%", end: "top 42%", scrub: true },
    });
    reveal("[data-motion-professional-card]", "[data-motion-professionals]", 0.1);
    reveal("[data-motion-step]", "[data-motion-how]", 0.12);

    const trustPath = document.querySelector<SVGPathElement>("[data-motion-trust-path]");
    if (trustPath) {
      const length = trustPath.getTotalLength();
      gsap.set(trustPath, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(trustPath, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: "[data-motion-trust]", start: "top 72%", end: "center 45%", scrub: true } });
      reveal("[data-motion-trust-node]", "[data-motion-trust]", 0.16);
    }

    gsap.from("[data-motion-final-circle]", {
      scale: 0.28,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: "[data-motion-final]", start: "top 85%", end: "center 60%", scrub: true },
    });
    reveal("[data-motion-final-content]", "[data-motion-final]", 0.1);

    const story = document.querySelector<HTMLElement>("[data-motion-story]");
    const scenes = gsap.utils.toArray<HTMLElement>("[data-story-scene]");
    const dots = gsap.utils.toArray<HTMLElement>("[data-story-dot]");
    if (story && scenes.length) {
      if (mode === "desktop") {
        gsap.set(scenes, { autoAlpha: 0, y: 34, scale: 0.985 });
        gsap.set(scenes[0], { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(dots[0], { scale: 1.3, backgroundColor: "var(--accent)" });
        const storyTimeline = gsap.timeline({
          scrollTrigger: { trigger: story, start: "top top", end: "bottom bottom", scrub: 0.65, invalidateOnRefresh: true },
        });
        scenes.forEach((scene, index) => {
          if (index === 0) return;
          const previous = scenes[index - 1];
          storyTimeline
            .to(previous, { autoAlpha: 0, y: -28, scale: 0.98, duration: 0.32, ease: "power2.inOut" })
            .to(scene, { autoAlpha: 1, y: 0, scale: 1, duration: 0.46, ease: "power3.out" }, "<0.08")
            .to(dots[index - 1], { scale: 1, backgroundColor: "rgba(255,255,255,.3)", duration: 0.15 }, "<")
            .to(dots[index], { scale: 1.3, backgroundColor: "var(--accent)", duration: 0.15 }, "<");
        });
        gsap.to("[data-story-progress]", { scaleX: 1, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: story, start: "top top", end: "bottom bottom", scrub: true } });
      } else {
        scenes.forEach((scene) => {
          gsap.from(scene, { y: 26, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: scene, start: "top 84%", toggleActions: "play none none reverse" } });
        });
      }
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      window.removeEventListener("load", refresh);
      home.classList.remove("home-motion-ready", `home-motion-${mode}`);
    };
  }, { dependencies: [mode], revertOnUpdate: true });

  return null;
}
