document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("d-article d-contents nav");
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const sections = links
    .map((link) => {
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      const target = document.getElementById(id);
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (activeLink) => {
    links.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const getTop = (element) => element.getBoundingClientRect().top + window.scrollY;
  let ticking = false;

  const updateActiveLink = () => {
    const activationLine = window.scrollY + Math.min(window.innerHeight * 0.32, 220);
    let active = sections[0];

    sections.forEach((section) => {
      if (getTop(section.target) <= activationLine) {
        active = section;
      }
    });

    const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (nearBottom) {
      active = sections[sections.length - 1];
    }

    setActive(active.link);
    ticking = false;
  };

  const requestUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveLink);
      ticking = true;
    }
  };

  links.forEach((link) => {
    link.addEventListener("click", () => setActive(link));
  });

  updateActiveLink();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
});
