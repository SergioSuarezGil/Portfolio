import { SELECTORS, UI } from './constants.js';

export const closeMobileMenu = () => {
  const hamburger = document.querySelector(SELECTORS.hamburger);
  const menu = document.querySelector(SELECTORS.mobileMenu);
  if (!hamburger || !menu) return;

  hamburger.classList.remove(UI.openClass);
  menu.classList.remove(UI.openClass);
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation menu');
  hamburger.setAttribute('title', 'Open navigation menu');
};

export const initMobileMenu = () => {
  const hamburger = document.querySelector(SELECTORS.hamburger);
  const menu = document.querySelector(SELECTORS.mobileMenu);
  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle(UI.openClass);
    menu.classList.toggle(UI.openClass, isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    hamburger.setAttribute('title', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });
};
