// Dashboard is protected by Basic Auth on the server.
// The browser will send Authorization automatically after login.

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setStatus(text) {
  const statusEl = document.getElementById("status");
  if (statusEl) statusEl.textContent = text || "";
}

async function fetchMessages() {
  const res = await fetch("/api/messages", {
    method: "GET",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Failed to load messages");
  }
  return Array.isArray(data?.messages) ? data.messages : [];
}

async function render() {
  const listEl = document.getElementById("messages");
  const emptyEl = document.getElementById("empty");

  if (!listEl) return;

  setStatus("Loading…");
  let messages = [];
  try {
    messages = await fetchMessages();
  } catch (err) {
    listEl.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "none";
    setStatus(err instanceof Error ? err.message : "Failed to load messages");
    return;
  }

  if (messages.length === 0) {
    listEl.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "block";
    setStatus("Loaded.");
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";

  setStatus(`Loaded ${messages.length} message(s).`);

  listEl.innerHTML = messages
    .map(
      (m) => `
        <div class="message-item">
          <div><strong>${escapeHtml(m.name || "-")}</strong> — ${escapeHtml(m.email || "-")}</div>
          <div>${escapeHtml(formatDate(m.created_at || m.createdAt || ""))}</div>
          <p>${escapeHtml(m.message || "")}</p>
        </div>
      `
    )
    .join("");
}

document.getElementById("refresh")?.addEventListener("click", () => {
  render();
});

render();
