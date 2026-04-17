"use strict";

/**
 * Portfolio UI controller
 * - Reveal animations on scroll
 * - Progress bar + back-to-top button
 * - Section title flare effect
 * - Language toggle
 * - Theme toggle
 * - Mobile menu interactions
 */

const SELECTORS = {
  reveal: ".reveal",
  sectionTitles: ".st2",
  anchorLinks: 'a[href^="#"]',
  languageButtons: "[data-l]",
  themeButtons: ".theme-btn",
  mobileMenu: "#mm",
  hamburger: "#hb",
  scrollProgress: "#sp",
  backToTop: "#btt",
};

const UI = {
  flareClass: "flare",
  visibleClass: "visible",
  openClass: "open",
  activeClass: "active",
  darkTheme: "dark",
  lightTheme: "light",
  flareDurationMs: 1500,
  backToTopThreshold: 400,
};

const STORAGE_KEYS = {
  theme: "portfolio-theme",
  themeMode: "portfolio-theme-mode",
};

const THEME_MODE = {
  auto: "auto",
  manual: "manual",
};

const URL_PARAMS = {
  theme: "theme",
};

let lastFlaredTitle = null;
let rafScrollId = null;
let themeMode = THEME_MODE.auto;

const init = () => {
  applyInitialPreferences();
  initRevealObserver();
  initSmoothAnchors();
  initScrollUI();
  initLanguageToggle();
  initThemeToggle();
  initSystemThemeSync();
  initMobileMenu();
};

const applyInitialPreferences = () => {
  const initialLanguage = getInitialLanguage();
  const initialTheme = getInitialThemeState();

  applyLanguage(initialLanguage);
  themeMode = initialTheme.mode;
  applyTheme(initialTheme.theme);
};

const getInitialThemeState = () => {
  const urlTheme = getUrlThemeOverride();
  if (urlTheme === UI.darkTheme || urlTheme === UI.lightTheme) {
    return { mode: THEME_MODE.manual, theme: urlTheme };
  }

  if (urlTheme === THEME_MODE.auto) {
    return { mode: THEME_MODE.auto, theme: getSystemTheme() };
  }

  if (isLocalPreviewHost()) {
    return { mode: THEME_MODE.auto, theme: getSystemTheme() };
  }

  const storedMode = getStoredPreference(STORAGE_KEYS.themeMode);
  const storedTheme = getStoredPreference(STORAGE_KEYS.theme);

  if (
    storedMode === THEME_MODE.manual &&
    (storedTheme === UI.darkTheme || storedTheme === UI.lightTheme)
  ) {
    return { mode: THEME_MODE.manual, theme: storedTheme };
  }

  return { mode: THEME_MODE.auto, theme: getSystemTheme() };
};

const shouldForceSystemThemeSync = () =>
  isLocalPreviewHost() && getUrlThemeOverride() === null;

const getUrlThemeOverride = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const themeParam = (searchParams.get(URL_PARAMS.theme) || "").toLowerCase();

  if (
    themeParam === UI.darkTheme ||
    themeParam === UI.lightTheme ||
    themeParam === THEME_MODE.auto
  ) {
    return themeParam;
  }

  return null;
};

const isLocalPreviewHost = () => {
  const hostname = window.location.hostname;
  return hostname === "127.0.0.1" || hostname === "localhost";
};

const getInitialLanguage = () => getSystemLanguage();

const getSystemTheme = () => {
  if (typeof window.matchMedia !== "function") {
    return UI.darkTheme;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? UI.darkTheme : UI.lightTheme;
};

const getSystemLanguage = () => {
  const primaryLanguage =
    (navigator.languages && navigator.languages[0]) || navigator.language || "";
  const normalizedLanguage = primaryLanguage.toLowerCase().replace("_", "-");

  return normalizedLanguage === "es-es" || normalizedLanguage === "es"
    ? "es"
    : "en";
};

const getStoredPreference = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
};

const setStoredPreference = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (_error) {
    // Ignore storage errors (private mode, blocked storage, etc.)
  }
};

const initRevealObserver = () => {
  const revealElements = document.querySelectorAll(SELECTORS.reveal);
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(handleRevealIntersect, {
    threshold: 0.08,
    rootMargin: "0px 0px -30px 0px",
  });

  revealElements.forEach((element) => observer.observe(element));
};

const handleRevealIntersect = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add(UI.visibleClass);
    }
  });
};

const initScrollUI = () => {
  const progressBar = document.querySelector(SELECTORS.scrollProgress);
  const backToTopButton = document.querySelector(SELECTORS.backToTop);

  if (!progressBar || !backToTopButton) return;

  window.addEventListener(
    "scroll",
    () => onScroll(progressBar, backToTopButton),
    {
      passive: true,
    },
  );

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  onScroll(progressBar, backToTopButton);
};

const onScroll = (progressBar, backToTopButton) => {
  updateScrollProgress(progressBar);
  toggleBackToTop(backToTopButton);

  if (rafScrollId !== null) return;

  rafScrollId = window.requestAnimationFrame(() => {
    triggerClosestTitleFlare();
    rafScrollId = null;
  });
};

const updateScrollProgress = (progressBar) => {
  const currentScroll = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = maxScroll > 0 ? (currentScroll / maxScroll) * 100 : 0;

  progressBar.style.width = `${percentage}%`;
};

const toggleBackToTop = (button) => {
  const isVisible = window.scrollY > UI.backToTopThreshold;
  button.classList.toggle(UI.visibleClass, isVisible);
};

const triggerClosestTitleFlare = () => {
  const titles = document.querySelectorAll(SELECTORS.sectionTitles);
  if (!titles.length) return;

  const viewportCenterY = window.innerHeight / 2;
  let candidate = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  titles.forEach((title) => {
    const rect = title.getBoundingClientRect();
    const isOutsideViewport = rect.bottom < 0 || rect.top > window.innerHeight;

    if (isOutsideViewport) return;

    const titleCenterY = rect.top + rect.height / 2;
    const distanceToCenter = Math.abs(titleCenterY - viewportCenterY);

    if (distanceToCenter < bestDistance) {
      bestDistance = distanceToCenter;
      candidate = title;
    }
  });

  const maxDistance = window.innerHeight * 0.45;
  if (
    !candidate ||
    candidate === lastFlaredTitle ||
    bestDistance >= maxDistance
  ) {
    return;
  }

  if (lastFlaredTitle) {
    lastFlaredTitle.classList.remove(UI.flareClass);
  }

  candidate.classList.remove(UI.flareClass);
  void candidate.offsetWidth;
  candidate.classList.add(UI.flareClass);

  window.setTimeout(() => {
    candidate.classList.remove(UI.flareClass);
  }, UI.flareDurationMs);

  lastFlaredTitle = candidate;
};

const initSmoothAnchors = () => {
  const links = document.querySelectorAll(SELECTORS.anchorLinks);
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      closeMobileMenu();
    });
  });
};

const initLanguageToggle = () => {
  const languageButtons = document.querySelectorAll(SELECTORS.languageButtons);
  if (!languageButtons.length) return;

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.dataset.l;
      if (!lang) return;

      applyLanguage(lang);
    });
  });
};

const applyLanguage = (lang) => {
  document.documentElement.setAttribute("data-lang", lang);

  document
    .querySelectorAll(SELECTORS.languageButtons)
    .forEach((button) => button.classList.remove(UI.activeClass));
  document
    .querySelectorAll(`[data-l="${lang}"]`)
    .forEach((button) => button.classList.add(UI.activeClass));
};

const initThemeToggle = () => {
  const themeButtons = document.querySelectorAll(SELECTORS.themeButtons);
  if (!themeButtons.length) return;

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (shouldForceSystemThemeSync()) {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme =
          currentTheme === UI.lightTheme ? UI.darkTheme : UI.lightTheme;
        themeMode = THEME_MODE.manual;
        applyTheme(nextTheme);
        return;
      }

      const currentTheme = document.documentElement.getAttribute("data-theme");

      if (themeMode === THEME_MODE.auto) {
        const nextTheme = UI.lightTheme;
        themeMode = THEME_MODE.manual;
        setStoredPreference(STORAGE_KEYS.themeMode, THEME_MODE.manual);
        setStoredPreference(STORAGE_KEYS.theme, nextTheme);
        applyTheme(nextTheme);
        return;
      }

      if (currentTheme === UI.lightTheme) {
        const nextTheme = UI.darkTheme;
        setStoredPreference(STORAGE_KEYS.theme, nextTheme);
        applyTheme(nextTheme);
        return;
      }

      themeMode = THEME_MODE.auto;
      setStoredPreference(STORAGE_KEYS.themeMode, THEME_MODE.auto);
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    });
  });
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);

  if (themeMode === THEME_MODE.auto) {
    updateThemeButtons("🌓", "AUTO");
    return;
  }

  if (theme === UI.lightTheme) {
    updateThemeButtons("☀️", "LIGHT");
    return;
  }

  updateThemeButtons("🌙", "DARK");
};

const updateThemeButtons = (icon, label) => {
  document.querySelectorAll(SELECTORS.themeButtons).forEach((button) => {
    button.innerHTML = `<span class="theme-icon" aria-hidden="true">${icon}</span><span class="theme-label">${label}</span>`;
  });
};

const initSystemThemeSync = () => {
  if (typeof window.matchMedia !== "function") return;

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = (event) => {
    if (themeMode !== THEME_MODE.auto && !shouldForceSystemThemeSync()) return;
    if (shouldForceSystemThemeSync()) {
      themeMode = THEME_MODE.auto;
    }
    applyTheme(event.matches ? UI.darkTheme : UI.lightTheme);
  };

  const syncOnWindowActivity = () => {
    if (themeMode !== THEME_MODE.auto && !shouldForceSystemThemeSync()) return;
    applyTheme(getSystemTheme());
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleSystemThemeChange);
  }

  window.addEventListener("focus", syncOnWindowActivity);
  window.addEventListener("pageshow", syncOnWindowActivity);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    syncOnWindowActivity();
  });
};

const initMobileMenu = () => {
  const hamburger = document.querySelector(SELECTORS.hamburger);
  const menu = document.querySelector(SELECTORS.mobileMenu);
  if (!hamburger || !menu) return;

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle(UI.openClass);
    menu.classList.toggle(UI.openClass, isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );
    hamburger.setAttribute(
      "title",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );
  });
};

const closeMobileMenu = () => {
  const hamburger = document.querySelector(SELECTORS.hamburger);
  const menu = document.querySelector(SELECTORS.mobileMenu);
  if (!hamburger || !menu) return;

  hamburger.classList.remove(UI.openClass);
  menu.classList.remove(UI.openClass);
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-label", "Open navigation menu");
  hamburger.setAttribute("title", "Open navigation menu");
};

document.addEventListener("DOMContentLoaded", init);
