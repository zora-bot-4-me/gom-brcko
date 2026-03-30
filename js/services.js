'use strict';

const ICONS = {
  cog: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
    <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-2l-.562 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.562 1.115 2.645L4 18l2 2 1.789-1.453 2.657 1.08L11 22h2l.562-2.401 2.707-1.113L18 20l2-2-1.483-1.735 1.113-2.707L22 13v-2l-2.378-.605Z"/>
  </svg>`,

  drill: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 12h12M9 8l4 4-4 4"/>
    <path d="M15 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>
    <path d="M19 10h2v4h-2"/>
    <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/>
  </svg>`,

  engine: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="7" width="20" height="10" rx="2"/>
    <path d="M6 7V5M10 7V5M14 7V5M18 7V5"/>
    <path d="M6 17v2M10 17v2M14 17v2M18 17v2"/>
    <path d="M2 12h2M20 12h2"/>
  </svg>`,

  gear: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
  </svg>`,

  wrench: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>
  </svg>`,

  shield: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>`
};

async function loadServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  try {
    const res = await fetch('data/services.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    data.services.forEach((svc, i) => {
      const card = document.createElement('article');
      card.className = 'service-card reveal';
      card.style.setProperty('--delay', `${i * 80}ms`);

      const features = svc.features
        .map(f => `<li>${f}</li>`)
        .join('');

      card.innerHTML = `
        <div class="svc-icon">${ICONS[svc.icon] || ICONS.cog}</div>
        <h3 class="svc-title">${svc.title}</h3>
        <p class="svc-desc">${svc.description}</p>
        <ul class="svc-features">${features}</ul>
      `;

      grid.appendChild(card);
    });

    // Pokreni animacije za novoubačene kartice
    if (window.__revealObserver) {
      grid.querySelectorAll('.reveal').forEach(el => window.__revealObserver.observe(el));
    }

  } catch (err) {
    console.error('Greška pri učitavanju usluga:', err);
    grid.innerHTML = '<p style="color:var(--color-text-muted)">Usluge trenutno nisu dostupne.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadServices);
