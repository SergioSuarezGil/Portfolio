import { SELECTORS, STORAGE_KEYS, UI } from './constants.js';
import { getStoredPreference, setStoredPreference } from './storage.js';

const SUPPORTED_LANGUAGES = ['en', 'es'];

export const getSystemLanguage = () => {
  const primaryLanguage =
    (navigator.languages && navigator.languages[0]) || navigator.language || '';
  const normalizedLanguage = primaryLanguage.toLowerCase().replace('_', '-');

  return normalizedLanguage === 'es-es' || normalizedLanguage === 'es' ? 'es' : 'en';
};

export const getInitialLanguage = () => {
  const stored = getStoredPreference(STORAGE_KEYS.language);
  if (SUPPORTED_LANGUAGES.includes(stored)) return stored;
  return getSystemLanguage();
};

export const applyLanguage = (lang) => {
  document.documentElement.setAttribute('data-lang', lang);

  document
    .querySelectorAll(SELECTORS.languageButtons)
    .forEach((button) => button.classList.remove(UI.activeClass));
  document
    .querySelectorAll(`[data-l="${lang}"]`)
    .forEach((button) => button.classList.add(UI.activeClass));
};

export const initLanguageToggle = () => {
  const languageButtons = document.querySelectorAll(SELECTORS.languageButtons);
  if (!languageButtons.length) return;

  languageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const lang = button.dataset.l;
      if (!lang) return;
      applyLanguage(lang);
      setStoredPreference(STORAGE_KEYS.language, lang);
    });
  });
};
