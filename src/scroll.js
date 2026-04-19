import { SELECTORS, UI } from './constants.js';

let lastFlaredTitle = null;
let rafScrollId = null;

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
  if (!candidate || candidate === lastFlaredTitle || bestDistance >= maxDistance) {
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

const onScroll = (progressBar, backToTopButton) => {
  updateScrollProgress(progressBar);
  toggleBackToTop(backToTopButton);

  if (rafScrollId !== null) return;

  rafScrollId = window.requestAnimationFrame(() => {
    triggerClosestTitleFlare();
    rafScrollId = null;
  });
};

export const initScrollUI = () => {
  const progressBar = document.querySelector(SELECTORS.scrollProgress);
  const backToTopButton = document.querySelector(SELECTORS.backToTop);
  if (!progressBar || !backToTopButton) return;

  window.addEventListener('scroll', () => onScroll(progressBar, backToTopButton), {
    passive: true,
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  onScroll(progressBar, backToTopButton);
};
