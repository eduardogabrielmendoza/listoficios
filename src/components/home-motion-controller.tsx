"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomeMotionMode } from "@/lib/home-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function reveal(selector: string, trigger: string, stagger = 0.08) {
  const items = gsap.utils.toArray<HTMLElement>(selector);
  if (!items.length) return;
  gsap.from(items, { y: 30, opacity: 0, duration: 0.75, stagger, ease: "power3.out", scrollTrigger: { trigger, start: "top 82%", toggleActions: "play none none reverse" } });
}

function drawPath(path: SVGPathElement, trigger: string, start: string, end: string) {
  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger, start, end, scrub: true } });
}

export default function HomeMotionController({ mode }: { mode: HomeMotionMode }) {
  useGSAP(() => {
    const home = document.querySelector<HTMLElement>("[data-motion-home]");
    if (!home) return;
    home.classList.add("home-motion-ready", `home-motion-${mode}`);

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("[data-motion-hero-eyebrow]", { yPercent: 115, opacity: 0, duration: 0.55 })
      .from("[data-motion-title-line]", { yPercent: 110, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.25")
      .from("[data-motion-highlight]", { "--motion-sweep": "0%", duration: 0.7 }, "-=0.35")
      .from("[data-motion-hero-copy]", { y: 20, opacity: 0, duration: 0.55 }, "-=0.4")
      .from("[data-motion-search]", { y: 22, opacity: 0, scale: 0.985, duration: 0.65 }, "-=0.35")
      .from("[data-motion-hero-card]", { y: 36, opacity: 0, scale: 0.94, duration: 0.8 }, "-=0.55");

    if (mode === "desktop") {
      gsap.to("[data-motion-hero-copy-group]", { yPercent: 9, ease: "none", scrollTrigger: { trigger: "[data-motion-hero]", start: "top top", end: "bottom top", scrub: 0.7 } });
      gsap.to("[data-motion-hero-card]", { yPercent: -10, ease: "none", scrollTrigger: { trigger: "[data-motion-hero]", start: "top top", end: "bottom top", scrub: 0.7 } });
    }

    reveal("[data-motion-category-card]", "[data-motion-categories]", 0.07);
    gsap.from("[data-motion-category-rule]", { scaleX: 0, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: "[data-motion-categories]", start: "top 78%", end: "top 42%", scrub: true } });

    const professionalTimeline = gsap.timeline({ scrollTrigger: { trigger: "[data-motion-professionals]", start: "top 80%", end: "center 48%", scrub: 0.55 } });
    professionalTimeline
      .from("[data-motion-professional-title]", { yPercent: 105, opacity: 0, duration: 0.42, ease: "power3.out" })
      .from(".home-professionals-summary", { x: 24, opacity: 0, duration: 0.28 }, "<0.08")
      .from("[data-motion-professional-rule]", { scaleX: 0, transformOrigin: "left", duration: 0.4, ease: "none" }, "<")
      .from("[data-motion-professional-chip]", { y: 18, opacity: 0, stagger: 0.06, duration: 0.32 }, "-=0.12")
      .from("[data-motion-professional-card]", { y: 72, opacity: 0, scale: 0.965, stagger: 0.13, duration: 0.6, ease: "power3.out" }, "-=0.08");

    const howPath = document.querySelector<SVGPathElement>("[data-motion-how-path]");
    if (howPath) drawPath(howPath, "[data-motion-how]", "top 72%", "bottom 58%");
    const howTimeline = gsap.timeline({ scrollTrigger: { trigger: "[data-motion-how]", start: "top 78%", end: "bottom 58%", scrub: 0.5 } });
    howTimeline
      .from("[data-motion-how-heading]", { y: 34, opacity: 0, duration: 0.35 })
      .from("[data-motion-how-float]", { scale: 0.72, opacity: 0, stagger: 0.1, duration: 0.3 }, "<0.08")
      .from("[data-motion-step]", { y: 58, opacity: 0, scale: 0.96, stagger: 0.18, duration: 0.55, ease: "power3.out" }, "-=0.08")
      .from(".how-preview", { y: 16, opacity: 0, stagger: 0.1, duration: 0.3 }, "-=0.25");

    const trustPath = document.querySelector<SVGPathElement>("[data-motion-trust-path]");
    if (trustPath) { drawPath(trustPath, "[data-motion-trust]", "top 72%", "center 45%"); reveal("[data-motion-trust-node]", "[data-motion-trust]", 0.16); }
    gsap.from("[data-motion-final-circle]", { scale: 0.28, opacity: 0, ease: "none", scrollTrigger: { trigger: "[data-motion-final]", start: "top 85%", end: "center 60%", scrub: true } });
    reveal("[data-motion-final-content]", "[data-motion-final]", 0.1);

    const story = document.querySelector<HTMLElement>("[data-motion-story]");
    const sticky = document.querySelector<HTMLElement>("[data-story-sticky]");
    const scenes = gsap.utils.toArray<HTMLElement>("[data-story-scene]");
    const dots = gsap.utils.toArray<HTMLElement>("[data-story-dot]");
    if (story && sticky && scenes.length) {
      if (mode === "desktop") {
        gsap.set(scenes, { autoAlpha: 0, y: 34, scale: 0.985 });
        gsap.set(scenes[0], { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(dots[0], { scale: 1.35, backgroundColor: "var(--accent)" });
        const scrollDistance = () => Math.max(2800, window.innerHeight * 3.45);
        const storyTimeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: story,
            pin: sticky,
            pinSpacing: true,
            start: "top top",
            end: () => `+=${scrollDistance()}`,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 2,
          },
        });

        storyTimeline.from(scenes[0].querySelectorAll("[data-story-piece]"), { y: 26, autoAlpha: 0, scale: 0.96, stagger: 0.055, duration: 0.45, ease: "power3.out" }, 0).to({}, { duration: 0.28 });
        scenes.forEach((scene, index) => {
          if (index === 0) return;
          const previous = scenes[index - 1];
          storyTimeline
            .to(previous, { autoAlpha: 0, y: -34, scale: 0.975, duration: 0.3 })
            .to(scene, { autoAlpha: 1, y: 0, scale: 1, duration: 0.38, ease: "power3.out" }, "<0.06")
            .fromTo(scene.querySelectorAll("[data-story-piece]"), { y: 28, autoAlpha: 0, scale: 0.96 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.055, duration: 0.4, ease: "power3.out" }, "<0.1")
            .to(dots[index - 1], { scale: 1, backgroundColor: "rgba(255,255,255,.3)", duration: 0.12 }, "<")
            .to(dots[index], { scale: 1.35, backgroundColor: "var(--accent)", duration: 0.12 }, "<")
            .to({}, { duration: index === scenes.length - 1 ? 0.55 : 0.26 });
        });
        const duration = storyTimeline.duration();
        storyTimeline.fromTo("[data-story-progress]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", ease: "none", duration }, 0);
        storyTimeline.to("[data-story-orbit]", { rotate: (index) => index % 2 ? -80 : 95, x: (index) => index * 18 - 12, y: (index) => index * -14, duration, stagger: 0.08, ease: "none" }, 0);
      } else {
        scenes.forEach((scene) => gsap.from(scene, { y: 26, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: scene, start: "top 84%", toggleActions: "play none none reverse" } }));
      }
    }

    let active = true;
    const refresh = () => { if (active) ScrollTrigger.refresh(); };
    window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => undefined);
    return () => { active = false; window.removeEventListener("load", refresh); home.classList.remove("home-motion-ready", `home-motion-${mode}`); };
  }, { dependencies: [mode], revertOnUpdate: true });

  return null;
}
