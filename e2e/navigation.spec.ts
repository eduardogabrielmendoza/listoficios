import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

async function backendReady(page: import("@playwright/test").Page) {
  return (await page.request.get("/api/health")).ok();
}

async function register(page: import("@playwright/test").Page, suffix: string) {
  await page.goto("/crear-cuenta");
  await page.getByLabel("Nombre y apellido").fill("Ana López");
  await page.getByLabel("Correo electrónico").fill(`ana-${suffix}@listoficios.test`);
  await page.getByLabel("Contraseña", { exact: true }).fill("clave-segura-123");
  await page.getByLabel("Confirmar contraseña").fill("clave-segura-123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/panel/);
}

test("búsqueda fija Bella Vista y filtros en URL", async ({ page }) => {
  await page.getByPlaceholder("Ej. plomero, pintar una habitación…").fill("plomero");
  await page.getByLabel("Zona de Bella Vista").selectOption("Centro");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/\/profesionales\?q=plomero&zone=Centro/);
  await expect(page.getByRole("heading", { name: "Profesionales en Bella Vista" })).toBeVisible();
});

test("perfil y contacto demo sin cuenta", async ({ page }) => {
  await page.goto("/profesionales");
  await page.getByRole("link", { name: /Ver perfil de Diego Sosa/ }).click();
  await expect(page.getByRole("heading", { name: "Diego Sosa" })).toBeVisible();
  await page.getByRole("button", { name: "Contactar por WhatsApp" }).click();
  await expect(page.getByRole("dialog", { name: "Contacto preparado" })).toContainText("Hola, vi tu perfil en Listoficios");
  await expect(page.getByRole("dialog")).toContainText("nunca abre un número real");
});

test("registro real no guarda la contraseña", async ({ page }, testInfo) => {
  test.skip(!(await backendReady(page)), "Requiere Supabase configurado");
  await register(page, `${testInfo.project.name}-${Date.now()}`);
  const local = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(local).not.toContain("clave-segura-123");
  const cookies = await page.context().cookies();
  expect(cookies.some((cookie) => cookie.name.includes("auth-token"))).toBe(true);
});

test("otro servicio y precio 1200 llegan a la vista previa", async ({ page }, testInfo) => {
  test.skip(!(await backendReady(page)), "Requiere Supabase configurado");
  await register(page, `oficio-${testInfo.project.name}-${Date.now()}`);
  await page.goto("/profesionales/crear-perfil");
  await page.getByLabel("Nombre").fill("Ana");
  await page.getByLabel("Apellido").fill("Pérez");
  await page.getByLabel("Correo").fill(`ana-${testInfo.project.name}@test.com`);
  await page.getByLabel("WhatsApp").fill("3815551234");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByRole("button", { name: "+ Otro servicio" }).click();
  await page.getByLabel("Contanos qué hacés").fill("Reparo máquinas de coser");
  await page.getByLabel("Años de experiencia").fill("5");
  await page.getByLabel("Descripción profesional").fill("Reparo máquinas familiares con diagnóstico claro y trabajo cuidadoso en cada visita.");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByRole("button", { name: "Centro" }).click();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Modalidad de precio").selectOption("from");
  await page.getByLabel("Importe orientativo").fill("1200");
  await expect(page.getByText(/Desde \$1\.200/)).toBeVisible();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(page.getByText("Reparo máquinas de coser").first()).toBeVisible();
  await expect(page.getByText("Desde $1.200")).toBeVisible();
});

test("brillo no sigue el puntero y selector cabe", async ({ page }) => {
  const glow = page.locator(".ambient-glow").first();
  const before = await glow.getAttribute("style");
  await page.mouse.move(320, 220);
  await page.waitForTimeout(120);
  expect(await glow.getAttribute("style")).toBe(before);
  const box = await page.getByLabel("Zona de Bella Vista").boundingBox();
  const viewport = page.viewportSize();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport?.width ?? 9999);
});

test("agenda antigua redirige al panel protegido", async ({ page }) => {
  await page.goto("/profesionales/agenda");
  await expect(page).toHaveURL(/\/panel|\/ingresar/);
});

test("no hay desborde horizontal", async ({ page }) => {
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
  }
});
