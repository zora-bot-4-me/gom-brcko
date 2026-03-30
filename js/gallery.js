'use strict';

const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbClose   = lightbox.querySelector('.lb-close');
const lbPrev    = lightbox.querySelector('.lb-prev');
const lbNext    = lightbox.querySelector('.lb-next');

let figures = [];
let currentIndex = 0;

// ── Otvori lightbox ──
function openLightbox(index) {
  figures = Array.from(document.querySelectorAll('.gallery-item'));
  currentIndex = index;
  showImage(currentIndex);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

// ── Promijeni sliku ──
function showImage(index) {
  const fig = figures[index];
  lbImg.src = fig.dataset.full || fig.querySelector('img').src;
  lbImg.alt = fig.dataset.caption || '';
  lbCaption.textContent = fig.dataset.caption || '';

  lbPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
  lbNext.style.visibility = index === figures.length - 1 ? 'hidden' : 'visible';
}

// ── Zatvori lightbox ──
function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
  const origin = figures[currentIndex];
  if (origin) origin.querySelector('img').focus();
}

function prev() {
  if (currentIndex > 0) showImage(--currentIndex);
}

function next() {
  if (currentIndex < figures.length - 1) showImage(++currentIndex);
}

// ── Delegirani klik na galeriju ──
document.getElementById('gallery-grid')?.addEventListener('click', (e) => {
  const item = e.target.closest('.gallery-item');
  if (!item) return;
  figures = Array.from(document.querySelectorAll('.gallery-item'));
  openLightbox(figures.indexOf(item));
});

// Kontrole
lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', prev);
lbNext.addEventListener('click', next);

// Klik na pozadinu zatvara
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Tipkovnica
document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  prev();
  if (e.key === 'ArrowRight') next();
});

// Touch swipe
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 50) {
    delta < 0 ? next() : prev();
  }
}, { passive: true });

// Focus trap unutar lightboxa
lightbox.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const focusable = [lbClose, lbPrev, lbNext].filter(el => el.style.visibility !== 'hidden');
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
  }
});
