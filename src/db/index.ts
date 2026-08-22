import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "@/db/schema";

type Database = ReturnType<typeof createDatabase>;

const globalDatabase = globalThis as typeof globalThis & {
  listoficiosDb?: Database;
  listoficiosSql?: ReturnType<typeof postgres>;
};

function createDatabase() {
  // postgres-js no abre la conexión hasta la primera consulta. La URL de reserva
  // permite compilar la imagen antes de que Railway inyecte DATABASE_URL.
  const url = process.env.DATABASE_URL ?? "postgresql://build:build@127.0.0.1:5432/listoficios";
  const client = postgres(url, {
    max: process.env.NODE_ENV === "production" ? 5 : 3,
    idle_timeout: 20,
    connect_timeout: 45,
    // También permite usar el pooler transaccional de Supabase si fuera necesario.
    prepare: false,
  });
  globalDatabase.listoficiosSql = client;
  return drizzle(client, { schema });
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!globalDatabase.listoficiosDb) globalDatabase.listoficiosDb = createDatabase();
  return globalDatabase.listoficiosDb;
}

export async function closeDb() {
  await globalDatabase.listoficiosSql?.end();
  globalDatabase.listoficiosDb = undefined;
  globalDatabase.listoficiosSql = undefined;
}

export type AppDatabase = ReturnType<typeof getDb>;
