//Getting dom elements
let mouseCursor = document.querySelector(".cursor-effect");
let ctaLinks = document.querySelectorAll(
  ".about-content a, .footer-links a, .more-about a"
);
let projectLinks = document.querySelectorAll(".project-box__link a ion-icon");

//  Mouse effect
if (mouseCursor) {
  window.addEventListener("mousemove", cursor);

  function cursor(e) {
    mouseCursor.style.top = e.pageY + "px";
    mouseCursor.style.left = e.pageX + "px";
  }

  ctaLinks.forEach((link) => {
    link.addEventListener("mouseover", () => {
      mouseCursor.classList.add("link-grow");
    });
    let trans = () => {
      mouseCursor.classList.remove("link-grow");
    });
  });

  projectLinks.forEach((link) => {

    // Contact form (Vercel serverless + DB)
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      const statusEl = document.getElementById("contact-status");

      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const message = String(formData.get("message") || "").trim();

        if (!name || !email || !message) {
          if (statusEl) statusEl.textContent = "Please fill out all fields.";
          return;
        }

        if (statusEl) statusEl.textContent = "Sending…";

        try {
          const res = await fetch("/api/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, message }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.error || "Failed to send message");
          }

          contactForm.reset();
          if (statusEl) statusEl.textContent = "Message sent. Thank you!";
        } catch (err) {
          if (statusEl) {
            statusEl.textContent =
              err instanceof Error ? err.message : "Failed to send message";
          }
        }
      });
    }
    if (this.checked) {
      trans();
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      trans();
      document.documentElement.setAttribute("data-theme", "dark");
    }
  });
}

let trans = () => {
  document.documentElement.classList.add("transition");
  window.setTimeout(() => {
    document.documentElement.classList.remove("transition");
  }, 1200);
};

// Contact form (static-friendly)
function getContactStorageKey() {
  return "portfolio_v2_contact_messages";
}

function readContactMessages() {
  try {
    const raw = localStorage.getItem(getContactStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeContactMessages(messages) {
  localStorage.setItem(getContactStorageKey(), JSON.stringify(messages));
}

function createMessageId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now()) + "_" + Math.random().toString(16).slice(2);
}

function buildMailtoUrl({ name, email, message }) {
  const to = "dzakydionh@gmail.com";
  const subject = `Portfolio message from ${name || "Visitor"}`;
  const body = [
    `Name: ${name || "-"}`,
    `Email: ${email || "-"}`,
    "",
    message || "",
  ].join("\n");

  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

const contactForm = document.getElementById("contact-form");
if (contactForm) {
  const statusEl = document.getElementById("contact-status");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      if (statusEl) statusEl.textContent = "Please fill out all fields.";
      return;
    }

    const entry = {
      id: createMessageId(),
      createdAt: new Date().toISOString(),
      name,
      email,
      message,
    };

    const existing = readContactMessages();
    existing.unshift(entry);
    writeContactMessages(existing);

    if (statusEl) {
      statusEl.textContent = "Saved. Opening your email app…";
    }

    // Open a prefilled email draft (works on static hosting)
    window.location.href = buildMailtoUrl({ name, email, message });

    contactForm.reset();
  });
}
