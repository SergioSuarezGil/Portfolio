import { SELECTORS, UI, STORAGE_KEYS, THEME_MODE, URL_PARAMS } from './constants.js';
import { getStoredPreference, setStoredPreference } from './storage.js';

let themeMode = THEME_MODE.auto;

const getUrlThemeOverride = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const themeParam = (searchParams.get(URL_PARAMS.theme) || '').toLowerCase();

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
  return hostname === '127.0.0.1' || hostname === 'localhost';
};

const shouldForceSystemThemeSync = () =>
  isLocalPreviewHost() && getUrlThemeOverride() === null;

const getSystemTheme = () => {
  if (typeof window.matchMedia !== 'function') {
    return UI.darkTheme;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? UI.darkTheme : UI.lightTheme;
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

const updateThemeButtons = (icon, label) => {
  document.querySelectorAll(SELECTORS.themeButtons).forEach((button) => {
    button.innerHTML = `<span class="theme-icon" aria-hidden="true">${icon}</span><span class="theme-label">${label}</span>`;
  });
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);

  if (themeMode === THEME_MODE.auto) {
    updateThemeButtons('🌓', 'AUTO');
    return;
  }

  if (theme === UI.lightTheme) {
    updateThemeButtons('☀️', 'LIGHT');
    return;
  }

  updateThemeButtons('🌙', 'DARK');
};

export const applyInitialTheme = () => {
  const initial = getInitialThemeState();
  themeMode = initial.mode;
  applyTheme(initial.theme);
};

export const initThemeToggle = () => {
  const themeButtons = document.querySelectorAll(SELECTORS.themeButtons);
  if (!themeButtons.length) return;

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (shouldForceSystemThemeSync()) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === UI.lightTheme ? UI.darkTheme : UI.lightTheme;
        themeMode = THEME_MODE.manual;
        applyTheme(nextTheme);
        return;
      }

      const currentTheme = document.documentElement.getAttribute('data-theme');

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

export const initSystemThemeSync = () => {
  if (typeof window.matchMedia !== 'function') return;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

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

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(handleSystemThemeChange);
  }

  window.addEventListener('focus', syncOnWindowActivity);
  window.addEventListener('pageshow', syncOnWindowActivity);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    syncOnWindowActivity();
  });
};
