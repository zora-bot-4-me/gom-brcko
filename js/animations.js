'use strict';

// ── Scroll-reveal observer ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

// Eksportujemo observer da ga services.js može koristiti
window.__revealObserver = observer;

// Sve .reveal i .reveal-fade elemente koji su u DOM-u pri učitavanju
document.querySelectorAll('.reveal, .reveal-fade').forEach(el => observer.observe(el));
