'use strict';

const navbar = document.getElementById('navbar');
const hamburger = navbar.querySelector('.hamburger');
const navLinks = navbar.querySelector('.nav-links');
const allNavAnchors = navbar.querySelectorAll('.nav-links a[href^="#"]');

// ── Navbar scroll efekt ──
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
      ticking = false;
    });
    ticking = true;
  }
});

// ── Hamburger meni ──
hamburger.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('nav-open');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Zatvori meni klikom na link
allNavAnchors.forEach(a => {
  a.addEventListener('click', () => {
    navbar.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Zatvori meni klikom izvan njega
document.addEventListener('click', (e) => {
  if (navbar.classList.contains('nav-open') && !navbar.contains(e.target)) {
    navbar.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Back to top dugme ──
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    const start    = window.scrollY;
    const duration = 1500; // ms — povećaj za još sporiji povratak
    const t0       = performance.now();
    function step(now) {
      const p     = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4); // ease-out quart
      window.scrollTo(0, start * (1 - eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// ── Aktivni link na scroll ──
const sections = document.querySelectorAll('section[id]');

const highlightObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      allNavAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: `-${navbar.offsetHeight}px 0px -60% 0px`, threshold: 0 });

sections.forEach(s => highlightObserver.observe(s));

// ── Hero stat count-up ──
function countUp(el) {
  const target = +el.dataset.target;
  const suffix = el.dataset.suffix ?? '';
  const duration = 1750;
  const start = performance.now();
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
    el.textContent = Math.round(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
// Kreće 0.75s nakon učitavanja — nakon što heroIn animacija završi
setTimeout(() => {
  document.querySelectorAll('.stat-num[data-target]').forEach(countUp);
}, 750);
