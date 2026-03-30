Websiteerstellung — GOM Brčko

## Tech Stack
- HTML5 (Single-Page, alle Sektionen in index.html)
- CSS3 (Custom Properties, kein Framework)
- Vanilla JavaScript (kein jQuery, kein Bundler)
- JSON für Servicedaten (data/services.json)
- EmailJS CDN für Kontaktformular (kein Server nötig)
- Google Fonts CDN: Oswald + Inter

## Hosting
FTP-Only Static Hosting — kein Node.js, kein PHP, kein Python

## Design
- Industriell / Technisch
- Dunkler Hintergrund: #111111
- Akzentfarbe: #f59e0b (Amber/Orange)
- Schriften: Oswald (Überschriften, uppercase), Inter (Fließtext)
- Responsive: Mobile-first, Breakpoints bei 480/768/1024px

## Design-Regeln
- Keine generischen AI-Aesthetics
- Bold, distinctive Design-Choices
- Performance-optimiert (Core Web Vitals)
- WebP für alle Bilder

## Projektstruktur
- css/ — 8 CSS-Dateien (variables, reset, base, layout, components, gallery, animations, responsive)
- js/ — 5 JS-Module (main, services, gallery, contact, animations)
- data/services.json — Servicedaten (nur diese Datei bearbeiten um Services zu ändern)
- images/ — hero-bg.jpg, logo.svg, gallery/thumb/, gallery/full/