"use strict";

const body = document.body;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
body.classList.add("js-ready");

const loader = document.querySelector("#loader");
function hideLoader() {
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    window.setTimeout(() => loader.remove(), 400);
  }, reducedMotion ? 0 : 320);
}
hideLoader();

const themeToggle = document.querySelector("#theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
themeToggle.addEventListener("click", () => {
  const isLight = body.dataset.theme !== "light";
  body.dataset.theme = isLight ? "light" : "dark";
  themeColor.content = isLight ? "#f4f7fb" : "#080b10";
  themeToggle.setAttribute("aria-pressed", String(!isLight));
  themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
  themeToggle.innerHTML = `<i class="fa-regular ${isLight ? "fa-moon" : "fa-sun"}" aria-hidden="true"></i>`;
});

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#nav-menu");
const navLinks = [...document.querySelectorAll(".nav-link")];
function closeMenu() {
  menu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}
menuToggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});
navLinks.forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("click", (event) => {
  if (!menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});

const clock = document.querySelector("#digital-clock");
function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());
}
updateClock();
window.setInterval(updateClock, 1000);
document.querySelector("#year").textContent = new Date().getFullYear();

const roleTarget = document.querySelector("#typed-role");
const roles = ["IT STUDENT", "ASPIRING SOFTWARE DEVELOPER", "TECH ENTHUSIAST"];
if (reducedMotion) {
  roleTarget.textContent = roles[0];
} else {
  let roleIndex = 0;
  let characterIndex = 0;
  let deleting = false;
  function typeRole() {
    const role = roles[roleIndex];
    roleTarget.textContent = role.slice(0, characterIndex);
    if (!deleting && characterIndex < role.length) {
      characterIndex += 1;
      window.setTimeout(typeRole, 72);
      return;
    }
    if (!deleting) {
      deleting = true;
      window.setTimeout(typeRole, 1400);
      return;
    }
    if (characterIndex > 0) {
      characterIndex -= 1;
      window.setTimeout(typeRole, 34);
      return;
    }
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    window.setTimeout(typeRole, 260);
  }
  typeRole();
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
} else {
  document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
}

const progress = document.querySelector("#reading-progress");
let progressFrame = 0;
function updateProgress() {
  if (progressFrame) return;
  progressFrame = window.requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
    progressFrame = 0;
  });
}
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: "-34% 0px -58% 0px" });
  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));
}

function bindFilter(buttonSelector, itemSelector, dataKey, countSelector, label) {
  const buttons = [...document.querySelectorAll(buttonSelector)];
  const items = [...document.querySelectorAll(itemSelector)];
  const count = document.querySelector(countSelector);
  buttons.forEach((button) => button.addEventListener("click", () => {
    const filter = button.dataset[dataKey];
    let visibleCount = 0;
    buttons.forEach((candidate) => {
      const selected = candidate === button;
      candidate.classList.toggle("active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    });
    items.forEach((item) => {
      const visible = filter === "all" || item.dataset.category === filter || item.dataset.project === filter;
      item.classList.toggle("filtered-out", !visible);
      if (visible) visibleCount += 1;
    });
    count.textContent = `${visibleCount} ${label}${visibleCount === 1 ? "" : "S"}`;
  }));
}
bindFilter("[data-filter]", ".skill-card", "filter", "#skill-count", "SKILL");
bindFilter("[data-project-filter]", ".project-card", "projectFilter", "#project-count", "BUILD");

const detailModal = document.querySelector("#detail-modal");
const modalType = document.querySelector("#modal-type");
const modalTitle = document.querySelector("#modal-title");
const modalDescription = document.querySelector("#modal-description");
const modalImage = document.querySelector("#modal-image");
const modalTags = document.querySelector("#modal-tags");
function openModal({ type, title, description, image, imageAlt, imageFit, stack }) {
  modalType.textContent = type;
  modalTitle.textContent = title;
  modalDescription.textContent = description;
  if (image) {
    modalImage.src = image;
    modalImage.alt = imageAlt || `${title} preview`;
    modalImage.classList.toggle("certificate-preview", imageFit === "contain");
    modalImage.hidden = false;
  } else {
    modalImage.hidden = true;
    modalImage.removeAttribute("src");
    modalImage.alt = "";
    modalImage.classList.remove("certificate-preview");
  }
  modalTags.replaceChildren();
  stack.forEach((item) => {
    const tag = document.createElement("span");
    tag.textContent = item;
    modalTags.append(tag);
  });
  detailModal.showModal();
}

document.querySelectorAll(".detail-button").forEach((button) => {
  button.addEventListener("click", () => {
    const project = button.closest(".project-card").dataset;
    openModal({
      type: project.type,
      title: project.title,
      description: project.description,
      image: project.image,
      stack: project.stack.split(", ")
    });
  });
});
document.querySelectorAll(".record-card").forEach((button) => {
  button.addEventListener("click", () => {
    openModal({
      type: button.dataset.recordType,
      title: button.dataset.recordTitle,
      description: button.dataset.certificate,
      image: button.dataset.recordImage || "",
      imageAlt: button.dataset.recordImageAlt,
      imageFit: button.dataset.recordImageFit,
      stack: (button.dataset.recordStack || "EDITABLE RECORD").split(", ")
    });
  });
});
document.querySelector(".modal-close").addEventListener("click", () => detailModal.close());
detailModal.addEventListener("click", (event) => {
  if (event.target === detailModal) detailModal.close();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    if (detailModal.open) detailModal.close();
  }
});

let toastTimer;
const actionToast = document.querySelector("#action-toast");
function showToast(message) {
  actionToast.textContent = message;
  actionToast.classList.add("shown");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => actionToast.classList.remove("shown"), 3800);
}
document.querySelectorAll("[data-placeholder]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.getAttribute("href") !== "#") return;
    event.preventDefault();
    showToast(`${link.dataset.placeholder} URL not set. Add the real link in index.html.`);
  });
});

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const contactFields = [...contactForm.querySelectorAll("input, textarea")];
const recipient = "lanzjireh67@gmail.com";
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const invalidFields = contactFields.filter((field) => !field.checkValidity() || !field.value.trim());
  contactFields.forEach((field) => field.setAttribute("aria-invalid", String(invalidFields.includes(field))));
  if (invalidFields.length) {
    formStatus.textContent = "TRANSMISSION BLOCKED: Complete each field with a valid email address.";
    formStatus.className = "form-status error";
    invalidFields[0].focus();
    return;
  }
  if (recipient.endsWith("@example.com")) {
    formStatus.textContent = "EMAIL NOT CONFIGURED: Replace the example recipient in script.js before using the form.";
    formStatus.className = "form-status error";
    return;
  }
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(`[Portfolio] ${data.get("subject")}`);
  const message = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
  formStatus.textContent = "EMAIL READY: Your mail app will open. Review the message and send it there.";
  formStatus.className = "form-status success";
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${message}`;
});
contactFields.forEach((field) => field.addEventListener("input", () => {
  if (field.checkValidity() && field.value.trim()) field.setAttribute("aria-invalid", "false");
  formStatus.textContent = "";
  formStatus.className = "form-status";
}));

if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  body.classList.add("custom-cursor");
  const core = document.querySelector(".cursor-core");
  const halo = document.querySelector(".cursor-halo");
  let cursorFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener("mousemove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (cursorFrame) return;
    cursorFrame = window.requestAnimationFrame(() => {
      core.style.transform = `translate(${pointerX}px, ${pointerY}px)`;
      halo.style.transform = `translate(${pointerX - 13}px, ${pointerY - 13}px)`;
      cursorFrame = 0;
    });
  }, { passive: true });
  document.querySelectorAll("a, button, input, textarea").forEach((item) => {
    item.addEventListener("mouseenter", () => body.classList.add("cursor-active"));
    item.addEventListener("mouseleave", () => body.classList.remove("cursor-active"));
  });
}

if (!reducedMotion) {
  const canvas = document.querySelector("#particle-canvas");
  const context = canvas.getContext("2d");
  if (context) {
    let particles = [];
    function resizeCanvas() {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      particles = Array.from({ length: Math.min(30, Math.floor(window.innerWidth / 42)) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - .5) * .22,
        vy: (Math.random() - .5) * .22,
        radius: Math.random() * 1.2 + .3
      }));
    }
    function drawParticles() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
        if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
        context.fillStyle = "rgba(0, 210, 255, .46)";
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const next = particles[nextIndex];
          const distance = Math.hypot(particle.x - next.x, particle.y - next.y);
          if (distance > 110) continue;
          context.strokeStyle = `rgba(0, 163, 255, ${.1 * (1 - distance / 110)})`;
          context.lineWidth = .5;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      });
      window.requestAnimationFrame(drawParticles);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    drawParticles();
  }
}
