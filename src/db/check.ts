import postgres from "postgres";

type DatabaseError = Error & {
  code?: string;
  errno?: string;
  address?: string;
  port?: number;
};

function safeError(error: unknown, password: string) {
  if (!(error instanceof Error)) return { message: "Error de base de datos desconocido" };
  const detail = error as DatabaseError;
  const message = password ? error.message.replaceAll(password, "[PASSWORD_OCULTA]") : error.message;
  return {
    name: error.name,
    code: detail.code ?? detail.errno ?? "SIN_CODIGO",
    message,
    address: detail.address,
    port: detail.port,
  };
}

async function main() {
  const rawUrl = process.env.DATABASE_URL?.trim();
  if (!rawUrl) throw new Error("DATABASE_URL_NO_CONFIGURADA");

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("DATABASE_URL_INVALIDA: no se pudo interpretar la URI");
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error(`DATABASE_URL_INVALIDA: debe comenzar con postgresql://, no con ${parsed.protocol}//`);
  }

  const port = parsed.port || "5432";
  console.info(
    `[db:check] Conectando con protocolo=${parsed.protocol.replace(':', '')} host=${parsed.hostname} puerto=${port} base=${parsed.pathname.slice(1) || 'postgres'}`,
  );

  if (parsed.hostname.endsWith(".supabase.co") && !parsed.hostname.endsWith(".pooler.supabase.com")) {
    console.warn("[db:check] La conexión directa de Supabase puede requerir IPv6. Para Railway usá Session pooler en el puerto 5432.");
  }

  const client = postgres(rawUrl, {
    max: 1,
    connect_timeout: 45,
    idle_timeout: 5,
    prepare: false,
  });

  try {
    const [result] = await client<{ categories: number }[]>`
      select count(*)::int as categories from public.categories
    `;
    console.info(`[db:check] Conexión y esquema correctos; categorías=${result.categories}`);
  } catch (error) {
    console.error(`[db:check] ERROR ${JSON.stringify(safeError(error, parsed.password))}`);
    throw error;
  } finally {
    await client.end({ timeout: 2 }).catch(() => undefined);
  }
}

main().catch((error) => {
  const password = (() => {
    try {
      return process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).password : "";
    } catch {
      return "";
    }
  })();
  console.error(`[db:check] FALLO_FINAL ${JSON.stringify(safeError(error, password))}`);
  process.exitCode = 1;
});
