//Getting dom elements
let mouseCursor = document.querySelector(".cursor-effect");
let ctaLinks = document.querySelectorAll(
  ".about-content a, .footer-links a, .more-about a"
);
let projectLinks = document.querySelectorAll(".project-box__link a ion-icon");
let contactForm = document.querySelector(".contact-form");

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

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.querySelector("#name")?.value.trim() || "";
    const email = document.querySelector("#email")?.value.trim() || "";
    const message = document.querySelector("#message")?.value.trim() || "";

    const subject = encodeURIComponent(`Portfolio contact from ${name || "Visitor"}`);
    const body = encodeURIComponent(
      `Name: ${name || "-"}\nEmail: ${email || "-"}\n\nMessage:\n${message || "-"}`
    );

    window.location.href = `mailto:dzakydionh@gmail.com?subject=${subject}&body=${body}`;
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
