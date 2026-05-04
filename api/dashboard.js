function unauthorized(res) {
  res.setHeader("WWW-Authenticate", 'Basic realm="Dashboard"');
  return res.status(401).send("Authentication required.");
}

function parseBasicAuth(header) {
  if (!header || typeof header !== "string") return null;
  const [scheme, value] = header.split(" ");
  if (scheme !== "Basic" || !value) return null;
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx === -1) return null;
    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const expectedUser = process.env.DASHBOARD_USER || "";
  const expectedPass = process.env.DASHBOARD_PASS || "";

  if (!expectedPass) {
    return res
      .status(500)
      .send("Dashboard is not configured. Set DASHBOARD_PASS in Vercel env vars.");
  }

  const auth = parseBasicAuth(req.headers.authorization);
  if (!auth) return unauthorized(res);

  const userOk = expectedUser ? auth.user === expectedUser : true;
  const passOk = auth.pass === expectedPass;

  if (!userOk || !passOk) return unauthorized(res);

  // Minimal dashboard: messages are sent to email (no server storage).
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(`<!DOCTYPE html>
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
          <div class="sub">
            Messages are delivered to your email. This project does not store messages on a server.
          </div>
          <p><a href="/">Back to home</a></p>
          <p>
            Tip: check your inbox for new messages sent via the contact form.
          </p>
        </div>
      </section>
      <footer class="footer">
        <hr />
        <div class="footer-copy">&copy; Dzaky Dion Haidar 2026</div>
      </footer>
    </div>
  </body>
</html>`);
}
