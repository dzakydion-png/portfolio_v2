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
    link.addEventListener("mouseleave", () => {
      mouseCursor.classList.remove("link-grow");
    });
  });

  projectLinks.forEach((link) => {
    link.addEventListener("mouseover", () => {
      mouseCursor.classList.add("link-grow");
    });
    link.addEventListener("mouseleave", () => {
      mouseCursor.classList.remove("link-grow");
    });
  });
}

//GSAP animations
function fadeOut() {
  TweenMax.to(".intro-btn", 1, {
    opacity: 0,
    y: -100,
  });
  TweenMax.to(".text", 1, {
    y: "-100%",
  });
  TweenMax.to(".slider", 2, {
    y: "-100%",
    delay: 1,
    ease: Expo.easeInOut,
  });
  TweenMax.to(".slider-2", 2, {
    y: "-100%",
    delay: 1.4,
    ease: Power2.easeInOut,
  });
  TweenMax.to(
    ".intro",
    2,
    {
      y: "-100%",
      delay: 2,
      ease: Power2.easeInOut,
    },
    "-=.5"
  );
  TweenMax.to(".content", 2, {
    y: 0,
    ease: Power2.easeInOut,
  });
}
///Timeline (home page only)
if (typeof window.gsap !== "undefined" && document.querySelector(".intro")) {
  const tl = gsap.timeline({
    defaults: { ease: "power1.out" },
  });

  tl.to(".text", {
    y: "0%",
    duration: 1,
    stagger: 0.4,
  });
  tl.from(
    ".services-heading h2",
    {
      y: 300,
      opacity: 0,
      duration: 1,
    },
    "-=1"
  );

  tl.fromTo(
    ".landing-text h1",
    { opacity: 0 },
    { opacity: 1, duration: 0.5, stagger: 0.5 }
  );
  tl.fromTo(".landing-text p", { opacity: 0 }, { opacity: 1, duration: 1 });
  tl.fromTo(".effect-1", { opacity: 0 }, { opacity: 1, duration: 1 });
  tl.fromTo(".effect-2", { opacity: 0 }, { opacity: 1, duration: 1 });
  tl.fromTo(".effect-3", { opacity: 0 }, { opacity: 1, duration: 1 });
  tl.fromTo(".effect-4", { opacity: 0 }, { opacity: 1, duration: 1 });
  tl.fromTo(".inner", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "-=1");
}

/////Dark theme toggle
var checkbox = document.querySelector("input[name=theme]");

if (checkbox) {
  checkbox.addEventListener("change", function () {
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
  const submitBtn = contactForm.querySelector('button[type="submit"]');

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

    const entry = {
      id: createMessageId(),
      createdAt: new Date().toISOString(),
      name,
      email,
      message,
    };

    if (statusEl) statusEl.textContent = "Sending…";
    if (submitBtn) submitBtn.disabled = true;

    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!resp.ok) {
        throw new Error("Send failed");
      }

      // Save locally for your own reference (same browser only)
      const existing = readContactMessages();
      existing.unshift(entry);
      writeContactMessages(existing);

      if (statusEl) statusEl.textContent = "Sent successfully. Thank you!";
      contactForm.reset();
      return;
    } catch {
      const mailto = buildMailtoUrl({ name, email, message });
      if (statusEl) {
        statusEl.textContent = "Could not send automatically. Please email me instead.";
        const link = document.createElement("a");
        link.href = mailto;
        link.textContent = "Open email draft";
        link.style.display = "inline-block";
        link.style.marginLeft = "0.5rem";
        statusEl.appendChild(link);
      }
      return;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
