import { SELECTORS, UI, WEB3FORMS } from './constants.js';

const WEB3FORMS_SCRIPT_SRC = 'https://web3forms.com/client/script.js';

const STATUS_CLASS = {
  idle: 'contact__status--idle',
  sending: 'contact__status--sending',
  success: 'contact__status--success',
  error: 'contact__status--error',
  captcha: 'contact__status--captcha',
};

const setStatus = (statusEl, state) => {
  if (!statusEl) return;
  Object.values(STATUS_CLASS).forEach((cls) => statusEl.classList.remove(cls));
  statusEl.classList.add(STATUS_CLASS[state]);
  statusEl.setAttribute('data-state', state);
};

const applyCaptchaTheme = (captchaEl) => {
  if (!captchaEl) return;
  const currentTheme =
    document.documentElement.getAttribute('data-theme') || UI.darkTheme;
  captchaEl.setAttribute('data-theme', currentTheme);
};

const loadWeb3FormsScript = () => {
  if (document.querySelector(`script[src="${WEB3FORMS_SCRIPT_SRC}"]`)) return;
  const script = document.createElement('script');
  script.src = WEB3FORMS_SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
};

export const initContactForm = () => {
  const form = document.querySelector(SELECTORS.contactForm);
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const statusEl = form.querySelector('.contact__status');
  const captchaEl = form.querySelector('.h-captcha');

  applyCaptchaTheme(captchaEl);
  loadWeb3FormsScript();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const captchaField = form.querySelector(
      'textarea[name="h-captcha-response"]',
    );
    if (!captchaField || !captchaField.value) {
      setStatus(statusEl, 'captcha');
      return;
    }

    const formData = new FormData(form);
    formData.append('access_key', WEB3FORMS.accessKey);
    formData.append('subject', WEB3FORMS.subject);
    formData.append('from_name', formData.get('name') || 'Portfolio contact');

    submitButton.disabled = true;
    setStatus(statusEl, 'sending');

    try {
      const response = await fetch(WEB3FORMS.endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      setStatus(statusEl, 'success');
      form.reset();
    } catch (error) {
      console.error('Web3Forms send failed', error);
      setStatus(statusEl, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
};
