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
    await expect.poll(() => storySticky.evaluate((element) => getComputedStyle(element).position)).not.toBe("fixed");
    await expect.poll(() => servicesSticky.evaluate((element) => getComputedStyle(element).position)).not.toBe("fixed");
    await page.locator("[data-services-scene]").last().scrollIntoViewIfNeeded();
    await expect(page.locator("[data-services-scene]").last()).toBeVisible();
  }
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
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const result = await page.evaluate(() => {
      const selectors = ["[data-motion-hero]", "[data-motion-story]", "[data-motion-services]", "[data-motion-how]"];
      const boxes = selectors.map((selector) => document.querySelector<HTMLElement>(selector)?.getBoundingClientRect()).filter(Boolean) as DOMRect[];
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        collisions: boxes.slice(1).filter((box, index) => box.top < boxes[index].bottom - 1).length,
      };
    });
    expect(result.overflow, `overflow horizontal a ${width}px`).toBeLessThanOrEqual(1);
    expect(result.collisions, `secciones superpuestas a ${width}px`).toBe(0);
  }
});
