import { sql } from "@vercel/postgres";

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

async function ensureSchema() {
  await sql`
    create table if not exists contact_messages (
      id text primary key,
      created_at timestamptz not null default now(),
      name text not null,
      email text not null,
      message text not null,
      user_agent text,
      ip text
    );
  `;
}

function createId() {
  try {
    // Node 18+
    // eslint-disable-next-line no-undef
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");

  // Try JSON first
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // ignore
  }

  // Fallback: x-www-form-urlencoded
  try {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  } catch {
    return {};
  }
}

function normalizeText(value, maxLen) {
  const s = String(value ?? "").trim();
  if (!s) return "";
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function hasPostgresConfig() {
  // Vercel Postgres typically injects these when the DB is attached to the project.
  // @vercel/postgres uses a connection string env var under the hood.
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_PRISMA_URL
  );
}

export default async function handler(req, res) {
  try {
    // Always allow same-origin usage
    res.setHeader("Cache-Control", "no-store");

    if (!hasPostgresConfig()) {
      return json(res, 500, {
        error: "db_not_configured",
        message:
          "Database is not configured. Attach a Vercel Postgres database to this project.",
        hint:
          "Vercel → Storage → Postgres → Create/Attach (adds POSTGRES_* env vars automatically).",
      });
    }

    if (req.method === "POST") {
      await ensureSchema();
      const body = await readBody(req);

      const name = normalizeText(body.name, 120);
      const email = normalizeText(body.email, 200);
      const message = normalizeText(body.message, 4000);

      if (!name || !email || !message) {
        return json(res, 400, { error: "name, email, and message are required" });
      }

      const userAgent = normalizeText(req.headers["user-agent"], 300);
      const ip = normalizeText(
        (req.headers["x-forwarded-for"] || "").split(",")[0],
        100
      );

      const id = createId();

      const result = await sql`
        insert into contact_messages (id, name, email, message, user_agent, ip)
        values (${id}, ${name}, ${email}, ${message}, ${userAgent}, ${ip})
        returning id, created_at;
      `;

      return json(res, 201, {
        ok: true,
        id: result.rows?.[0]?.id,
        createdAt: result.rows?.[0]?.created_at,
      });
    }

    return json(res, 405, { error: "method_not_allowed" });
  } catch (err) {
    // Surface errors in Vercel function logs
    console.error("/api/messages error", err);
    return json(res, 500, {
      error: "internal_error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
