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

const trackEvent = (eventName, params) => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
};

const initAnalyticsTracking = () => {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const text = link.textContent?.trim().replace(/\s+/g, ' ') || '';

    if (href.startsWith('mailto:')) {
      trackEvent('contact_click', {
        method: 'email',
        link_text: text || 'email',
        link_url: href,
      });
      return;
    }

    if (href.startsWith('#')) {
      if (href === '#contact' || href === '#exp') {
        trackEvent('navigation_click', {
          link_text: text || href,
          link_url: href,
        });
      }
      return;
    }

    if (!href.startsWith('http')) return;

    const url = new URL(href);
    const host = url.hostname.replace(/^www\./, '');
    const socialHosts = {
      'github.com': 'github',
      'linkedin.com': 'linkedin',
      'x.com': 'x',
      'dev.to': 'devto',
      'sergiosuarezgil.com': 'website',
    };

    const socialPlatform = socialHosts[host];

    if (socialPlatform) {
      trackEvent('social_click', {
        platform: socialPlatform,
        link_text: text || socialPlatform,
        link_url: href,
      });
      return;
    }

    trackEvent('outbound_click', {
      destination_host: host,
      link_text: text || host,
      link_url: href,
    });
  });
};

const init = () => {
  applyLanguage(getInitialLanguage());
  applyInitialTheme();
  applyCurrentYear();
  initAnalyticsTracking();
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
