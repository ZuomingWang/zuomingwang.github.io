(() => {
  const sections = Array.from(document.querySelectorAll("[data-scroll-section]"));
  const links = Array.from(document.querySelectorAll("[data-section-link]"));
  const navbar = document.getElementById("navbar");

  if (sections.length === 0 || links.length === 0) return;

  const sectionIds = new Set(sections.map((section) => section.id));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeSectionId = "";
  let animationFrame = null;

  const navbarHeight = () => (navbar ? navbar.getBoundingClientRect().height : 0);

  const setActiveSection = (sectionId) => {
    if (!sectionIds.has(sectionId) || sectionId === activeSectionId) return;

    activeSectionId = sectionId;

    document.querySelectorAll("[data-section-nav-item]").forEach((item) => {
      item.classList.toggle("active", item.dataset.sectionNavItem === sectionId);
    });

    links.forEach((link) => {
      const isCurrent = link.dataset.sectionLink === sectionId;
      const currentLabel = link.querySelector("[data-section-current-label]");

      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }

      if (currentLabel) currentLabel.textContent = isCurrent ? "(current)" : "";
    });
  };

  const updateActiveSection = () => {
    animationFrame = null;
    const marker = navbarHeight() + Math.min(window.innerHeight * 0.22, 160);
    let currentSection = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) currentSection = section;
    });

    const reachedPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (reachedPageEnd) currentSection = sections[sections.length - 1];

    setActiveSection(currentSection.id);
  };

  const scheduleActiveSectionUpdate = () => {
    if (animationFrame === null) animationFrame = window.requestAnimationFrame(updateActiveSection);
  };

  const closeMobileMenu = () => {
    const menu = document.getElementById("navbarNav");
    const toggle = document.querySelector(".navbar-toggler");
    if (menu?.classList.contains("show") && toggle) toggle.click();
  };

  const scrollToSection = (sectionId, smooth = true) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const top = section.getBoundingClientRect().top + window.scrollY - navbarHeight() - 12;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: smooth && !prefersReducedMotion.matches ? "smooth" : "auto",
    });
    setActiveSection(sectionId);
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const sectionId = link.dataset.sectionLink;
      if (!sectionIds.has(sectionId) || !link.getAttribute("href")?.startsWith("#")) return;

      event.preventDefault();
      closeMobileMenu();
      window.history.pushState(null, "", `#${sectionId}`);
      scrollToSection(sectionId);
    });
  });

  const observer = new IntersectionObserver(scheduleActiveSectionUpdate, {
    rootMargin: `-${navbarHeight()}px 0px -65% 0px`,
    threshold: [0, 0.01],
  });
  sections.forEach((section) => observer.observe(section));

  window.addEventListener("scroll", scheduleActiveSectionUpdate, { passive: true });
  window.addEventListener("resize", scheduleActiveSectionUpdate);
  window.addEventListener("popstate", () => {
    const sectionId = window.location.hash.slice(1);
    if (sectionIds.has(sectionId)) scrollToSection(sectionId, false);
  });

  const initialSectionId = window.location.hash.slice(1);
  if (sectionIds.has(initialSectionId)) {
    window.requestAnimationFrame(() => scrollToSection(initialSectionId, false));
  } else {
    updateActiveSection();
  }
})();
