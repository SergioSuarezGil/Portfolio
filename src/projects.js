const SELECTORS = {
  galleryButton: '[data-gallery-src]',
  card: '.project-card',
};

let lightbox;
let images = [];
let currentIndex = 0;

const getProjectImages = (button) => {
  const card = button.closest(SELECTORS.card);
  if (!card) return [];

  return [...card.querySelectorAll(SELECTORS.galleryButton)].map((item) => ({
    src: item.dataset.gallerySrc,
    alt: item.dataset.galleryAlt || '',
    title: item.dataset.galleryTitle || '',
  }));
};

const setImage = (index) => {
  if (!lightbox || !images.length) return;

  currentIndex = (index + images.length) % images.length;
  const currentImage = images[currentIndex];
  const imageEl = lightbox.querySelector('.project-lightbox__image');
  const titleEl = lightbox.querySelector('.project-lightbox__title');
  const counterEl = lightbox.querySelector('.project-lightbox__counter');

  imageEl.src = currentImage.src;
  imageEl.alt = currentImage.alt;
  titleEl.textContent = currentImage.title;
  counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

const openLightbox = (button) => {
  images = getProjectImages(button);
  if (!images.length) return;

  const selectedIndex = images.findIndex((image) => image.src === button.dataset.gallerySrc);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setImage(selectedIndex >= 0 ? selectedIndex : 0);
};

const createLightbox = () => {
  const element = document.createElement('div');
  element.className = 'project-lightbox';
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-modal', 'true');
  element.setAttribute('aria-hidden', 'true');
  element.innerHTML = `
    <div class="project-lightbox__backdrop" data-lightbox-close></div>
    <div class="project-lightbox__panel">
      <div class="project-lightbox__top">
        <div class="project-lightbox__title"></div>
        <button class="project-lightbox__close" type="button" data-lightbox-close aria-label="Close project gallery">×</button>
      </div>
      <div class="project-lightbox__stage">
        <img class="project-lightbox__image" src="" alt="" />
      </div>
      <div class="project-lightbox__footer">
        <button class="project-lightbox__nav" type="button" data-lightbox-prev aria-label="Previous image">‹</button>
        <div class="project-lightbox__counter"></div>
        <button class="project-lightbox__nav" type="button" data-lightbox-next aria-label="Next image">›</button>
      </div>
    </div>
  `;
  document.body.appendChild(element);
  return element;
};

export const initProjectGallery = () => {
  const galleryButtons = document.querySelectorAll(SELECTORS.galleryButton);
  if (!galleryButtons.length) return;

  lightbox = createLightbox();

  galleryButtons.forEach((button) => {
    button.addEventListener('click', () => openLightbox(button));
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target.closest('[data-lightbox-close]')) closeLightbox();
    if (event.target.closest('[data-lightbox-prev]')) setImage(currentIndex - 1);
    if (event.target.closest('[data-lightbox-next]')) setImage(currentIndex + 1);
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') setImage(currentIndex - 1);
    if (event.key === 'ArrowRight') setImage(currentIndex + 1);
  });
};
