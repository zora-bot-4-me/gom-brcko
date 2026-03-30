'use strict';

// ── EmailJS konfiguracija ──
// Popuni ova 3 podatka nakon kreiranja EmailJS naloga na emailjs.com
const EMAILJS_PUBLIC_KEY  = 'TVOJ_PUBLIC_KEY';   // Account > API Keys
const EMAILJS_SERVICE_ID  = 'TVOJ_SERVICE_ID';   // Email Services > Service ID
const EMAILJS_TEMPLATE_ID = 'TVOJ_TEMPLATE_ID';  // Email Templates > Template ID

if (typeof emailjs === 'undefined') {
  console.warn('EmailJS nije učitan. Kontakt forma neće raditi.');
} else {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

const form       = document.getElementById('contact-form');
const submitBtn  = form?.querySelector('[type="submit"]');
const statusEl   = document.getElementById('form-status');

if (!form) {
  console.warn('contact.js: #contact-form nije pronađen');
}

function showStatus(type, message) {
  statusEl.textContent = message;
  statusEl.className   = 'form-status ' + type;
}

function hideStatus() {
  statusEl.className = 'form-status';
  statusEl.textContent = '';
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideStatus();

  const ime    = form.ime.value.trim();
  const email  = form.email.value.trim();
  const poruka = form.poruka.value.trim();

  // Validacija
  if (!ime || !email || !poruka) {
    showStatus('error', 'Molimo popunite sva polja.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showStatus('error', 'Unesite ispravnu email adresu.');
    return;
  }

  // Slanje
  submitBtn.disabled = true;
  submitBtn.textContent = 'Slanje...';

  const params = {
    from_name:  ime,
    from_email: email,
    message:    poruka,
    to_email:   'gom.brcko@gmail.com',
    reply_to:   email,
  };

  try {
    if (typeof emailjs === 'undefined') throw new Error('EmailJS nije dostupan');
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    showStatus('success', 'Poruka je uspješno poslata! Javit ćemo se uskoro.');
    form.reset();
  } catch (err) {
    console.error('EmailJS greška:', err);
    showStatus('error', 'Greška pri slanju. Pozovite nas direktno na broj telefona.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Pošaljite poruku';
  }
});
