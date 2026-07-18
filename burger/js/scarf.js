/* ============================================================
   YELLOWBURGER · scarf.js
   Maccabi scarf waving like a flag — Three.js (WebGL2)
   Premium procedural knit texture + cloth-ripple shader.
   Drop an image at images/scarf.png to override the texture.
   ============================================================ */
import * as THREE from 'three';

const banner = document.getElementById('scarfBanner');
const canvas = document.getElementById('scarfCanvas');
if (banner && canvas) boot();

function boot() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); }
  catch (e) { return; }                          // no WebGL → CSS fallback stays
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 0.9, -0.9, -10, 10);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const geo = new THREE.PlaneGeometry(2, 1.5, 280, 30);
  const uniforms = {
    uTex:  { value: makeScarfTexture() },
    uTime: { value: 0 },
    uAmp:  { value: reduce ? 0.03 : 0.12 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true,
    vertexShader: /* glsl */`
      uniform float uTime, uAmp;
      varying vec2 vUv; varying float vSh;
      void main(){
        vUv = uv;
        float ph  = uv.x * 13.0 - uTime * 2.0;
        float ph2 = uv.x * 6.0  - uTime * 1.25;
        float wave = sin(ph) + 0.32 * sin(ph * 2.1 + 1.0);
        vec3 p = position;
        p.y += wave * uAmp * (0.5 + 0.5 * uv.x) + sin(ph2) * uAmp * 0.18 * (uv.y - 0.5);
        p.z += wave * uAmp * 0.55;
        vSh = 0.74 + 0.26 * cos(ph);             // soft directional light from the ripple
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex;
      varying vec2 vUv; varying float vSh;
      void main(){
        vec4 c = texture2D(uTex, vUv);
        float sheen = 0.92 + 0.08 * sin(vUv.y * 3.14159);   // subtle fabric sheen
        gl_FragColor = vec4(c.rgb * vSh * sheen, c.a);
      }`,
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  let procedural = true;

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!procedural) return;
      uniforms.uTex.value.dispose?.();
      uniforms.uTex.value = makeScarfTexture();
      resize();
    });
  }

  new THREE.TextureLoader().load('images/scarf.png', (tex) => {
    procedural = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    uniforms.uTex.value.dispose?.();
    uniforms.uTex.value = tex; resize();
  }, undefined, () => {});

  function resize() {
    const w = banner.clientWidth || window.innerWidth;
    const h = banner.clientHeight || 84;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.left = -aspect; camera.right = aspect; camera.updateProjectionMatrix();
    mesh.scale.x = aspect;
    const tex = uniforms.uTex.value;
    tex.repeat.x = Math.max(1.2, aspect / 7.0);
    tex.needsUpdate = true;
  }
  const ro = ('ResizeObserver' in window) ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(banner); else window.addEventListener('resize', resize);
  resize();

  let t0 = performance.now();
  function frame(now) {
    const dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
    if (!reduce) {
      uniforms.uTime.value += dt;
      uniforms.uTex.value.offset.x -= dt * 0.024;   // gentle flowing drift
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   Premium Maccabi scarf texture (tileable horizontally)
   Golden knit field · navy edge bands · Star-of-David crest ·
   "MACCABI TEL AVIV" · championship stars.
   ============================================================ */
function makeScarfTexture() {
  const W = 2048, H = 320, UNIT = W / 2;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');

  const GOLD = '#FFCE1F', GOLD_HI = '#FFE47E', GOLD_LO = '#F2AC00';
  const NAVY = '#0B1E5E', NAVY_HI = '#16307E', CREAM = '#FFF4CB';

  // fabric base — vertical sheen
  let g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, GOLD_HI); g.addColorStop(.5, GOLD); g.addColorStop(1, GOLD_LO);
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  // knit rows (fine horizontal weave)
  for (let y = 0; y < H; y += 3) {
    x.fillStyle = (y % 6 === 0) ? 'rgba(60,40,0,.05)' : 'rgba(255,255,255,.055)';
    x.fillRect(0, y, W, 1);
  }
  // vertical knit ticks
  x.fillStyle = 'rgba(120,80,0,.05)';
  for (let vx = 0; vx < W; vx += 7) x.fillRect(vx, 0, 1, H);

  // navy edge bands + gold hairlines
  const band = Math.round(H * 0.16);
  let bg = x.createLinearGradient(0, 0, 0, band);
  bg.addColorStop(0, NAVY_HI); bg.addColorStop(1, NAVY);
  x.fillStyle = bg; x.fillRect(0, 0, W, band); x.fillRect(0, H - band, W, band);
  x.fillStyle = GOLD_HI;
  x.fillRect(0, band, W, 3); x.fillRect(0, band + 7, W, 1);
  x.fillRect(0, H - band - 3, W, 3); x.fillRect(0, H - band - 8, W, 1);

  // subtle navy pinstripes in the field
  x.fillStyle = 'rgba(11,30,94,.11)';
  for (let vx = 42; vx < W; vx += 84) x.fillRect(vx, band + 10, 2, H - 2 * band - 20);

  // repeating content: MACCABI · crest · TEL AVIV
  const col = { GOLD, GOLD_HI, GOLD_LO, NAVY, NAVY_HI, CREAM };
  for (let i = 0; i < 2; i++) {
    const ox = i * UNIT;
    x.fillStyle = NAVY; x.textBaseline = 'middle';
    x.font = '900 76px "Rubik", system-ui, sans-serif';
    drawSpaced(x, 'MACCABI', ox + UNIT * 0.245, H / 2, 5);
    drawSpaced(x, 'TEL AVIV', ox + UNIT * 0.755, H / 2, 5);
    drawCrest(x, ox + UNIT * 0.5, H / 2, 86, col);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  return tex;
}

function drawSpaced(ctx, text, cx, cy, ls) {
  const w = [...text].map(ch => ctx.measureText(ch).width + ls);
  const total = w.reduce((a, b) => a + b, 0) - ls;
  let px = cx - total / 2; ctx.textAlign = 'left';
  for (let i = 0; i < text.length; i++) { ctx.fillText(text[i], px, cy); px += w[i]; }
}

function star6(ctx, cx, cy, r, color, fill) {
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, r * 0.14); ctx.lineJoin = 'round';
  for (let t = 0; t < 2; t++) {
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = Math.PI / 2 + (t ? Math.PI : 0) + k * (2 * Math.PI / 3);
      const px = cx + r * Math.cos(a), py = cy - r * Math.sin(a);
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath(); fill ? ctx.fill() : ctx.stroke();
  }
  ctx.restore();
}

function starFill(ctx, cx, cy, r, color) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const px = cx + rad * Math.cos(a), py = cy + rad * Math.sin(a);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function drawCrest(ctx, cx, cy, r, col) {
  ctx.save();
  // soft outer glow
  ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 14;
  ctx.fillStyle = col.NAVY;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // gold rings
  ctx.lineWidth = 7; ctx.strokeStyle = col.GOLD_HI;
  ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = col.GOLD;
  ctx.beginPath(); ctx.arc(cx, cy, r - 15, 0, Math.PI * 2); ctx.stroke();
  // Star of David
  star6(ctx, cx, cy + 5, r * 0.5, col.GOLD_HI, false);
  // 3 championship stars
  for (let s = -1; s <= 1; s++) starFill(ctx, cx + s * r * 0.4, cy - r * 0.64, r * 0.12, col.GOLD_HI);
  // est. year
  ctx.fillStyle = col.GOLD; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '800 15px "Rubik", system-ui, sans-serif';
  ctx.fillText('EST. 1906', cx, cy + r * 0.6);
  ctx.restore();
}
