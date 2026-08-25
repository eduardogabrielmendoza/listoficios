"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function NavigationFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationKey = `${pathname}?${searchParams.toString()}`;
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    indicatorRef.current?.classList.remove("is-active");
  }, [locationKey]);

  useEffect(() => {
    let fallback: ReturnType<typeof setTimeout> | undefined;
    function begin(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement) || target.target === "_blank" || target.hasAttribute("download")) return;
      const next = new URL(target.href, window.location.href);
      if (next.origin !== window.location.origin || `${next.pathname}${next.search}` === `${window.location.pathname}${window.location.search}` || next.hash && next.pathname === window.location.pathname && next.search === window.location.search) return;
      indicatorRef.current?.classList.add("is-active");
      if (fallback) clearTimeout(fallback);
      fallback = setTimeout(() => indicatorRef.current?.classList.remove("is-active"), 6000);
    }
    document.addEventListener("click", begin, true);
    return () => {
      document.removeEventListener("click", begin, true);
      if (fallback) clearTimeout(fallback);
    };
  }, []);

  return <div ref={indicatorRef} className="navigation-feedback" aria-hidden="true"><span /></div>;
}
