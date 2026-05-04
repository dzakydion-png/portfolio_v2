import { sql } from "@vercel/postgres";

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function getBearerToken(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (!h || typeof h !== "string") return null;
  const [scheme, token] = h.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

function parseBasicAuth(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (!h || typeof h !== "string") return null;
  const [scheme, encoded] = h.split(" ");
  if (scheme !== "Basic" || !encoded) return null;
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx === -1) return null;
    return {
      user: decoded.slice(0, idx),
      pass: decoded.slice(idx + 1),
    };
  } catch {
    return null;
  }
}

function isAdmin(req) {
  // Option A: Bearer token
  const expectedToken = process.env.ADMIN_TOKEN;
  const gotToken = getBearerToken(req);
  if (expectedToken && gotToken && gotToken === expectedToken) return true;

  // Option B: Basic auth (recommended for dashboard)
  const expectedUser = process.env.DASHBOARD_USER;
  const expectedPass = process.env.DASHBOARD_PASS;
  if (!expectedUser || !expectedPass) return false;
  const creds = parseBasicAuth(req);
  if (!creds) return false;
  return creds.user === expectedUser && creds.pass === expectedPass;
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

export default async function handler(req, res) {
  try {
    // Always allow same-origin usage
    res.setHeader("Cache-Control", "no-store");

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

    if (req.method === "GET") {
      if (!isAdmin(req)) {
        return json(res, 401, { error: "unauthorized" });
      }

      await ensureSchema();
      const result = await sql`
        select id, created_at, name, email, message
        from contact_messages
        order by created_at desc
        limit 100;
      `;

      return json(res, 200, { ok: true, messages: result.rows || [] });
    }

    return json(res, 405, { error: "method_not_allowed" });
  } catch (err) {
    return json(res, 500, {
      error: "internal_error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
