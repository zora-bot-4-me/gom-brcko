'use strict';

(function () {
  const NS  = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('gears-svg');
  if (!svg) return;

  const COLOR = getComputedStyle(document.documentElement)
                  .getPropertyValue('--color-accent').trim() || '#2a8fd4';

  // ── Proper involute spur gear path ───────────────────────
  // N  = number of teeth
  // m  = module (tooth size)
  // pa = pressure angle in radians (typically 20° = π/9)
  function gearPath(N, m, pa) {
    const rp    = (N * m) / 2;             // pitch radius
    const rb    = rp * Math.cos(pa);       // base circle radius
    const ra    = rp + m;                  // addendum (tip) radius
    const rd    = rp - 1.25 * m;          // dedendum (root) radius
    const rootR = Math.max(rd, rb);        // drawing root radius

    const T        = (2 * Math.PI) / N;   // tooth pitch angle
    const half     = Math.PI / (2 * N);   // half tooth angle at pitch circle
    const tp       = Math.sqrt(Math.max(0, (rp / rb) ** 2 - 1));
    const invAlpha = tp - Math.atan(tp);  // involute of pressure angle
    const ta       = Math.sqrt((ra / rb) ** 2 - 1); // inv param at addendum
    const t0       = rootR > rb
                     ? Math.sqrt((rootR / rb) ** 2 - 1)
                     : 0;                 // inv param at root

    const STEPS = 12;

    // Right flank involute point at parameter t, tooth centre at tc
    function R(tc, t) {
      const angle = (tc - half - invAlpha) + (t - Math.atan(t));
      const r     = rb * Math.sqrt(1 + t * t);
      return [r * Math.cos(angle), r * Math.sin(angle)];
    }

    // Left flank involute point (mirror of right flank)
    function L(tc, t) {
      const angle = (tc + half + invAlpha) - (t - Math.atan(t));
      const r     = rb * Math.sqrt(1 + t * t);
      return [r * Math.cos(angle), r * Math.sin(angle)];
    }

    let d = '';

    for (let i = 0; i < N; i++) {
      const tc = i * T;

      // ① Root arc to right flank bottom (sweep CW on screen → flag=1)
      const [rx0, ry0] = R(tc, t0);
      if (i === 0) {
        d += `M ${rx0.toFixed(3)} ${ry0.toFixed(3)} `;
      } else {
        d += `A ${rootR.toFixed(3)} ${rootR.toFixed(3)} 0 0 1 ${rx0.toFixed(3)} ${ry0.toFixed(3)} `;
      }

      // ② Right flank involute from root to tip
      for (let s = 1; s <= STEPS; s++) {
        const t = t0 + (ta - t0) * s / STEPS;
        const [x, y] = R(tc, t);
        d += `L ${x.toFixed(3)} ${y.toFixed(3)} `;
      }

      // ③ Tip arc (short arc, CW on screen → sweep=1)
      const [lax, lay] = L(tc, ta);
      d += `A ${ra.toFixed(3)} ${ra.toFixed(3)} 0 0 1 ${lax.toFixed(3)} ${lay.toFixed(3)} `;

      // ④ Left flank involute from tip back to root
      for (let s = STEPS - 1; s >= 0; s--) {
        const t = t0 + (ta - t0) * s / STEPS;
        const [x, y] = L(tc, t);
        d += `L ${x.toFixed(3)} ${y.toFixed(3)} `;
      }
    }

    // Close path: root arc back to tooth-0 right flank bottom
    const [rx0_0, ry0_0] = R(0, t0);
    d += `A ${rootR.toFixed(3)} ${rootR.toFixed(3)} 0 0 1 ${rx0_0.toFixed(3)} ${ry0_0.toFixed(3)} Z`;

    return d;
  }

  // ── Spoke path (radiating from hub to inner rim) ──────────
  function addGear(cx, cy, N_teeth, m, durSec, cw, nSpokes) {
    const rp   = (N_teeth * m) / 2;
    const hubR = Math.max(rp * 0.19, 5);
    const rimR = rp * 0.68;

    // Outer wrapper — translation only (animateTransform on inner group)
    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('transform', `translate(${cx},${cy})`);

    // Inner group — carries rotation animation
    const g = document.createElementNS(NS, 'g');

    // Gear body (fill + stroke)
    const body = document.createElementNS(NS, 'path');
    body.setAttribute('d', gearPath(N_teeth, m, Math.PI / 9)); // 20° PA
    body.setAttribute('fill', COLOR);
    body.setAttribute('fill-opacity', '0.12');
    body.setAttribute('stroke', COLOR);
    body.setAttribute('stroke-width', '1.4');
    body.setAttribute('stroke-opacity', '0.8');
    body.setAttribute('stroke-linejoin', 'round');
    g.appendChild(body);

    // Inner rim ring
    const rim = document.createElementNS(NS, 'circle');
    rim.setAttribute('cx', '0'); rim.setAttribute('cy', '0');
    rim.setAttribute('r', rimR.toFixed(2));
    rim.setAttribute('fill', 'none');
    rim.setAttribute('stroke', COLOR);
    rim.setAttribute('stroke-width', '1.2');
    rim.setAttribute('stroke-opacity', '0.45');
    g.appendChild(rim);

    // Spokes
    for (let i = 0; i < nSpokes; i++) {
      const a = (i / nSpokes) * 2 * Math.PI;
      const spoke = document.createElementNS(NS, 'line');
      spoke.setAttribute('x1', (hubR * Math.cos(a)).toFixed(2));
      spoke.setAttribute('y1', (hubR * Math.sin(a)).toFixed(2));
      spoke.setAttribute('x2', (rimR * Math.cos(a)).toFixed(2));
      spoke.setAttribute('y2', (rimR * Math.sin(a)).toFixed(2));
      spoke.setAttribute('stroke', COLOR);
      spoke.setAttribute('stroke-width', '2.8');
      spoke.setAttribute('stroke-opacity', '0.55');
      spoke.setAttribute('stroke-linecap', 'round');
      g.appendChild(spoke);
    }

    // Hub disc
    const hub = document.createElementNS(NS, 'circle');
    hub.setAttribute('cx', '0'); hub.setAttribute('cy', '0');
    hub.setAttribute('r', hubR.toFixed(2));
    hub.setAttribute('fill', COLOR);
    hub.setAttribute('fill-opacity', '0.55');
    hub.setAttribute('stroke', COLOR);
    hub.setAttribute('stroke-width', '1.2');
    hub.setAttribute('stroke-opacity', '0.9');
    g.appendChild(hub);

    // Shaft hole
    const hole = document.createElementNS(NS, 'circle');
    hole.setAttribute('cx', '0'); hole.setAttribute('cy', '0');
    hole.setAttribute('r', (hubR * 0.42).toFixed(2));
    hole.setAttribute('fill', 'none');
    hole.setAttribute('stroke', COLOR);
    hole.setAttribute('stroke-width', '1');
    hole.setAttribute('stroke-opacity', '0.7');
    g.appendChild(hole);

    // Rotation animation
    const anim = document.createElementNS(NS, 'animateTransform');
    anim.setAttribute('attributeName', 'transform');
    anim.setAttribute('type', 'rotate');
    anim.setAttribute('from', '0 0 0');
    anim.setAttribute('to', `${cw ? 360 : -360} 0 0`);
    anim.setAttribute('dur', `${durSec}s`);
    anim.setAttribute('repeatCount', 'indefinite');
    g.appendChild(anim);

    wrap.appendChild(g);
    svg.appendChild(wrap);
  }

  // ── Three meshing gears ───────────────────────────────────
  // Module 7.5, pressure angle 20°
  const M = 7.5;

  // Large gear: N=22  →  rp=82.5, ra=90
  // Medium gear: N=14  →  rp=52.5, ra=60
  // Small gear:  N=9   →  rp=33.75, ra=41.25
  //
  // Centre-to-centre distances:
  //   Large ↔ Medium: 82.5+52.5 = 135
  //   Medium ↔ Small: 52.5+33.75 = 86.25
  //
  // Rotation speeds (ω ratio = N_driver / N_driven):
  const durL = 18;                       // large: 18 s/rev (slowest)
  const durM = durL * (14 / 22);        // medium: ≈ 11.45 s/rev
  const durS = durM * (9  / 14);        // small:  ≈ 7.35 s/rev

  // Centre positions (viewBox 0 0 400 400)
  const Lx = 160, Ly = 258;             // large gear centre

  const meshAngle1 = -Math.PI / 4;      // 45° upper-right from large
  const Mx = Lx + 135 * Math.cos(meshAngle1);  // ≈ 255.5
  const My = Ly + 135 * Math.sin(meshAngle1);  // ≈ 162.5

  const meshAngle2 = -Math.PI / 6;      // 30° upper-right from medium
  const Sx = Mx + 86.25 * Math.cos(meshAngle2); // ≈ 330
  const Sy = My + 86.25 * Math.sin(meshAngle2); // ≈ 119.4

  addGear(Lx, Ly, 22, M, durL,  true,  6);  // large — clockwise
  addGear(Mx, My, 14, M, durM, false,  5);  // medium — counter-clockwise
  addGear(Sx, Sy,  9, M, durS,  true,  4);  // small  — clockwise
})();
