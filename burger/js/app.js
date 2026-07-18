/* ============================================================
   YELLOWBURGER · app.js
   Scroll-driven image sequence (frame-by-frame on scroll) + UI motion
   ============================================================ */
(() => {
  'use strict';
  // start at frame 014 — the first frame where the whole bun is inside the frame
  const FRAME_START = 13;
  const FRAME_COUNT = 137;                        // frames 014..150
  const framePath = i => `seq/frame_${String(i + FRAME_START).padStart(3, '0')}.jpg`;

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
  // Fit the whole burger so its EDGES stay visible (product shot), on black.
  // Landscape: contain (fills width, full burger). Portrait: zoom in so the
  // burger is prominent but never cropped at the sides. Frame's black bg blends
  // with the black letterbox, and the video's realistic smoke is preserved.
  const BURGER_W = 0.42;   // the burger's share of the (mostly-black) 16:9 frame width
  function drawFit(img) {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    ctx.fillStyle = '#04060f';
    ctx.fillRect(0, 0, cw, ch);
    if (!img || !img.complete || !img.naturalWidth) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (ch > cw) {
      // PORTRAIT: show the whole burger BIG, centred in the band under the header
      // (never crop the sides), so no dead black gap and the full bun is visible.
      const bandTop = ch * 0.12, bandBot = ch * 0.87;
      let scale = (cw * 0.96) / (iw * BURGER_W);
      scale = Math.min(scale, (bandBot - bandTop) / ih);
      const dw = iw * scale, dh = ih * scale;
      const dy = bandTop + (bandBot - bandTop - dh) / 2;
      ctx.drawImage(img, (cw - dw) / 2, dy, dw, dh);
    } else {
      // LANDSCAPE: contain — the whole burger fills the width
      const scale = Math.min(cw / iw, ch / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }
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
    drawFit(images[Math.min(Math.max(i, 0), FRAME_COUNT - 1)]);
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
  // caption bands tuned to the new sequence:
  // bun descends → burger closes → rotating glamour → hero close-up (CTA)
  const bands = [
    { in0: -0.10, in1: 0.00, out0: 0.15, out1: 0.23, y: -40 },
    { in0: 0.27, in1: 0.37, out0: 0.47, out1: 0.55, y: 40 },
    { in0: 0.57, in1: 0.66, out0: 0.75, out1: 0.83, y: 40 },
    { in0: 0.88, in1: 0.96, out0: 1.01, out1: 1.02, y: 30 },
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

  // mobile menu
  const burger = document.getElementById('burger');
  const mobile = document.getElementById('mobileMenu');
  if (burger && mobile) {
    burger.addEventListener('click', () => mobile.classList.toggle('hidden'));
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobile.classList.add('hidden')));
  }
})();
