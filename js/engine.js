'use strict';

(function () {
  const NS  = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('engine-svg');
  if (!svg) return;

  // ── Konfiguracija ────────────────────────────────────────
  const N        = 4;
  const CYL_X    = [42, 112, 182, 252];   // x centar svakog cilindra
  const CYL_W    = 52;                     // unutrašnja širina cilindra
  const WALL_W   = 8;                      // debljina zida cilindra
  const CYL_TOP  = 5;                      // vrh glave motora (y)
  const HEAD_H   = 14;                     // visina glave motora
  const CRANK_Y  = 242;                    // y centar koljenastog vratila
  const CRANK_R  = 28;                     // polumjer koljenastog
  const ROD_L    = 65;                     // dužina klipnjače
  const PISTON_H = 26;                     // visina klipa
  const PHASES   = [0, Math.PI, Math.PI, 0]; // faze inline-4 motora
  const COLOR    = getComputedStyle(document.documentElement)
                     .getPropertyValue('--color-accent').trim() || '#2a8fd4';

  // ── Pomoćna: kreira SVG element ──────────────────────────
  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }

  // ── Izračun y-pozicije klipnog zatika ────────────────────
  // (tačna kinematika klip-klipnjača-koljenasto vratilo)
  function pinY(theta, phase) {
    const a   = theta + phase;
    const cpY = CRANK_Y - CRANK_R * Math.cos(a);
    const cpX = CRANK_R * Math.sin(a);
    return cpY - Math.sqrt(ROD_L * ROD_L - cpX * cpX);
  }

  // ── Statički dijelovi (crtaju se jednom) ─────────────────
  function drawStatics() {
    const WALL_H = CRANK_Y - CYL_TOP - HEAD_H - CRANK_R + 8;

    // Osnova bloka motora (dno)
    svg.appendChild(el('rect', {
      x: 5, y: 282, width: 310, height: 14, rx: 4,
      fill: COLOR, opacity: 0.18
    }));

    // Osovina koljenastog
    svg.appendChild(el('line', {
      x1: CYL_X[0], y1: CRANK_Y, x2: CYL_X[N - 1], y2: CRANK_Y,
      stroke: COLOR, 'stroke-width': 5, opacity: 0.2, 'stroke-linecap': 'round'
    }));

    for (let i = 0; i < N; i++) {
      const lx = CYL_X[i] - CYL_W / 2 - WALL_W;
      const rx = CYL_X[i] + CYL_W / 2;

      // Glava motora
      svg.appendChild(el('rect', {
        x: lx, y: CYL_TOP,
        width: CYL_W + WALL_W * 2, height: HEAD_H, rx: 3,
        fill: COLOR, opacity: 0.38
      }));

      // Ventili (dva kruga na glavi)
      svg.appendChild(el('circle', {
        cx: CYL_X[i] - 9, cy: CYL_TOP + 7, r: 4,
        fill: COLOR, opacity: 0.6
      }));
      svg.appendChild(el('circle', {
        cx: CYL_X[i] + 9, cy: CYL_TOP + 7, r: 4,
        fill: COLOR, opacity: 0.6
      }));

      // Lijevi zid cilindra
      svg.appendChild(el('rect', {
        x: lx, y: CYL_TOP + HEAD_H, width: WALL_W, height: WALL_H, rx: 2,
        fill: COLOR, opacity: 0.22
      }));
      // Desni zid cilindra
      svg.appendChild(el('rect', {
        x: rx, y: CYL_TOP + HEAD_H, width: WALL_W, height: WALL_H, rx: 2,
        fill: COLOR, opacity: 0.22
      }));

      // Glavni ležaj koljenastog (vanjski prsten)
      svg.appendChild(el('circle', {
        cx: CYL_X[i], cy: CRANK_Y, r: 9,
        fill: 'none', stroke: COLOR, 'stroke-width': 3, opacity: 0.3
      }));
      // Unutrašnji ležaj
      svg.appendChild(el('circle', {
        cx: CYL_X[i], cy: CRANK_Y, r: 4,
        fill: COLOR, opacity: 0.5
      }));
    }
  }

  // ── Animirani elementi (kreira se jednom, mijenja u tick) ─
  const pistons = [];
  const rods    = [];
  const webs    = [];
  const pins    = [];

  function createAnimated() {
    for (let i = 0; i < N; i++) {
      // ── Klip ───────────────────────────────────────────
      const g = el('g', {});

      // Tijelo klipa
      g.appendChild(el('rect', {
        x: 0, y: 0, width: CYL_W, height: PISTON_H, rx: 4,
        fill: COLOR, opacity: 0.58
      }));
      // Prsten 1
      g.appendChild(el('rect', {
        x: 0, y: 5, width: CYL_W, height: 4, rx: 1,
        fill: COLOR, opacity: 0.9
      }));
      // Prsten 2
      g.appendChild(el('rect', {
        x: 0, y: 13, width: CYL_W, height: 4, rx: 1,
        fill: COLOR, opacity: 0.9
      }));
      // Klipni zatik (pin hole)
      g.appendChild(el('circle', {
        cx: CYL_W / 2, cy: PISTON_H - 1, r: 5,
        fill: 'none', stroke: COLOR, 'stroke-width': 2, opacity: 0.8
      }));

      svg.appendChild(g);
      pistons.push({ g, baseX: CYL_X[i] - CYL_W / 2 });

      // ── Klipnjača ──────────────────────────────────────
      const rod = el('line', {
        stroke: COLOR, 'stroke-width': 5,
        'stroke-linecap': 'round', opacity: 0.38
      });
      svg.appendChild(rod);
      rods.push(rod);

      // ── Rame koljenastog (web) ─────────────────────────
      const web = el('rect', {
        width: 8, height: CRANK_R + 4, rx: 3,
        fill: COLOR, opacity: 0.45
      });
      svg.appendChild(web);
      webs.push(web);

      // ── Klipni rukavac (crank pin) ─────────────────────
      const pin = el('circle', {
        r: 7, fill: COLOR, opacity: 0.72
      });
      svg.appendChild(pin);
      pins.push(pin);
    }
  }

  // ── Animacijska petlja ───────────────────────────────────
  function tick(ts) {
    const theta = (ts / 950) % (2 * Math.PI);   // brzina rotacije

    for (let i = 0; i < N; i++) {
      const angle = theta + PHASES[i];

      // Pozicija klipnog rukavca na koljenastom
      const cpX = CYL_X[i] + CRANK_R * Math.sin(angle);
      const cpY = CRANK_Y - CRANK_R * Math.cos(angle);

      // y pozicija klipnog zatika (kinematika)
      const py = pinY(theta, PHASES[i]);

      // Pomijeri klip
      pistons[i].g.setAttribute('transform',
        `translate(${pistons[i].baseX}, ${py - PISTON_H})`
      );

      // Klipnjača: od zatika klipa do klipnog rukavca
      rods[i].setAttribute('x1', CYL_X[i]);
      rods[i].setAttribute('y1', py);
      rods[i].setAttribute('x2', cpX);
      rods[i].setAttribute('y2', cpY);

      // Rame koljenastog (rotira oko glavnog ležaja)
      const deg = angle * 180 / Math.PI;
      webs[i].setAttribute('transform',
        `translate(${CYL_X[i]},${CRANK_Y}) rotate(${deg}) translate(-4,${-CRANK_R - 2})`
      );

      // Klipni rukavac
      pins[i].setAttribute('cx', cpX);
      pins[i].setAttribute('cy', cpY);
    }

    requestAnimationFrame(tick);
  }

  // ── Start ────────────────────────────────────────────────
  drawStatics();
  createAnimated();
  requestAnimationFrame(tick);
})();
