/* ============================================================
   SEA · app.js
   Scroll-driven beach sequence + UI motion
   ============================================================ */
(() => {
  'use strict';
  const FRAME_COUNT = 120;
  const framePath = i => `frames/frame_${String(i).padStart(3, '0')}.jpg`;

  const canvas = document.getElementById('sequence');
  const ctx = canvas.getContext('2d', { alpha: false });
  const hero = document.getElementById('hero');
  const captions = Array.from(document.querySelectorAll('.cap'));

  const images = new Array(FRAME_COUNT);
  let loaded = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('pFill');
  const pct = document.getElementById('pPct');
  document.body.classList.add('is-loading');

  function onProgress() {
    loaded++;
    const p = Math.round((loaded / FRAME_COUNT) * 100);
    if (fill) fill.style.width = p + '%';
    if (pct) pct.textContent = p;
    if (loaded === FRAME_COUNT) start();
  }
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.onload = onProgress; img.onerror = onProgress;
    img.src = framePath(i);
    images[i - 1] = img;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(currentFrame, true);
  }
  function drawCover(img) {
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let dw, dh;
    if (cr > ir) { dw = cw; dh = cw / ir; } else { dh = ch; dw = ch * ir; }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  let currentFrame = 0, targetFrame = 0, lastDrawn = -1, ticking = false;

  function computeTarget() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const p = total > 0 ? scrolled / total : 0;
    targetFrame = p * (FRAME_COUNT - 1);
    updateCaptions(p);
  }
  function drawFrame(index, force) {
    const i = Math.round(index);
    if (!force && i === lastDrawn) return;
    lastDrawn = i;
    drawCover(images[Math.min(Math.max(i, 0), FRAME_COUNT - 1)]);
  }
  function loop() {
    currentFrame += (targetFrame - currentFrame) * 0.18;
    if (Math.abs(targetFrame - currentFrame) < 0.01) currentFrame = targetFrame;
    drawFrame(currentFrame, false);
    if (Math.abs(targetFrame - currentFrame) > 0.01) requestAnimationFrame(loop);
    else ticking = false;
  }
  function kick() { if (!ticking) { ticking = true; requestAnimationFrame(loop); } }
  function onScroll() { computeTarget(); kick(); }

  const smoothstep = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
  // pour begins → glass fills → bubbles rise → full flute (CTA)
  const bands = [
    { in0: -0.10, in1: 0.00, out0: 0.13, out1: 0.21, y: -40 },
    { in0: 0.25, in1: 0.35, out0: 0.45, out1: 0.53, y: 40 },
    { in0: 0.55, in1: 0.64, out0: 0.73, out1: 0.81, y: 40 },
    { in0: 0.87, in1: 0.95, out0: 1.01, out1: 1.02, y: 30 },
  ];
  function updateCaptions(p) {
    captions.forEach((el, idx) => {
      const b = bands[idx]; if (!b) return;
      const appear = smoothstep(b.in0, b.in1, p);
      const disappear = smoothstep(b.out0, b.out1, p);
      el.style.opacity = (appear * (1 - disappear)).toFixed(3);
      const ty = b.y * (1 - appear) + (-b.y * 0.6) * disappear;
      el.style.transform = `translateY(${ty.toFixed(1)}px)`;
    });
  }

  function start() {
    resize(); computeTarget(); currentFrame = targetFrame; drawFrame(currentFrame, true);
    preloader.classList.add('done');
    document.body.classList.remove('is-loading');
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    kick();
  }
  setTimeout(() => { if (document.body.classList.contains('is-loading')) start(); }, 9000);

  // ---------- UI ----------
  const nav = document.getElementById('nav');
  const navScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  navScroll();
  window.addEventListener('scroll', navScroll, { passive: true });

  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav__mobile a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // count-up stats
  const countEls = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = parseFloat(el.dataset.count), dur = 1400, t0 = performance.now();
      const suffix = el.dataset.suffix || '';
      const step = (now) => {
        const k = Math.min((now - t0) / dur, 1);
        const val = target * (1 - Math.pow(1 - k, 3));
        el.textContent = (target % 1 ? val.toFixed(1) : Math.round(val)) + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  countEls.forEach(el => cio.observe(el));

  // club form
  const form = document.getElementById('bookForm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault(); form.reset();
    const ok = document.getElementById('formOk');
    if (ok) ok.hidden = false;
  });
})();
