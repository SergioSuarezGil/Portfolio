import './styles.scss';

import { initRevealObserver } from './src/reveal.js';
import { initSmoothAnchors } from './src/anchors.js';
import { initScrollUI } from './src/scroll.js';
import { initLanguageToggle, applyLanguage, getInitialLanguage } from './src/language.js';
import { applyInitialTheme, initThemeToggle, initSystemThemeSync } from './src/theme.js';
import { initMobileMenu } from './src/menu.js';
import { initContactForm } from './src/contact.js';

const applyCurrentYear = () => {
  const yearEl = document.querySelector('#current-year');
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
};

const init = () => {
  applyLanguage(getInitialLanguage());
  applyInitialTheme();
  applyCurrentYear();
  initRevealObserver();
  initSmoothAnchors();
  initScrollUI();
  initLanguageToggle();
  initThemeToggle();
  initSystemThemeSync();
  initMobileMenu();
  initContactForm();
};

document.addEventListener('DOMContentLoaded', init);
