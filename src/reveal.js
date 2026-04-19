import { SELECTORS, UI } from './constants.js';

const handleRevealIntersect = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add(UI.visibleClass);
    }
  });
};

export const initRevealObserver = () => {
  const revealElements = document.querySelectorAll(SELECTORS.reveal);
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(handleRevealIntersect, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px',
  });

  revealElements.forEach((element) => observer.observe(element));
};
