const SELECTORS = {
  videoButton: '[data-video-src]',
};

let videoDialog;

const closeVideo = () => {
  if (!videoDialog) return;

  const iframe = videoDialog.querySelector('.video-lightbox__iframe');
  iframe.src = '';
  videoDialog.classList.remove('open');
  videoDialog.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

const openVideo = (button) => {
  if (!videoDialog) return;

  const iframe = videoDialog.querySelector('.video-lightbox__iframe');
  const title = button.dataset.videoTitle || 'Video';
  const src = button.dataset.videoSrc;

  if (!src) return;

  videoDialog.querySelector('.video-lightbox__title').textContent = title;
  iframe.src = src;
  iframe.title = title;
  videoDialog.classList.add('open');
  videoDialog.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const createVideoDialog = () => {
  const element = document.createElement('div');
  element.className = 'video-lightbox';
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-modal', 'true');
  element.setAttribute('aria-hidden', 'true');
  element.innerHTML = `
    <div class="video-lightbox__backdrop" data-video-close></div>
    <div class="video-lightbox__panel">
      <div class="video-lightbox__top">
        <div class="video-lightbox__title"></div>
        <button class="video-lightbox__close" type="button" data-video-close aria-label="Close video">×</button>
      </div>
      <div class="video-lightbox__stage">
        <iframe
          class="video-lightbox__iframe"
          src=""
          title=""
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  `;
  document.body.appendChild(element);
  return element;
};

export const initTalkVideos = () => {
  const videoButtons = document.querySelectorAll(SELECTORS.videoButton);
  if (!videoButtons.length) return;

  videoDialog = createVideoDialog();

  videoButtons.forEach((button) => {
    button.addEventListener('click', () => openVideo(button));
  });

  videoDialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-video-close]')) closeVideo();
  });

  document.addEventListener('keydown', (event) => {
    if (!videoDialog.classList.contains('open')) return;
    if (event.key === 'Escape') closeVideo();
  });
};
