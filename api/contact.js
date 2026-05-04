export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !toEmail) {
    return res.status(500).json({
      ok: false,
      error:
        "Server is not configured. Set RESEND_API_KEY and CONTACT_TO_EMAIL in Vercel env vars.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  const subject = `Portfolio message from ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Use Resend's recommended default sender for quick start.
      from: "Portfolio <onboarding@resend.dev>",
      to: [toEmail],
      reply_to: email,
      subject,
      text,
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    return res.status(502).json({
      ok: false,
      error: "Email provider error",
      detail: detail?.slice(0, 500) || undefined,
    });
  }

  return res.status(200).json({ ok: true });
}
