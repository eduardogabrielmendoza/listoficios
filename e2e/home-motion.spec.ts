import { expect, test } from "@playwright/test";

test("la narrativa se completa antes de liberar el siguiente bloque", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Una búsqueda clara/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Buscar" })).toBeEnabled();

  const story = page.locator("[data-motion-story]");
  const sticky = page.locator("[data-story-sticky]");
  if (testInfo.project.name === "desktop") {
    await expect(story).toHaveClass(/home-story/);
    const box = await story.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThan(page.viewportSize()!.height * 3);
    const storyTop = await story.evaluate((element) => element.getBoundingClientRect().top + scrollY);
    await page.evaluate((top) => scrollTo(0, top + innerHeight), storyTop);
    await expect.poll(() => sticky.evaluate((element) => getComputedStyle(element).position)).toBe("fixed");
    await page.locator("[data-motion-professionals]").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Servicios cerca tuyo" })).toBeVisible();
    await expect.poll(() => sticky.evaluate((element) => getComputedStyle(element).position)).not.toBe("fixed");
  } else {
    await expect.poll(() => sticky.evaluate((element) => getComputedStyle(element).position)).toBe("static");
    await expect(page.locator("[data-story-scene]")).toHaveCount(4);
  }
});

test("movimiento reducido muestra el estado final sin pinning", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-motion-home]")).not.toHaveClass(/home-motion-ready/);
  await expect(page.locator("[data-story-scene]")).toHaveCount(4);
  await expect(page.locator("[data-story-scene]").last()).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver perfil y contactar/ })).toBeVisible();
});
