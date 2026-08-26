"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGlobalScroll } from "@/components/global-scroll-provider";
import type { HomeMotionMode } from "@/lib/home-motion";
import { motionTokens } from "@/lib/motion-tokens";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function reveal(selector: string, trigger: string, stagger = 0.08) {
  const items = gsap.utils.toArray<HTMLElement>(selector);
  if (!items.length) return;
  gsap.from(items, { y: 30, opacity: 0, duration: 0.75, stagger, ease: "power3.out", scrollTrigger: { trigger, start: "top 82%", toggleActions: "play none none reverse" } });
}

function drawPath(path: SVGPathElement, trigger: string, start: string, end: string) {
  const length = path.dataset.pathNormalized === "true" ? 1 : path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger, start, end, scrub: true } });
}

export default function HomeMotionController({ mode }: { mode: HomeMotionMode }) {
  const { lenis, acquireExternalFrame } = useGlobalScroll();
  useGSAP(() => {
    const home = document.querySelector<HTMLElement>("[data-motion-home]");
    if (!home) return;
    home.classList.add("home-motion-ready", `home-motion-${mode}`);
    if (new URLSearchParams(window.location.search).get("motionDebug") === "1") home.classList.add("home-motion-debug");
    const onVisibility = () => document.hidden ? gsap.ticker.sleep() : gsap.ticker.wake();
    document.addEventListener("visibilitychange", onVisibility);

    let removeLenisScroll: (() => void) | undefined;
    let releaseExternalFrame: (() => void) | undefined;
    const updateLenis = (time: number) => lenis?.raf(time * 1000);
    if (mode === "desktop" && lenis) {
      releaseExternalFrame = acquireExternalFrame();
      removeLenisScroll = lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);
    }

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("[data-motion-title-line]", { yPercent: 82, opacity: 0, duration: 0.52, stagger: 0.055 }, 0.05)
      .from("[data-motion-highlight]", { "--motion-sweep": "0%", duration: 0.65, ease: "power2.out" }, 0.34)
      .from("[data-motion-hero-copy]", { y: 13, opacity: 0, duration: 0.36 }, 0.28)
      .from("[data-motion-search]", { y: 12, scale: 0.99, duration: 0.42 }, 0.2)
      .from("[data-motion-hero-card]", { y: 18, scale: 0.97, duration: 0.48 }, 0.22);

    if (mode === "desktop") {
      gsap.to("[data-motion-hero-copy-group]", { yPercent: 9, ease: "none", scrollTrigger: { trigger: "[data-motion-hero]", start: "top top", end: "bottom top", scrub: 0.7 } });
      gsap.to("[data-motion-hero-card]", { yPercent: -10, ease: "none", scrollTrigger: { trigger: "[data-motion-hero]", start: "top top", end: "bottom top", scrub: 0.7 } });
    }

    const services = document.querySelector<HTMLElement>("[data-motion-services]");
    const servicesSticky = document.querySelector<HTMLElement>("[data-services-sticky]");
    const serviceScenes = gsap.utils.toArray<HTMLElement>("[data-services-scene]");
    const serviceDots = gsap.utils.toArray<HTMLElement>("[data-services-dot]");
    const serviceMapPaths = gsap.utils.toArray<SVGPathElement>("[data-services-map-path]");
    const serviceMapNodes = gsap.utils.toArray<SVGGElement>("[data-services-map-node], [data-services-map-center]");
    if (services && servicesSticky && serviceScenes.length) {
      gsap.from("[data-services-intro-copy]", { y: 34, opacity: 0, duration: 0.75, ease: "power3.out", scrollTrigger: { trigger: "[data-services-intro]", start: "top 84%", toggleActions: "play none none reverse" } });
      if (mode === "desktop") {
        gsap.set(serviceScenes, { autoAlpha: 0, y: 42, scale: 0.98 });
        gsap.set(serviceScenes[0], { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(serviceDots[0], { color: "var(--ink)", opacity: 1 });
        serviceMapPaths.forEach((path) => {
          const length = path.dataset.pathNormalized === "true" ? 1 : path.getTotalLength();
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        });
        gsap.set(serviceMapNodes, { autoAlpha: 0, scale: 0.72, transformOrigin: "center" });
        const servicesDistance = () => Math.max(motionTokens.services.minimumDistance, window.innerHeight * motionTokens.services.screens);
        const servicesTimeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: servicesSticky,
            pin: servicesSticky,
            pinSpacing: true,
            start: "top top",
            end: () => `+=${servicesDistance()}`,
            scrub: motionTokens.services.scrub,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1,
            preventOverlaps: "home-services",
            fastScrollEnd: true,
            onToggle: (self) => servicesSticky.classList.toggle("is-motion-active", self.isActive),
          },
        });

        servicesTimeline.to({}, { duration: 0.42 });

        serviceScenes.forEach((scene, index) => {
          if (index === 0) return;
          const previous = serviceScenes[index - 1];
          servicesTimeline
            .to(previous, { autoAlpha: 0, y: -38, scale: 0.975, duration: 0.32 })
            .to(scene, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }, ">")
            .fromTo(scene.querySelectorAll("[data-services-piece]"), { y: 26, autoAlpha: 0, scale: 0.97 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.05, duration: 0.38, ease: "power3.out" }, "<0.1")
            .to(serviceDots[index - 1], { opacity: 0.38, color: "var(--muted)", duration: 0.12 }, "<")
            .to(serviceDots[index], { opacity: 1, color: "var(--ink)", duration: 0.12 }, "<");
          if (index === 2 && serviceMapPaths.length) {
            servicesTimeline
              .to(serviceMapPaths, { strokeDashoffset: 0, duration: 0.46, ease: "none" }, "<0.08")
              .to(serviceMapNodes, { autoAlpha: 1, scale: 1, stagger: 0.045, duration: 0.28, ease: "power2.out" }, "<0.12");
          }
          servicesTimeline.to({}, { duration: index === serviceScenes.length - 1 ? 0.58 : 0.24 });
        });

        const servicesDuration = servicesTimeline.duration();
        servicesTimeline.fromTo("[data-services-progress]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: servicesDuration, ease: "none" }, 0);
        servicesTimeline.to(".services-orbit", { rotate: (index) => index ? -95 : 110, duration: servicesDuration, ease: "none" }, 0);
      } else {
        serviceScenes.forEach((scene) => {
          const visualPieces = Array.from(scene.querySelectorAll<HTMLElement>("[data-services-piece]")).filter((item) => !item.closest(".services-story-copy"));
          const timeline = gsap.timeline({ scrollTrigger: { trigger: scene, start: "top 80%", toggleActions: "play none none reverse" } });
          timeline.from(scene.querySelectorAll(".services-story-copy > *"), { y: 18, opacity: 0, stagger: 0.055, duration: 0.34, ease: "power3.out" });
          if (visualPieces.length) timeline.from(visualPieces, { y: 18, opacity: 0, scale: 0.985, stagger: 0.055, duration: 0.32, ease: "power3.out" }, "-=0.16");
        });
        serviceMapPaths.forEach((path) => drawPath(path, ".services-zones-scene", "top 82%", "center 52%"));
        gsap.from(serviceMapNodes, { autoAlpha: 0, scale: 0.78, transformOrigin: "center", stagger: 0.055, duration: 0.35, ease: "power2.out", scrollTrigger: { trigger: ".services-zones-scene", start: "top 72%", toggleActions: "play none none reverse" } });
      }
    }

    const howPaths = gsap.utils.toArray<SVGPathElement>("[data-motion-how-path]");
    howPaths.forEach((path) => drawPath(path, "[data-motion-how]", "top 72%", "bottom 58%"));
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
        const scrollDistance = () => Math.max(motionTokens.story.minimumDistance, window.innerHeight * motionTokens.story.screens);
        const storyTimeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: story,
            pin: sticky,
            pinSpacing: true,
            start: "top top",
            end: () => `+=${scrollDistance()}`,
            scrub: motionTokens.story.scrub,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 2,
            preventOverlaps: "home-story",
            fastScrollEnd: true,
            onToggle: (self) => sticky.classList.toggle("is-motion-active", self.isActive),
          },
        });

        storyTimeline.from(scenes[0].querySelectorAll("[data-story-piece]"), { y: 26, autoAlpha: 0, scale: 0.96, stagger: 0.055, duration: 0.45, ease: "power3.out" }, 0).to({}, { duration: 0.28 });
        scenes.forEach((scene, index) => {
          if (index === 0) return;
          const previous = scenes[index - 1];
          storyTimeline
            .to(previous, { autoAlpha: 0, y: -34, scale: 0.975, duration: 0.3 })
            .to(scene, { autoAlpha: 1, y: 0, scale: 1, duration: 0.38, ease: "power3.out" }, ">")
            .fromTo(scene.querySelectorAll("[data-story-piece]"), { y: 28, autoAlpha: 0, scale: 0.96 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.055, duration: 0.4, ease: "power3.out" }, "<0.1")
            .to(dots[index - 1], { scale: 1, backgroundColor: "rgba(255,255,255,.3)", duration: 0.12 }, "<")
            .to(dots[index], { scale: 1.35, backgroundColor: "var(--accent)", duration: 0.12 }, "<")
            .to({}, { duration: index === scenes.length - 1 ? 0.55 : 0.26 });
        });
        const duration = storyTimeline.duration();
        storyTimeline.fromTo("[data-story-progress]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", ease: "none", duration }, 0);
        storyTimeline.to("[data-story-orbit]", { rotate: (index) => index % 2 ? -80 : 95, x: (index) => index * 18 - 12, y: (index) => index * -14, duration, stagger: 0.08, ease: "none" }, 0);
      } else {
        scenes.forEach((scene) => {
          const visualPieces = Array.from(scene.querySelectorAll<HTMLElement>("[data-story-piece]")).filter((item) => !item.closest(".story-copy"));
          const timeline = gsap.timeline({ scrollTrigger: { trigger: scene, start: "top 82%", toggleActions: "play none none reverse" } });
          timeline
            .from(scene.querySelectorAll(".story-copy > *"), { y: 20, opacity: 0, stagger: 0.06, duration: 0.36, ease: "power3.out" })
            .from(visualPieces, { y: 20, opacity: 0, stagger: 0.055, duration: 0.34, ease: "power3.out" }, "-=0.16");
        });
      }
    }

    let active = true;
    const refresh = () => { if (active) ScrollTrigger.refresh(); };
    window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => undefined);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("load", refresh);
      removeLenisScroll?.();
      gsap.ticker.remove(updateLenis);
      releaseExternalFrame?.();
      servicesSticky?.classList.remove("is-motion-active");
      sticky?.classList.remove("is-motion-active");
      gsap.ticker.lagSmoothing(500, 33);
      home.classList.remove("home-motion-ready", `home-motion-${mode}`, "home-motion-debug");
    };
  }, { dependencies: [mode, lenis, acquireExternalFrame], revertOnUpdate: true });

  return null;
}
