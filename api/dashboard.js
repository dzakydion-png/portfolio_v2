function unauthorized(res) {
  res.statusCode = 401;
  res.setHeader("WWW-Authenticate", 'Basic realm="Admin Dashboard"');
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Unauthorized");
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

function isAllowed(req) {
  const expectedUser = process.env.DASHBOARD_USER;
  const expectedPass = process.env.DASHBOARD_PASS;
  if (!expectedUser || !expectedPass) return false;

  const creds = parseBasicAuth(req);
  if (!creds) return false;
  return creds.user === expectedUser && creds.pass === expectedPass;
}

function html(res, body) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

export default async function handler(req, res) {
  if (!isAllowed(req)) return unauthorized(res);

  // Served via rewrite at /dashboard, but backed by /api/dashboard.
  // Use absolute paths for assets.
  return html(
    res,
    `<!DOCTYPE html>
<html lang="id" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/assets/css/styles.min.css" />
    <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
    <title>Messages Dashboard</title>
  </head>

  <body class="body-wrap">
    <div class="content">
      <section class="contact">
        <div class="contact-title">
          <h5>— dashboard</h5>
          <h2>Messages</h2>
        </div>

        <div class="container">
          <div class="sub">Private dashboard (Basic Auth protected).</div>

          <button type="button" id="refresh">Refresh</button>
          <p id="status" aria-live="polite"></p>

          <p id="empty" style="display: none">No messages.</p>
          <div id="messages"></div>
        </div>
      </section>

      <footer class="footer">
        <hr />
        <div class="footer-copy">&copy; Dzaky Dion Haidar 2026</div>
      </footer>
    </div>

    <script src="/assets/js/dashboard.js?v=2"></script>
  </body>
</html>`
  );
}
