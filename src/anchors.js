import { SELECTORS } from './constants.js';
import { closeMobileMenu } from './menu.js';

export const initSmoothAnchors = () => {
  const links = document.querySelectorAll(SELECTORS.anchorLinks);
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      closeMobileMenu();
    });
  });
};
