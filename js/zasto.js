'use strict';

// SVG ikone po ID-u kartice
const ICONS = {
  iskustvo:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
  oprema:     '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>',
  povjerenje: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  rokovi:     '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
};

fetch('data/zasto.json')
  .then(r => r.json())
  .then(data => {
    const grid = document.getElementById('zasto-grid');
    if (!grid) return;
    if (data.label) document.getElementById('zasto-label').textContent = data.label;
    if (data.title) document.getElementById('zasto-title').textContent = data.title;
    data.cards.forEach((card, i) => {
      const delay = i * 80;
      const icon  = ICONS[card.id] || '';
      const div   = document.createElement('div');
      div.className = 'zasto-card reveal';
      if (delay) div.style.setProperty('--delay', delay + 'ms');
      div.innerHTML = `<div class="zasto-icon">${icon}</div><h3>${card.naslov}</h3><p>${card.opis}</p>`;
      grid.appendChild(div);
    });
  });
