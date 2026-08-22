import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const standaloneNext = join(standalone, ".next");
const publicSource = join(root, "public");
const staticSource = join(root, ".next", "static");

if (!existsSync(standalone)) {
  throw new Error("No se encontró .next/standalone. Ejecutá next build antes de preparar los recursos.");
}

mkdirSync(standaloneNext, { recursive: true });

if (existsSync(publicSource)) {
  cpSync(publicSource, join(standalone, "public"), { recursive: true, force: true });
}

cpSync(staticSource, join(standaloneNext, "static"), { recursive: true, force: true });

console.log("[listoficios] Recursos públicos y estáticos incluidos en standalone.");
