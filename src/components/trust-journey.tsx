"use client";

import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/icons";
import { createConnectorPath } from "@/lib/motion-geometry";

const items: Array<{ icon: IconName; title: string; copy: string }> = [
  { icon: "user", title: "Perfil", copy: "Experiencia y servicios" },
  { icon: "location", title: "Cobertura", copy: "Zonas de trabajo" },
  { icon: "message", title: "Contacto", copy: "Conversación directa" },
];

export function TrustJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;
    if (!container || !path) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = container.getBoundingClientRect();
        const points = cardsRef.current.filter(Boolean).map((card) => {
          const box = card!.getBoundingClientRect();
          return { x: box.left - bounds.left + box.width / 2, y: box.top - bounds.top + box.height / 2 };
        });
        path.ownerSVGElement?.setAttribute("viewBox", `0 0 ${Math.max(bounds.width, 1)} ${Math.max(bounds.height, 1)}`);
        path.setAttribute("d", createConnectorPath(points));
      });
    };

    const observer = new ResizeObserver(update);
    observer.observe(container);
    cardsRef.current.forEach((card) => { if (card) observer.observe(card); });
    update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  return (
    <div ref={containerRef} className="trust-journey">
      <svg className="trust-route" fill="none" aria-hidden="true">
        <path ref={pathRef} data-motion-trust-path data-path-normalized="true" pathLength="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="trust-route-list">
        {items.map((item, index) => (
          <div ref={(node) => { cardsRef.current[index] = node; }} data-motion-trust-node key={item.title} className={`trust-route-card trust-route-card-${index + 1}`}>
            <span><Icon name={item.icon} className="size-5" /></span>
            <div><p>{item.title}</p><small>{item.copy}</small></div>
          </div>
        ))}
      </div>
    </div>
  );
}
