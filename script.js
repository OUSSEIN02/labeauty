(() => {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = [...document.querySelectorAll('.nav__link')];

  // Ombre du header au défilement
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 960) setMenu(false); });

  // Lien actif selon la section visible
  const sections = links
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  // Apparition progressive des cartes
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = [...revealItems].indexOf(entry.target);
          entry.target.style.transitionDelay = `${(i % 3) * 120}ms`;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Galerie : lightbox ----------
  const lightbox = document.getElementById('lightbox');
  const shots = [...document.querySelectorAll('.g-btn')];
  if (lightbox && shots.length) {
    const lbImg = lightbox.querySelector('img');
    const lbCap = lightbox.querySelector('figcaption');
    let current = 0;
    let lastFocus = null;

    const show = (i) => {
      current = (i + shots.length) % shots.length;
      const b = shots[current];
      lbImg.src = b.dataset.full;
      lbImg.alt = b.querySelector('img').alt;
      lbCap.textContent = b.dataset.caption || '';
    };
    const open = (i) => {
      lastFocus = document.activeElement;
      show(i);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox__close').focus();
    };
    const close = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    shots.forEach((b, i) => b.addEventListener('click', () => open(i)));
    lightbox.querySelector('.lightbox__close').addEventListener('click', close);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
    lightbox.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  // ---------- Contact : formulaire -> WhatsApp ----------
  // Numéro WhatsApp de l'institut (format international, sans + ni espaces)
  const WHATSAPP_NUMBER = '2290150396530';

  const form = document.getElementById('rdv-form');
  if (form) {
    const status = document.getElementById('form-status');
    const dateInput = form.elements.date;
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nom = form.elements.nom.value.trim();
      const tel = form.elements.tel.value.trim();
      const phoneOk = tel.replace(/[^\d]/g, '').length >= 8;

      form.elements.nom.closest('.field').classList.toggle('is-invalid', !nom);
      form.elements.tel.closest('.field').classList.toggle('is-invalid', !phoneOk);

      if (!nom || !phoneOk) {
        status.textContent = 'Merci de renseigner votre nom et un numéro de téléphone valide.';
        status.classList.add('is-error');
        return;
      }

      const lines = [
        'Bonjour L.A Beauty, je souhaite prendre rendez-vous.',
        `Nom : ${nom}`,
        `Téléphone : ${tel}`,
        `Soin souhaité : ${form.elements.soin.value}`
      ];
      if (dateInput && dateInput.value) {
        const d = new Date(dateInput.value + 'T00:00:00');
        lines.push(`Date souhaitée : ${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`);
      }
      const msg = form.elements.message.value.trim();
      if (msg) lines.push(`Message : ${msg}`);

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
      status.classList.remove('is-error');
      status.textContent = 'Merci ! WhatsApp s’ouvre avec votre demande, il ne reste qu’à l’envoyer.';
      form.reset();
    });

    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field');
      if (f) f.classList.remove('is-invalid');
    });
  }

  // ---------- Retour en haut ----------
  const toTop = document.getElementById('to-top');
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Année du pied de page
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
