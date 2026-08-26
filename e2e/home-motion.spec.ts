import { expect, test } from "@playwright/test";

async function visibleSiblingCollisions(page: import("@playwright/test").Page, selector: string) {
  return page.locator(selector).evaluateAll((elements) => {
    const boxes = elements.map((element) => ({ style: getComputedStyle(element), box: element.getBoundingClientRect() }))
      .filter(({ style, box }) => style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.05 && box.width > 0 && box.height > 0)
      .map(({ box }) => box);
    let collisions = 0;
    boxes.forEach((box, index) => boxes.slice(index + 1).forEach((other) => {
      const separated = box.right <= other.left + 1 || other.right <= box.left + 1 || box.bottom <= other.top + 1 || other.bottom <= box.top + 1;
      if (!separated) collisions += 1;
    }));
    return collisions;
  });
}

test("la narrativa y el mapa completan sus escenas antes de liberar el contenido", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Una búsqueda clara/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Buscar" })).toBeEnabled();
  await expect(page.locator("[data-story-scene]")).toHaveCount(4);
  await expect(page.locator("[data-services-scene]")).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "Servicios cerca tuyo" })).toBeAttached();
  await expect(page.getByRole("link", { name: /Explorar todos los servicios/ })).toHaveAttribute("href", "/servicios");
  await expect(page.locator("body")).not.toContainText(/Hecho para Bella Vista|Ejemplo visual/);
  await expect(page.getByText("Explorá por oficio", { exact: true })).toHaveCount(0);
  await expect(page.locator("[data-home-demo] [role=img]")).toHaveCount(0);

  const demoControls = page.locator("[data-home-demo] a, [data-home-demo] button, a[data-home-demo], button[data-home-demo]");
  await expect(demoControls).toHaveCount(0);
  await expect(page.locator(".story-contact-cta")).toContainText("Contacto preparado");

  const storySticky = page.locator("[data-story-sticky]");
  const servicesSticky = page.locator("[data-services-sticky]");
  if (testInfo.project.name === "desktop") {
    await expect(page.locator("html")).toHaveAttribute("data-global-scroll", "smooth");

    const storyTop = await page.locator("[data-motion-story]").evaluate((element) => element.getBoundingClientRect().top + scrollY);
    await page.evaluate((top) => scrollTo(0, top + innerHeight * 0.55), storyTop);
    await expect.poll(() => storySticky.evaluate((element) => getComputedStyle(element).position)).toBe("fixed");

    const servicesTop = await servicesSticky.evaluate((element) => element.getBoundingClientRect().top + scrollY);
    await page.evaluate((top) => scrollTo(0, top + 120), servicesTop);
    await expect.poll(() => servicesSticky.evaluate((element) => getComputedStyle(element).position)).toBe("fixed");
    await expect.poll(() => storySticky.evaluate((element) => getComputedStyle(element).position)).not.toBe("fixed");

    await page.locator("[data-motion-how]").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: /Encontrar ayuda/ })).toBeVisible();
    await expect.poll(() => servicesSticky.evaluate((element) => getComputedStyle(element).position)).not.toBe("fixed");
  } else {
    await expect(page.locator("html")).toHaveAttribute("data-global-scroll", "native");
    await expect(storySticky.locator("xpath=..")).toHaveClass(/pin-spacer/);
    const storyTop = await page.locator("[data-motion-story]").evaluate((element) => element.getBoundingClientRect().top + scrollY);
    const storyProgressBefore = await page.locator("[data-story-progress]").evaluate((element) => getComputedStyle(element).transform);
    await page.evaluate((top) => scrollTo(0, top + 920), storyTop);
    await expect.poll(() => page.locator("[data-story-progress]").evaluate((element) => getComputedStyle(element).transform)).not.toBe(storyProgressBefore);

    const servicesTop = await servicesSticky.evaluate((element) => element.getBoundingClientRect().top + scrollY);
    await expect(servicesSticky.locator("xpath=..")).toHaveClass(/pin-spacer/);
    const servicesProgressBefore = await page.locator("[data-services-progress]").evaluate((element) => getComputedStyle(element).transform);
    await page.evaluate((top) => scrollTo(0, top + 920), servicesTop);
    await expect.poll(() => page.locator("[data-services-progress]").evaluate((element) => getComputedStyle(element).transform)).not.toBe(servicesProgressBefore);
  }
});

test("el servicio del hero permanece contenido y cambia sin duplicarse", async ({ page }, testInfo) => {
  await page.goto("/");
  const compact = page.locator("[data-hero-service-compact]");
  const desktop = page.locator("[data-hero-service-card]");
  await expect(testInfo.project.name === "desktop" ? desktop : compact).toBeVisible();
  await expect(testInfo.project.name === "desktop" ? compact : desktop).toBeHidden();
  const overflow = await (testInfo.project.name === "desktop" ? desktop : compact).evaluate((element) => {
    const box = element.getBoundingClientRect();
    const child = element.firstElementChild?.getBoundingClientRect();
    return child ? Math.max(0, child.right - box.right, box.left - child.left) : 0;
  });
  expect(overflow).toBeLessThanOrEqual(1);
  if (testInfo.project.name === "desktop") {
    const trade = desktop.locator(".hero-service-swap p").first();
    const initialTrade = await trade.textContent();
    await expect.poll(() => trade.textContent(), { timeout: 6_000 }).not.toBe(initialTrade);
  }
});

test("las rutas se trazan de forma progresiva y reversible", async ({ page }, testInfo) => {
  await page.goto("/");
  const sticky = page.locator("[data-services-sticky]");
  await expect(sticky.locator("xpath=..")).toHaveClass(/pin-spacer/);
  const triggerTop = await sticky.locator("xpath=..").evaluate((element) => element.getBoundingClientRect().top + scrollY);
  const distance = await page.evaluate((desktop) => desktop ? Math.max(3600, innerHeight * 4.15) : Math.max(3900, innerHeight * 5.45), testInfo.project.name === "desktop");
  const samples: number[][] = [];
  for (const progress of [0.45, 0.52, 0.59, 0.66, 0.73]) {
    await page.evaluate(({ top, offset }) => scrollTo(0, top + offset), { top: triggerTop, offset: distance * progress });
    await page.waitForTimeout(testInfo.project.name === "desktop" ? 450 : 180);
    samples.push(await page.locator(".services-zone-svg:visible [data-services-map-path]").evaluateAll((paths) => paths.map((path) => {
      const svgPath = path as SVGPathElement;
      const dashLength = Number.parseFloat(getComputedStyle(path).strokeDasharray) || svgPath.getTotalLength();
      const offset = Number.parseFloat(getComputedStyle(path).strokeDashoffset) || 0;
      return Math.max(0, Math.min(1, 1 - offset / dashLength));
    })));
  }
  const totals = samples.map((sample) => sample.reduce((total, progress) => total + progress, 0));
  expect(totals.at(-1) ?? 0).toBeGreaterThan((totals[0] ?? 0) + 0.5);
  expect(samples.some((sample) => sample.some((progress) => progress > 0.08 && progress < 0.92))).toBe(true);
  totals.slice(1).forEach((total, index) => expect(total).toBeGreaterThanOrEqual(totals[index] - 0.08));
  const routeMasks = await page.locator("[data-services-map-path]").evaluateAll((paths) => paths.map((path) => {
    const svgPath = path as SVGPathElement;
    const dashLength = Number.parseFloat(getComputedStyle(svgPath).strokeDasharray) || 0;
    return dashLength - svgPath.getTotalLength();
  }));
  expect(routeMasks.every((extraLength) => extraLength >= 5)).toBe(true);

  const trust = page.locator("[data-motion-trust]");
  const trustRange = await trust.evaluate((element) => {
    const top = element.getBoundingClientRect().top + scrollY;
    const height = element.getBoundingClientRect().height;
    return { start: top - innerHeight * 0.76, end: top + height - innerHeight * 0.72, height, viewport: innerHeight };
  });
  expect(trustRange.end - trustRange.start).toBeLessThan(trustRange.height + trustRange.viewport * 0.08);
  const trustProgress = async () => page.locator("[data-motion-trust-path]").evaluate((path) => {
    const svgPath = path as SVGPathElement;
    return 1 - (Number.parseFloat(getComputedStyle(svgPath).strokeDashoffset) || 0) / svgPath.getTotalLength();
  });
  await page.evaluate(({ start, end }) => scrollTo(0, start + (end - start) * 0.55), trustRange);
  await page.waitForTimeout(testInfo.project.name === "desktop" ? 650 : 250);
  expect(await trustProgress()).toBeGreaterThan(0.15);
  expect(await trustProgress()).toBeLessThan(0.9);
  await page.evaluate(({ end }) => scrollTo(0, end + 10), trustRange);
  await page.waitForTimeout(120);
  expect(await trustProgress()).toBeGreaterThan(0.94);
  const trustExitProgress = await trust.evaluate(async (element) => {
    const bottom = element.getBoundingClientRect().bottom + scrollY;
    scrollTo(0, bottom - innerHeight * 0.2);
    await new Promise((resolve) => setTimeout(resolve, 120));
    const path = element.querySelector<SVGPathElement>("[data-motion-trust-path]");
    if (!path) return 0;
    return 1 - (Number.parseFloat(getComputedStyle(path).strokeDashoffset) || 0) / path.getTotalLength();
  });
  expect(trustExitProgress).toBeGreaterThan(0.98);
  await page.evaluate(({ start }) => scrollTo(0, start - 10), trustRange);
  await page.waitForTimeout(testInfo.project.name === "desktop" ? 650 : 250);
  expect(await trustProgress()).toBeLessThan(0.08);
});

test("comparación, cobertura y confianza conservan geometría segura", async ({ page }, testInfo) => {
  await page.goto("/");

  if (testInfo.project.name === "desktop") {
    const storyTop = await page.locator("[data-motion-story]").evaluate((element) => element.getBoundingClientRect().top + scrollY);
    const distance = await page.evaluate(() => Math.max(2800, innerHeight * 3.45));
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      await page.evaluate(({ top, offset }) => scrollTo(0, top + offset), { top: storyTop, offset: distance * progress });
      await page.waitForTimeout(180);
      expect(await visibleSiblingCollisions(page, ".story-profile-card"), `tarjetas al ${progress * 100}%`).toBe(0);
    }
  }

  await page.locator(".services-zones-scene").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-services-map-path]")).toHaveCount(2);
  const pathCommands = await page.locator("[data-services-map-path]").evaluateAll((paths) => paths.map((path) => (path.getAttribute("d")?.match(/M/g) ?? []).length));
  expect(pathCommands.every((count) => count === 1)).toBe(true);
  expect(await visibleSiblingCollisions(page, ".services-map-node"), "nodos de cobertura").toBe(0);

  await page.locator("[data-motion-trust]").scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("[data-motion-trust-path]").getAttribute("d")).not.toBe("");
  await page.waitForTimeout(850);
  expect(await visibleSiblingCollisions(page, ".trust-route-card"), "tarjetas de confianza").toBe(0);
  const routeEndDistance = await page.locator(".trust-journey").evaluate((container) => {
    const path = container.querySelector<SVGPathElement>("[data-motion-trust-path]");
    const contact = container.querySelector<HTMLElement>(".trust-route-card-3");
    if (!path || !contact) return Number.POSITIVE_INFINITY;
    const point = path.getPointAtLength(path.getTotalLength());
    const containerBox = container.getBoundingClientRect();
    const contactBox = contact.getBoundingClientRect();
    const target = { x: contactBox.left - containerBox.left + contactBox.width / 2, y: contactBox.top - containerBox.top + contactBox.height / 2 };
    return Math.hypot(point.x - target.x, point.y - target.y);
  });
  expect(routeEndDistance).toBeLessThanOrEqual(3);
});

test("el controlador global permanece activo al navegar y bloquea overlays", async ({ page }, testInfo) => {
  for (const route of ["/", "/profesionales", "/ayuda", "/ingresar"]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("data-global-scroll", testInfo.project.name === "desktop" ? "smooth" : "native");
  }

  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: /Abrir menú/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-scroll-locked", "true");
    await page.getByRole("complementary").getByRole("button", { name: /Cerrar menú/ }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-scroll-locked", "true");
  }
});

test("movimiento reducido mantiene el contenido completo sin pinning", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-global-scroll", "off");
  await expect(page.locator("[data-motion-home]")).not.toHaveClass(/home-motion-ready/);
  await expect(page.locator("[data-story-scene]")).toHaveCount(4);
  await expect(page.locator("[data-services-scene]")).toHaveCount(4);
  await expect(page.locator("[data-story-scene]").last()).toBeVisible();
  await expect(page.locator("[data-services-scene]").last()).toBeVisible();
  await expect(page.locator("[data-home-demo] a, [data-home-demo] button")).toHaveCount(0);
});

test("los segmentos conservan gaps y ancho seguro en los breakpoints objetivo", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "La matriz responsive se ejecuta una sola vez.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const result = await page.evaluate(() => {
      const selectors = ["[data-motion-hero]", "[data-motion-story]", "[data-motion-services]", "[data-motion-how]"];
      const boxes = selectors.map((selector) => document.querySelector<HTMLElement>(selector)?.getBoundingClientRect()).filter(Boolean) as DOMRect[];
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        internalOverflow: Array.from(document.querySelectorAll<HTMLElement>("[data-motion-home] *")).filter((element) => {
          const style = getComputedStyle(element);
          return ["auto", "scroll"].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
        }).length,
        collisions: boxes.slice(1).filter((box, index) => box.top < boxes[index].bottom - 1).length,
      };
    });
    expect(result.overflow, `overflow horizontal a ${width}px`).toBeLessThanOrEqual(1);
    expect(result.internalOverflow, `contenedores laterales a ${width}px`).toBe(0);
    expect(result.collisions, `secciones superpuestas a ${width}px`).toBe(0);
  }
});

test("las escenas activas caben en teléfonos pequeños", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "La prueba corresponde al modo móvil.");
  for (const viewport of [{ width: 320, height: 568 }, { width: 360, height: 640 }]) {
    await page.goto("about:blank");
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("[data-motion-home].home-motion-mobile")).toHaveCount(1);
    await expect(page.locator("[data-story-sticky]").locator("xpath=..")).toHaveClass(/pin-spacer/);
    const storyTop = await page.locator("[data-motion-story]").evaluate((element) => element.getBoundingClientRect().top + scrollY);
    await page.evaluate((top) => scrollTo(0, top + 1700), storyTop);
    await page.waitForTimeout(250);
    const storyFit = await page.locator("[data-story-scene]").evaluateAll((scenes) => {
      const active = scenes.toSorted((a, b) => Number(getComputedStyle(b).opacity) - Number(getComputedStyle(a).opacity))[0] as HTMLElement;
      const box = active.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, overflow: active.scrollHeight - active.clientHeight };
    });
    expect(storyFit.top).toBeGreaterThanOrEqual(-2);
    expect(storyFit.bottom).toBeLessThanOrEqual(viewport.height + 2);
    expect(storyFit.overflow).toBeLessThanOrEqual(16);
    expect(await visibleSiblingCollisions(page, ".story-profile-card")).toBe(0);

    await expect(page.locator("[data-services-sticky]").locator("xpath=..")).toHaveClass(/pin-spacer/);
    const servicesTop = await page.locator("[data-services-sticky]").evaluate((element) => element.getBoundingClientRect().top + scrollY);
    await page.evaluate((top) => scrollTo(0, top + 2400), servicesTop);
    await page.waitForTimeout(250);
    const servicesFit = await page.locator("[data-services-scene]").evaluateAll((scenes) => {
      const active = scenes.toSorted((a, b) => Number(getComputedStyle(b).opacity) - Number(getComputedStyle(a).opacity))[0] as HTMLElement;
      const box = active.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, overflow: active.scrollHeight - active.clientHeight };
    });
    expect(servicesFit.top).toBeGreaterThanOrEqual(-2);
    expect(servicesFit.bottom).toBeLessThanOrEqual(viewport.height + 2);
    expect(servicesFit.overflow).toBeLessThanOrEqual(16);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});
