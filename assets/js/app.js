(() => {
  // Custom mouse cursor
  const mouseCursor = document.querySelector(".cursor-effect");
  if (mouseCursor) {
    window.addEventListener("mousemove", (e) => {
      mouseCursor.style.top = e.pageY + "px";
      mouseCursor.style.left = e.pageX + "px";
    });

    const hoverTargets = document.querySelectorAll(
      ".about-content a, .footer-links a, .more-about a, .project-box__link a"
    );

    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        mouseCursor.classList.add("link-grow");
      });
      el.addEventListener("mouseleave", () => {
        mouseCursor.classList.remove("link-grow");
      });
    });
  }

  // Theme toggle (only exists on the home page)
  const trans = () => {
    document.documentElement.classList.add("transition");
    window.setTimeout(() => {
      document.documentElement.classList.remove("transition");
    }, 1200);
  };

  const themeSwitch = document.getElementById("switch");
  if (themeSwitch) {
    themeSwitch.addEventListener("change", () => {
      trans();
      document.documentElement.setAttribute(
        "data-theme",
        themeSwitch.checked ? "light" : "dark"
      );
    });
  }

  // Intro animation + fadeOut() (home page only)
  const introEl = document.querySelector(".intro");
  const hasGsap = typeof window.gsap !== "undefined";

  if (introEl && hasGsap) {
    const tl = window.gsap.timeline({ defaults: { ease: "power2.out" } });

    // Bring in the intro text + button. The overlay remains until the user clicks EXPLORE.
    tl.to(".text", { y: "0%", duration: 1, stagger: 0.25 });
    tl.to(".intro-btn", { x: "75%", duration: 0.8 }, "-=0.6");
  }

  // Make sure the inline onclick="fadeOut()" works.
  window.fadeOut = () => {
    if (!introEl || !hasGsap) {
      if (introEl) introEl.style.display = "none";
      return;
    }

    const tl = window.gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(".intro", { y: "-100%", duration: 0.8 });
    tl.to(".slider", { y: "-100%", duration: 0.9 }, 0);
    tl.to(".slider-2", { y: "-100%", duration: 0.9 }, 0.05);
    tl.set(".intro", { display: "none" });
  };

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
          const msg =
            (data && typeof data === "object" && "message" in data && data.message) ||
            (data && typeof data === "object" && "error" in data && data.error) ||
            "Failed to send message";
          const hint =
            data && typeof data === "object" && "hint" in data ? String(data.hint || "") : "";
          throw new Error(hint ? `${msg} (${hint})` : String(msg));
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
})();
