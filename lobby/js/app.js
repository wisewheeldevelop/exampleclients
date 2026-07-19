/* ============================================================
   3D SHOWROOM LOBBY · WiseWheel Automate
   WebGL2 · three.js — black-marble pavilion, gold light, an
   animated hostess that walks you inside to 7 live-site screens.
   ============================================================ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* ------------------------------------------------------------
   Site data — drives 3D screens, keyboard nav and the fallback
   ------------------------------------------------------------ */
const SITES = [
  { id: 'burger',    name: 'YellowBurger',   tag: 'מסעדה · מותג ספורט', url: '../burger/index.html',    thumb: '../assets/thumbs/burger.jpg' },
  { id: 'dj',        name: 'PULSE',          tag: 'אירועים · מוזיקה',    url: '../dj/index.html',        thumb: '../assets/thumbs/dj.jpg' },
  { id: 'shawarma',  name: 'לֶהָבָה',          tag: 'מסעדה · אוכל',        url: '../shawarma.html',        thumb: '../assets/thumbs/shawarma.jpg' },
  { id: 'champagne', name: 'WISE Champagne', tag: 'יוקרה · משקאות',      url: '../Champagne/index.html', thumb: '../assets/thumbs/champagne.jpg' },
  { id: 'sea',       name: 'SEA',            tag: 'תיירות · יוון',       url: '../sea/index.html',       thumb: '../assets/thumbs/sea.jpg' },
  { id: 'shoes',     name: 'MONO',           tag: 'אופנה · סניקרס',      url: '../shoes/index.html',     thumb: '../assets/thumbs/shoes.jpg' },
];

const canvas = document.getElementById('stage');
const $ = id => document.getElementById(id);

/* ------------------------------------------------------------
   WebGL2 gate → fallback grid
   ------------------------------------------------------------ */
function webgl2Available() {
  try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); }
  catch (e) { return false; }
}
if (!webgl2Available()) {
  $('preloader').classList.add('done');
  canvas.hidden = true;
  const fb = $('fallback'); fb.hidden = false;
  $('fallbackGrid').innerHTML = SITES.map(s =>
    `<a href="${s.url}"><img src="${s.thumb}" alt="${s.name}" /><span>${s.name}</span></a>`).join('');
  throw new Error('WebGL2 not available — fallback shown');
}

/* ------------------------------------------------------------
   Renderer · quality tier
   ------------------------------------------------------------ */
const IS_TOUCH = matchMedia('(pointer:coarse)').matches;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOW = IS_TOUCH; // mobile tier: no bloom, pixelRatio 1

const renderer = new THREE.WebGLRenderer({ canvas, antialias: !LOW, powerPreference: 'high-performance' });
renderer.setPixelRatio(LOW ? 1 : Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0d1526, 34, 120);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 300);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

/* ------------------------------------------------------------
   Materials — marble · gold · glass
   ------------------------------------------------------------ */
function marbleTexture(base = '#0c0c10', vein = 'rgba(190,195,210,.16)', size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, size, size);
  // veins: jittered light polylines
  for (let i = 0; i < 26; i++) {
    x.strokeStyle = vein; x.lineWidth = 0.6 + Math.random() * 1.6;
    x.beginPath();
    let px = Math.random() * size, py = Math.random() * size;
    x.moveTo(px, py);
    for (let k = 0; k < 8; k++) { px += (Math.random() - 0.5) * 150; py += (Math.random() - 0.5) * 150; x.lineTo(px, py); }
    x.globalAlpha = 0.25 + Math.random() * 0.5; x.stroke(); x.globalAlpha = 1;
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const marbleMap = marbleTexture();
const M = {
  marble: new THREE.MeshStandardMaterial({ map: marbleMap, color: 0x585a62, roughness: 0.3, metalness: 0.18, envMapIntensity: 0.45 }),
  marbleDark: new THREE.MeshStandardMaterial({ map: marbleMap, color: 0x2e3036, roughness: 0.4, metalness: 0.15, envMapIntensity: 0.3 }),
  floorOut: new THREE.MeshStandardMaterial({ map: marbleMap, color: 0x35383f, roughness: 0.18, metalness: 0.22, envMapIntensity: 0.55 }),
  floorIn: new THREE.MeshStandardMaterial({ map: marbleMap, color: 0x2c2f38, roughness: 0.16, metalness: 0.22, envMapIntensity: 0.6 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x9db4cc, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.1, envMapIntensity: 0.7, side: THREE.DoubleSide }),
  fabric: new THREE.MeshStandardMaterial({ color: 0x17181d, roughness: 0.9, metalness: 0 }),
  fabric2: new THREE.MeshStandardMaterial({ color: 0x232019, roughness: 0.85, metalness: 0.05 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x1d3a1c, roughness: 0.9, flatShading: true, envMapIntensity: 0.2 }),
  leafLit: new THREE.MeshStandardMaterial({ color: 0x3f6b2a, roughness: 0.8, flatShading: true, emissive: 0x1a3510, emissiveIntensity: 0.4, envMapIntensity: 0.2 }),
  rock: new THREE.MeshStandardMaterial({ color: 0x3a3d44, roughness: 0.95, flatShading: true, envMapIntensity: 0.2 }),
  water: new THREE.MeshStandardMaterial({ color: 0x0a1420, roughness: 0.06, metalness: 0.5, envMapIntensity: 0.9, transparent: true, opacity: 0.92 }),
};
M.gold = new THREE.MeshStandardMaterial({ color: 0xffb45c, emissive: 0xffa53e, emissiveIntensity: LOW ? 2.0 : 1.35, roughness: 0.4 });
const goldStripMat = M.gold;
const warmGlowMat = new THREE.MeshStandardMaterial({ color: 0xffe9c4, emissive: 0xffd9a0, emissiveIntensity: LOW ? 2.0 : 1.4, roughness: 0.5 });

/* ------------------------------------------------------------
   Sky dome + stars
   ------------------------------------------------------------ */
{
  const skyGeo = new THREE.SphereGeometry(180, 24, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x0a1128) }, mid: { value: new THREE.Color(0x1a3054) }, low: { value: new THREE.Color(0x3d4a66) } },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 low;
      void main(){
        float h = normalize(vP).y;
        vec3 c = mix(mid, top, smoothstep(0.06, 0.6, h));
        c = mix(low, c, smoothstep(-0.04, 0.14, h));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  const starGeo = new THREE.BufferGeometry();
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2, e = 0.18 + Math.random() * 0.75, r = 160;
    pts.push(r * Math.cos(e) * Math.cos(a), r * Math.sin(e), r * Math.cos(e) * Math.sin(a));
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbdd0ff, size: 0.5, sizeAttenuation: true, transparent: true, opacity: 0.8, fog: false })));
}

/* ------------------------------------------------------------
   Lights (emissive-led look — few real lights, no shadows)
   ------------------------------------------------------------ */
scene.add(new THREE.HemisphereLight(0x30425f, 0x0a0c12, 0.42));
const moon = new THREE.DirectionalLight(0x8fa8d8, 0.35); moon.position.set(-30, 40, 30); scene.add(moon);
const hallLight = new THREE.PointLight(0xffd9a0, 16, 34, 1.9); hallLight.position.set(0, 4.4, -7); scene.add(hallLight);
const doorLight = new THREE.PointLight(0xffc890, 9, 18, 2); doorLight.position.set(0, 3.2, 2.6); scene.add(doorLight);
const pathLight = new THREE.PointLight(0xffc890, 6, 22, 2); pathLight.position.set(0, 1.6, 13); scene.add(pathLight);

/* ------------------------------------------------------------
   Geometry helpers
   ------------------------------------------------------------ */
const world = new THREE.Group(); scene.add(world);
function box(w, h, d, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.rotation.y = ry; world.add(m); return m;
}

/* ============================================================
   EXTERIOR — plaza, light-lines, pools, greenery, glow cubes
   ============================================================ */
{
  // plaza floor
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), M.floorOut);
  plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0, 12);
  marbleMap.repeat.set(6, 6);
  world.add(plaza);

  // walkway edge strips
  for (const sx of [-2.3, 2.3]) box(0.1, 0.03, 20, goldStripMat, sx, 0.015, 13);
  // chevron light-lines converging to entrance (reference 3D1)
  for (let i = 0; i < 4; i++) {
    const z = 6.5 + i * 4.2;
    box(7.5, 0.03, 0.09, goldStripMat, -5.4, 0.015, z, -0.42);
    box(7.5, 0.03, 0.09, goldStripMat, 5.4, 0.015, z, 0.42);
  }
  // entrance steps
  for (let i = 0; i < 3; i++) {
    box(10.5 - i * 0.7, 0.15, 1.15 - i * 0.12, M.marble, 0, 0.075 + i * 0.15, 3.4 - i * 0.55);
    box(10.4 - i * 0.7, 0.028, 0.05, goldStripMat, 0, 0.16 + i * 0.15, 3.95 - i * 0.55);
  }

  // water pools with rocks + bushes
  for (const sx of [-1, 1]) {
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(11, 13), M.water);
    pool.rotation.x = -Math.PI / 2; pool.position.set(sx * 8.6, 0.02, 12.5);
    world.add(pool);
    box(0.12, 0.1, 13.2, M.marbleDark, sx * 3.05, 0.05, 12.5);
    for (let i = 0; i < 5; i++) {
      const r = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35 + Math.random() * 0.5, 0), M.rock);
      r.position.set(sx * (5.5 + Math.random() * 5), 0.2, 7.5 + Math.random() * 10);
      r.rotation.set(Math.random() * 3, Math.random() * 3, 0); world.add(r);
    }
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4 + Math.random() * 0.45, 1), Math.random() > 0.5 ? M.leaf : M.leafLit);
      b.scale.y = 0.75;
      b.position.set(sx * (4.4 + Math.random() * 7), 0.3, 5.8 + Math.random() * 13);
      world.add(b);
    }
    // tall tree blobs
    for (const tz of [6, 17]) {
      box(0.16, 2.4, 0.16, M.rock, sx * 11.5, 1.2, tz);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), M.leaf);
      crown.position.set(sx * 11.5, 3.2, tz); crown.scale.set(1, 1.25, 1); world.add(crown);
    }
    // glow cube lamps
    for (const gz of [6.5, 11, 15.5, 20]) box(0.34, 0.34, 0.34, warmGlowMat, sx * 3.6, 0.17, gz);
  }
}

/* ============================================================
   PAVILION — shell, glass, roof LED, interior hall
   ============================================================ */
const INTERIOR_Y = 0.45;          // interior floor height (top of steps)
const HALL = new THREE.Vector3(0, INTERIOR_Y, -7.4);  // hall centre
{
  const W = 23, D = 19, H = 5.6;  // footprint
  const zF = 2.2, zB = zF - D;    // front/back wall z

  // interior floor
  const fl = new THREE.Mesh(new THREE.CylinderGeometry(10.4, 10.4, 0.1, 48), M.floorIn);
  fl.position.set(HALL.x, INTERIOR_Y - 0.05, HALL.z); world.add(fl);
  box(W, 0.1, D, M.floorIn, 0, INTERIOR_Y - 0.051, zF - D / 2);

  // roof slab + fascia LED ring
  box(W + 2.4, 0.5, D + 2.4, M.marbleDark, 0, H + 0.25, zF - D / 2);
  const led = new THREE.Mesh(new THREE.BoxGeometry(W + 2.5, 0.05, D + 2.5), goldStripMat);
  led.position.set(0, H - 0.03, zF - D / 2); world.add(led);
  led.scale.set(1, 1, 1);
  // pitched block (silhouette, back-left like reference)
  const pitched = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 5.4, 2.6, 4, 1), M.marbleDark);
  pitched.rotation.y = Math.PI / 4; pitched.position.set(-5.5, H + 1.8, -8); world.add(pitched);

  // corner + door columns
  for (const [cx, cz] of [[-W / 2, zF], [W / 2, zF], [-W / 2, zB], [W / 2, zB], [-2.9, zF], [2.9, zF]]) {
    box(0.65, H, 0.65, M.marble, cx, H / 2, cz);
    box(0.06, H, 0.06, goldStripMat, cx + 0.36, H / 2, cz + 0.36);
  }

  // glass: front (two panes flanking open door), sides
  const glassH = H - 0.2;
  box(W / 2 - 3.2, glassH, 0.06, M.glass, -(W / 4 + 1.6), glassH / 2, zF);
  box(W / 2 - 3.2, glassH, 0.06, M.glass, (W / 4 + 1.6), glassH / 2, zF);
  box(0.06, glassH, D, M.glass, -W / 2, glassH / 2, zF - D / 2);
  box(0.06, glassH, D, M.glass, W / 2, glassH / 2, zF - D / 2);
  // door header
  box(6, 0.7, 0.4, M.marble, 0, H - 0.35, zF);
  box(5.8, 0.05, 0.1, goldStripMat, 0, H - 0.72, zF + 0.1);

  // back wall (solid marble, holds the hero screen)
  box(W, H, 0.4, M.marble, 0, H / 2, zB);
  // side interior wall segments (hold side screens)
  for (const sx of [-1, 1]) {
    box(0.3, H, 9.5, M.marble, sx * 8.6, H / 2, -9);
  }

  // ceiling disc + 3 concentric gold rings (signature, reference 3D2)
  const ceil = new THREE.Mesh(new THREE.CylinderGeometry(9.8, 9.8, 0.12, 48), M.marbleDark);
  ceil.position.set(HALL.x, H - 0.1, HALL.z); world.add(ceil);
  for (const [r, y] of [[1.4, H - 0.5], [2.5, H - 0.34], [3.6, H - 0.2]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.055, 12, 72), goldStripMat);
    ring.rotation.x = Math.PI / 2; ring.position.set(HALL.x, y, HALL.z); world.add(ring);
  }
  // recessed spot dots
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.07, 10), warmGlowMat);
    dot.rotation.x = Math.PI / 2; dot.position.set(HALL.x + Math.cos(a) * 6.4, H - 0.16, HALL.z + Math.sin(a) * 6.4);
    world.add(dot);
  }

  // central platform + gold rim
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.7, 0.14, 48), M.marbleDark);
  plat.position.set(HALL.x, INTERIOR_Y + 0.07, HALL.z); world.add(plat);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.68, 0.035, 10, 64), goldStripMat);
  rim.rotation.x = Math.PI / 2; rim.position.set(HALL.x, INTERIOR_Y + 0.05, HALL.z); world.add(rim);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.6, 40), M.fabric);
  rug.rotation.x = -Math.PI / 2; rug.position.set(HALL.x, INTERIOR_Y + 0.145, HALL.z); world.add(rug);

  // sofas around the platform
  const sofa = (x, z, ry) => {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.42, 0.85), M.fabric); seat.position.y = 0.36;
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.2), M.fabric); back.position.set(0, 0.78, -0.33);
    const cush1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.5), M.fabric2); cush1.position.set(-0.5, 0.63, 0.02);
    const cush2 = cush1.clone(); cush2.position.x = 0.5;
    g.add(seat, back, cush1, cush2);
    g.position.set(x, INTERIOR_Y, z); g.rotation.y = ry; world.add(g);
  };
  sofa(HALL.x - 4.9, HALL.z + 1.2, Math.PI / 2.4);
  sofa(HALL.x + 4.9, HALL.z + 1.2, -Math.PI / 2.4);
  sofa(HALL.x - 4.6, HALL.z - 3.2, Math.PI / 3.4);
  sofa(HALL.x + 4.6, HALL.z - 3.2, -Math.PI / 3.4);
  sofa(HALL.x - 2.4, HALL.z + 4.6, Math.PI * 0.92);
  sofa(HALL.x + 2.4, HALL.z + 4.6, -Math.PI * 0.92);

  // thin warm cove strip low on the side walls (subtle wash, never blown out)
  for (const sx of [-1, 1]) {
    const cove = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 8.4), new THREE.MeshStandardMaterial({ color: 0xffca8a, emissive: 0xffb45c, emissiveIntensity: LOW ? 1.1 : 0.7, roughness: 0.6 }));
    cove.position.set(sx * 8.42, 0.7, -8); world.add(cove);
  }
}

/* ============================================================
   KIOSK + 7 SCREENS
   ============================================================ */
const screens = [];   // { mesh, frame, site }
function captionTexture(name, tag) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 96;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(10,12,20,.92)'; x.fillRect(0, 0, 512, 96);
  x.fillStyle = '#ffb45c'; x.fillRect(0, 0, 512, 4);
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'rtl';
  x.fillStyle = '#fff'; x.font = '700 34px Heebo, sans-serif';
  x.fillText(name, 256, 34);
  x.fillStyle = '#99A0B6'; x.font = '400 22px Heebo, sans-serif';
  x.fillText(tag, 256, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const thumbTex = {};

function makeScreen(site, w, h, pos, ry) {
  const g = new THREE.Group();
  // marble backing + gold frame
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.34, h + 0.62, 0.1), M.marbleDark); back.position.z = -0.07; g.add(back);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, h + 0.38, 0.04), new THREE.MeshStandardMaterial({ color: 0xffb45c, emissive: 0xffa53e, emissiveIntensity: 0.7, roughness: 0.4 }));
  frame.position.z = -0.025; g.add(frame);
  // screen face
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: thumbTex[site.id], toneMapped: false })
  );
  g.add(face);
  // caption bar
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(w, h * 0.18), new THREE.MeshBasicMaterial({ map: captionTexture(site.name, site.tag), toneMapped: false }));
  cap.position.set(0, -(h / 2) - h * 0.09 - 0.03, 0.001); g.add(cap);

  g.position.copy(pos); g.rotation.y = ry;
  world.add(g);
  face.userData = { site, frame, group: g, baseScale: 1 };
  screens.push(face);
  return g;
}

let centralFace = null, centralIndex = 3; // start on champagne — elegant
function buildScreens() {
  // hero central screen on back wall — a rotating slideshow of all sites
  makeScreen(SITES[centralIndex], 5.7, 3.2, new THREE.Vector3(0, 2.95, -16.55), 0);
  centralFace = screens[screens.length - 1];
  centralFace.userData.isCentral = true;

  // 6 side screens — all sites, 3 per wall, angled inward
  const zs = [-4.6, -7.6, -10.6];
  for (let i = 0; i < 3; i++) {
    makeScreen(SITES[i],     2.5, 1.55, new THREE.Vector3(8.32, 2.4, zs[i]), -Math.PI / 2);
    makeScreen(SITES[i + 3], 2.5, 1.55, new THREE.Vector3(-8.32, 2.4, zs[i]), Math.PI / 2);
  }

  // kiosk podium + tilted logo screen
  const kio = new THREE.Group();
  const ped = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.05, 0.45), M.marble); ped.position.y = 0.52; kio.add(ped);
  const kStrip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.4), goldStripMat); kStrip.position.y = 1.06; kio.add(kStrip);
  const lc = document.createElement('canvas'); lc.width = 512; lc.height = 320;
  const lx = lc.getContext('2d');
  const grd = lx.createLinearGradient(0, 0, 512, 320);
  grd.addColorStop(0, '#141a34'); grd.addColorStop(1, '#0a0c18');
  lx.fillStyle = grd; lx.fillRect(0, 0, 512, 320);
  const g2 = lx.createLinearGradient(60, 0, 452, 0);
  g2.addColorStop(0, '#8FA2FF'); g2.addColorStop(0.5, '#C86BFF'); g2.addColorStop(1, '#FF9DBB');
  lx.fillStyle = g2; lx.textAlign = 'center'; lx.direction = 'rtl';
  lx.font = '700 52px "Space Grotesk", Heebo, sans-serif'; lx.fillText('WiseWheel', 256, 140);
  lx.fillStyle = '#EDEFF7'; lx.font = '300 34px Heebo, sans-serif'; lx.fillText('אולם התצוגה 2026', 256, 210);
  const kioTex = new THREE.CanvasTexture(lc); kioTex.colorSpace = THREE.SRGBColorSpace;
  const kScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.54), new THREE.MeshBasicMaterial({ map: kioTex, toneMapped: false }));
  kScreen.position.set(0, 1.28, 0.1); kScreen.rotation.x = -0.42; kio.add(kScreen);
  kio.position.set(HALL.x + 1.7, INTERIOR_Y, HALL.z + 0.6); kio.rotation.y = Math.PI * 0.06;
  world.add(kio);
}

/* central screen carousel — auto-rotates until the visitor takes control */
let slideTimer = 0, slidePaused = false;
function setCentral(i) {
  centralIndex = (i + SITES.length) % SITES.length;
  const s = SITES[centralIndex];
  if (centralFace) {
    centralFace.material.map = thumbTex[s.id];
    centralFace.material.needsUpdate = true;
    centralFace.userData.site = s;
  }
  const scName = $('scName'); if (scName) scName.textContent = s.name;
  return s;
}
function cycleCentral(dir) { slidePaused = true; slideTimer = 0; setCentral(centralIndex + dir); }
function enterCentral() { if (centralFace) navigateTo(SITES[centralIndex], centralFace); }
function tickSlideshow(dt) {
  if (!centralFace || slidePaused) return;
  slideTimer += dt;
  if (slideTimer > 4) { slideTimer = 0; setCentral(centralIndex + 1); }
}

/* ============================================================
   HOSTESS — load, state machine, root-motion walk
   ============================================================ */
const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.9, 0, 14.4),
  new THREE.Vector3(0.35, 0, 9.5),
  new THREE.Vector3(0, 0, 5.2),
  new THREE.Vector3(0, INTERIOR_Y, 1.4),
  new THREE.Vector3(0, INTERIOR_Y, -3.4),
  new THREE.Vector3(-0.7, INTERIOR_Y, -5.2),
  new THREE.Vector3(-1.3, INTERIOR_Y, -6.4),   // ends ON the round platform
], false, 'catmullrom', 0.12);
const HOME = new THREE.Vector3(-1.3, INTERIOR_Y, -6.4); // hostess resting spot on stage
const PATH_LEN = PATH.getLength();
const WALK_DURATION = 8.5;                    // fixed, predictable walk-in (s)
const WALK_SPEED = PATH_LEN / WALK_DURATION;  // m/s → drives foot cadence

let hostess = null, mixer = null, walkAction = null, headBone = null, armBone = null;
let state = 'LOADING';        // LOADING → GREET → WALK → SETTLE → PRESENT
let walkT = 0;                // 0..1 along path
let walkStartMs = 0;          // wall-clock walk start (frame-rate independent)
const now = () => performance.now();
let clock = new THREE.Clock();
let idleT = 0;

const manager = new THREE.LoadingManager();
const fill = $('pFill'), pct = $('pPct');
manager.onProgress = (u, loaded, total) => {
  const p = Math.round((loaded / total) * 100);
  fill.style.width = p + '%'; pct.textContent = p;
};

function loadAll() {
  const tl = new THREE.TextureLoader(manager);
  for (const s of SITES) {
    thumbTex[s.id] = tl.load(s.thumb);
    thumbTex[s.id].colorSpace = THREE.SRGBColorSpace;
  }

  const gltfLoader = new GLTFLoader(manager);
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
  gltfLoader.setDRACOLoader(draco);
  gltfLoader.load('assets/hostess.glb', (gltf) => {
    hostess = new THREE.Group();
    const model = gltf.scene;
    hostess.add(model);
    // Normalise to 1.66m using the RENDERED (skinned) bounds — Box3.setFromObject
    // lies for skinned rigs whose armature carries baked scale. Iterating on
    // SkinnedMesh.computeBoundingBox converges no matter how the rig is nested.
    let skinned = null;
    model.traverse(o => { if (o.isSkinnedMesh && !skinned) skinned = o; });
    const measure = () => {
      hostess.updateWorldMatrix(true, true);
      if (skinned) {
        // mirror exactly what the renderer does before drawing a skinned mesh
        skinned.bindMatrixInverse.copy(skinned.matrixWorld).invert();
        skinned.skeleton.update();
        skinned.computeBoundingBox();
        return skinned.boundingBox.clone().applyMatrix4(skinned.matrixWorld);
      }
      return new THREE.Box3().setFromObject(model);
    };
    for (let i = 0; i < 4; i++) {
      const b = measure(); const h = b.max.y - b.min.y;
      if (h > 0.0001 && Math.abs(h - 1.66) > 0.01) model.scale.multiplyScalar(1.66 / h);
      else break;
    }
    const bb = measure();
    model.position.y -= bb.min.y;
    console.log(`[lobby] hostess height=${(bb.max.y - bb.min.y).toFixed(2)}m scale=${model.scale.x.toExponential(2)}`);

    model.traverse(o => {
      if (o.isBone) {
        const n = o.name.toLowerCase();
        if (!headBone && n.includes('head')) headBone = o;
        if (!armBone && (n.includes('rightarm') || n.includes('right_arm') || n.includes('upperarm'))) armBone = o;
      }
      if (o.isMesh) { o.frustumCulled = false; }
    });

    mixer = new THREE.AnimationMixer(model);
    const walkClip = THREE.AnimationClip.findByName(gltf.animations, 'Walking') || gltf.animations[0];
    walkAction = mixer.clipAction(walkClip);
    walkAction.play();
    walkAction.paused = true;            // greet: frozen on first frame + procedural idle

    hostess.position.copy(PATH.getPoint(0));
    hostess.rotation.y = 0;              // face +Z (toward camera)
    world.add(hostess);
  });
}
loadAll();

manager.onLoad = () => { buildScreens(); startExperience(); };

/* ============================================================
   CAMERA RIG + STATES
   ============================================================ */
const PORTRAIT0 = innerHeight > innerWidth;
const camTarget = new THREE.Vector3();
const CAM_START = {
  pos: new THREE.Vector3(-2.6, 2.3, PORTRAIT0 ? 34 : 27.5),
  look: new THREE.Vector3(0.3, 2.1, 10),
};
const FINAL = {
  pos: new THREE.Vector3(0, 2.15, PORTRAIT0 ? 2.2 : -0.4),
  look: new THREE.Vector3(0, 2.05, -9),
};
// free-look orbit around hall. yaw range kept tight enough that the camera
// never swings behind the walls into the night (phones sit further back, so
// their yaw span must be narrower than desktop's).
const orbit = {
  yaw: 0, pitch: 0.04, radius: PORTRAIT0 ? 8.6 : 7.6,
  target: new THREE.Vector3(HALL.x, 2.0, HALL.z),
  yawMin: -Math.PI, yawMax: Math.PI,         // full turn — camera follows the character
  pitchMin: -0.12, pitchMax: 0.5,
  rMin: PORTRAIT0 ? 4.6 : 3.6, rMax: PORTRAIT0 ? 9.4 : 8.4,
};
let dragging = false, px = 0, py = 0, pinchD = 0;

camera.position.copy(CAM_START.pos);
camTarget.copy(CAM_START.look);
camera.lookAt(camTarget);

const chip = $('chip'), enterWrap = $('enterWrap'),
      ringFill = $('ringFill'), cdEl = $('cd'), hint = $('hint'), tip = $('tip'),
      dpad = $('dpad'), screenCtl = $('screenCtl');

const CD_TOTAL = 5;
let cdStartMs = 0, cdRunning = false;

function startExperience() {
  $('preloader').classList.add('done');
  state = 'GREET';
  chip.hidden = false;
  enterWrap.hidden = false;
  buildSrNav();

  if (REDUCED) {
    $('cd').parentElement.style.display = 'none'; // no auto countdown
  } else {
    cdRunning = true;
    cdStartMs = now();
  }
  // log perf stats once for QA
  setTimeout(() => {
    console.log(`[lobby] drawCalls=${renderer.info.render.calls} tris=${renderer.info.render.triangles}`);
  }, 1500);
}

$('enterAuto').addEventListener('click', beginWalk);
$('enterManual').addEventListener('click', beginManual);

function beginWalk() {                       // "קחו אותי לאולם" — cinematic auto walk-in
  if (state !== 'GREET') return;
  cdRunning = false;
  enterWrap.classList.add('leave');
  chip.textContent = 'בואו אחריי…';

  if (REDUCED) {                             // jump straight inside
    hostess?.position.copy(HOME);
    if (hostess) hostess.rotation.y = 0.4;
    arrive();
    return;
  }
  state = 'WALK';
  walkT = 0;
  walkStartMs = now();
  if (walkAction) { walkAction.paused = false; walkAction.timeScale = THREE.MathUtils.clamp(WALK_SPEED / 1.3, 0.9, 2.0); }
}

function beginManual() {                      // "אני אלך לבד" — user drives the character in
  if (state !== 'GREET') return;
  cdRunning = false;
  enterWrap.classList.add('leave');
  chip.textContent = 'הובילו אותי פנימה — חצים / WASD';
  setTimeout(() => chip.classList.add('fade'), 4200);
  // hostess stays at the plaza start; user walks her in. Camera follows her.
  orbit.target.copy(hostess ? hostess.position : PATH.getPoint(0)).add(new THREE.Vector3(0, 1.3, 0));
  orbit.radius = 5.4; orbit.yaw = 0; orbit.pitch = 0.06;
  state = 'PRESENT';
  enterInteractive('הזיזו את הדמות עם החצים / WASD · לחצו על מסך כדי להיכנס');
}

function arrive() {
  state = 'PRESENT';
  if (walkAction) walkAction.paused = true;
  chip.textContent = 'הגענו! בחרו מסך — או טיילו עם החצים';
  setTimeout(() => chip.classList.add('fade'), 5200);
  syncOrbitFromCamera();
  orbit.radius = THREE.MathUtils.clamp(PORTRAIT0 ? 7.4 : 6.2, orbit.rMin, orbit.rMax);
  enterInteractive();
}

function enterInteractive(hintMsg) {
  if (hintMsg) $('hintText').textContent = hintMsg;
  hint.hidden = false;
  hint.classList.remove('fade');
  screenCtl.hidden = false;
  if (IS_TOUCH) dpad.hidden = false;         // desktop uses the keyboard
  setCentral(centralIndex);                  // sync carousel label
  setTimeout(() => hint.classList.add('fade'), 11000);
}

function syncOrbitFromCamera() {
  const off = camera.position.clone().sub(orbit.target);
  orbit.radius = THREE.MathUtils.clamp(off.length(), orbit.rMin, orbit.rMax);
  orbit.yaw = Math.atan2(off.x, off.z);
  orbit.pitch = Math.asin(THREE.MathUtils.clamp(off.y / off.length(), -1, 1)) - 0.12;
  orbit.pitch = THREE.MathUtils.clamp(orbit.pitch, orbit.pitchMin, orbit.pitchMax);
}

/* ------------------------------------------------------------
   Countdown ring (5s auto start)
   ------------------------------------------------------------ */
const RING_LEN = 131.9;
function tickCountdown() {
  if (!cdRunning || state !== 'GREET') return;
  const remain = CD_TOTAL - (now() - cdStartMs) / 1000;
  const p = THREE.MathUtils.clamp(remain / CD_TOTAL, 0, 1);
  ringFill.style.strokeDashoffset = (RING_LEN * p).toFixed(1);
  cdEl.textContent = Math.max(1, Math.ceil(remain));
  if (remain <= 0) beginWalk();
}

/* ============================================================
   INPUT — free look, hover, click
   ============================================================ */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let hovered = null;

function setNdc(e) {
  const r = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
}

canvas.addEventListener('pointerdown', (e) => {
  if (state !== 'PRESENT') return;
  dragging = true; px = e.clientX; py = e.clientY;
  canvas.classList.add('dragging');
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (dragging && state === 'PRESENT') {
    const dx = (e.clientX - px) / innerWidth, dy = (e.clientY - py) / innerHeight;
    px = e.clientX; py = e.clientY;
    orbit.yaw = THREE.MathUtils.clamp(orbit.yaw + dx * 2.6, orbit.yawMin, orbit.yawMax);
    orbit.pitch = THREE.MathUtils.clamp(orbit.pitch + dy * 1.6, orbit.pitchMin, orbit.pitchMax);
  }
  setNdc(e);
});
canvas.addEventListener('pointerup', (e) => {
  const moved = Math.hypot(e.clientX - px, e.clientY - py);
  dragging = false; canvas.classList.remove('dragging');
  // treat as click (tap) if barely moved
  if (moved < 6) handleClick(e);
});
canvas.addEventListener('wheel', (e) => {
  if (state !== 'PRESENT') return;
  orbit.radius = THREE.MathUtils.clamp(orbit.radius + e.deltaY * 0.004, orbit.rMin, orbit.rMax);
}, { passive: true });

// pinch zoom
canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && state === 'PRESENT') {
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    if (pinchD) orbit.radius = THREE.MathUtils.clamp(orbit.radius - (d - pinchD) * 0.02, orbit.rMin, orbit.rMax);
    pinchD = d;
  }
}, { passive: true });
canvas.addEventListener('touchend', () => { pinchD = 0; }, { passive: true });

function pickScreen(e) {
  setNdc(e);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(screens, false);
  return hits.length ? hits[0].object : null;
}

let navigating = false;
function handleClick(e) {
  if (navigating) return;
  const hit = pickScreen(e);
  if (!hit) return;
  navigateTo(hit.userData.site, hit);
}

function navigateTo(site, faceMesh) {
  navigating = true;
  tip.hidden = true;
  // camera push-in toward the screen, then go — wall-clock timed so it always
  // completes and navigates, no matter the frame rate.
  const start = camera.position.clone();
  const wp = new THREE.Vector3();
  (faceMesh || centralFace).getWorldPosition(wp);
  const dir = wp.clone().sub(start).normalize();
  const end = wp.clone().sub(dir.multiplyScalar(2.4));
  const lookStart = camTarget.clone();
  const t0 = now(), DUR = 560;
  const push = () => {
    const k = Math.min((now() - t0) / DUR, 1);
    const e = 1 - Math.pow(1 - k, 3);
    camera.position.lerpVectors(start, end, e);
    camTarget.lerpVectors(lookStart, wp, e);
    if (k < 1) requestAnimationFrame(push);
    else location.href = site.url;
  };
  requestAnimationFrame(push);
}

function tickHover() {
  if (state !== 'PRESENT' || dragging || IS_TOUCH) return;
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(screens, false);
  const face = hits.length ? hits[0].object : null;
  if (face !== hovered) {
    if (hovered) {
      hovered.userData.frame.material.emissiveIntensity = 0.7;
      hovered.userData.group.scale.setScalar(1);
      canvas.classList.remove('hovering');
      tip.hidden = true;
    }
    hovered = face;
    if (hovered) {
      hovered.userData.frame.material.emissiveIntensity = 2.2;
      hovered.userData.group.scale.setScalar(1.03);
      canvas.classList.add('hovering');
      const s = hovered.userData.site;
      tip.innerHTML = `${s.name}<small>${s.tag} · לחצו לכניסה</small>`;
      tip.hidden = false;
    }
  }
  if (hovered && !tip.hidden) {
    const wp = new THREE.Vector3();
    hovered.getWorldPosition(wp); wp.y += 0.9;
    wp.project(camera);
    tip.style.left = ((wp.x * 0.5 + 0.5) * innerWidth) + 'px';
    tip.style.top = ((-wp.y * 0.5 + 0.5) * innerHeight) + 'px';
  }
}

/* keyboard a11y — hidden focusable links */
function buildSrNav() {
  const nav = $('srNav');
  nav.innerHTML = SITES.map((s, i) => `<a href="${s.url}" data-i="${i}">${s.name} — ${s.tag}</a>`).join('');
}

/* ------------------------------------------------------------
   Movement + carousel input wiring
   ------------------------------------------------------------ */
const KEYMAP = { w: 'f', arrowup: 'f', s: 'b', arrowdown: 'b', a: 'l', arrowleft: 'l', d: 'r', arrowright: 'r' };
addEventListener('keydown', (e) => {
  if (state !== 'PRESENT') return;
  const k = e.key.toLowerCase();
  if (KEYMAP[k]) { keys[KEYMAP[k]] = true; e.preventDefault(); return; }
  if (k === 'q') cycleCentral(-1);
  else if (k === 'e') cycleCentral(1);
  else if (k === ' ' || k === 'enter') { e.preventDefault(); enterCentral(); }
});
addEventListener('keyup', (e) => { const k = e.key.toLowerCase(); if (KEYMAP[k]) keys[KEYMAP[k]] = false; });
addEventListener('blur', () => { keys.f = keys.b = keys.l = keys.r = false; });

// D-pad (touch): press-and-hold to move
document.querySelectorAll('.dpad__btn').forEach((btn) => {
  const dir = btn.dataset.dir;
  const on = (e) => { e.preventDefault(); keys[dir] = true; btn.classList.add('active'); try { btn.setPointerCapture(e.pointerId); } catch (_) {} };
  const off = () => { keys[dir] = false; btn.classList.remove('active'); };
  btn.addEventListener('pointerdown', on);
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointerleave', off);
  btn.addEventListener('pointercancel', off);
});

// central-screen carousel controls
$('scPrev').addEventListener('click', () => cycleCentral(-1));
$('scNext').addEventListener('click', () => cycleCentral(1));
$('scEnter').addEventListener('click', enterCentral);

/* ============================================================
   FRAME LOOP
   ============================================================ */
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpQ = new THREE.Quaternion();

function updateHostess(dt) {
  if (!hostess) return;
  idleT += dt;

  if (state === 'GREET') {
    // procedural idle: breathing + sway, facing camera
    hostess.position.y = PATH.getPoint(0).y + Math.sin(idleT * Math.PI * 1.0) * 0.008;
    hostess.rotation.y = Math.sin(idleT * 0.5) * 0.05;
    if (mixer) mixer.update(0); // keep pose
  }

  if (state === 'WALK') {
    walkT = Math.min((now() - walkStartMs) / 1000 / WALK_DURATION, 1);
    const ease = walkT < 0.05 ? walkT / 0.05 : 1;                    // gentle start
    const p = PATH.getPointAt(walkT);                                // arc-length → constant speed
    hostess.position.copy(p);
    // face along tangent
    const tan = PATH.getTangentAt(Math.min(walkT + 0.001, 1));
    const targetYaw = Math.atan2(tan.x, tan.z);                      // model faces +Z at rot 0
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, targetYaw, 0));
    hostess.quaternion.slerp(q, Math.min(1, dt * 6));
    if (mixer) mixer.update(dt * ease);
    if (walkT >= 1) { arrive(); }
  }

  if (state === 'PRESENT') {
    updateMovement(dt);
  }
}

/* ------------------------------------------------------------
   Character movement — keyboard (desktop) + D-pad (touch)
   ------------------------------------------------------------ */
const keys = { f: false, b: false, l: false, r: false };
let walking = false;
const UP = new THREE.Vector3(0, 1, 0);
const mvFwd = new THREE.Vector3(), mvRight = new THREE.Vector3(), mvVec = new THREE.Vector3();

// floor height by depth: interior platform level inside, ground on the plaza,
// with a short ramp over the entrance steps.
function floorY(z) {
  if (z <= 1.6) return INTERIOR_Y;
  if (z >= 3.8) return 0;
  return THREE.MathUtils.lerp(INTERIOR_Y, 0, (z - 1.6) / 2.2);
}
function setWalking(on) {
  if (on === walking || !walkAction) return;
  walking = on;
  walkAction.paused = !on;
  if (on) walkAction.timeScale = 1.35;
}

function updateMovement(dt) {
  // camera-relative basis on the ground plane
  camera.getWorldDirection(mvFwd); mvFwd.y = 0;
  if (mvFwd.lengthSq() < 1e-4) mvFwd.set(0, 0, -1);
  mvFwd.normalize();
  mvRight.crossVectors(mvFwd, UP).normalize();

  mvVec.set(0, 0, 0);
  if (keys.f) mvVec.add(mvFwd);
  if (keys.b) mvVec.sub(mvFwd);
  if (keys.r) mvVec.add(mvRight);
  if (keys.l) mvVec.sub(mvRight);

  const moving = mvVec.lengthSq() > 1e-4;
  if (moving) {
    mvVec.normalize();
    const speed = 2.7;
    let nx = hostess.position.x + mvVec.x * speed * dt;
    let nz = hostess.position.z + mvVec.z * speed * dt;
    // walkable bounds: full plaza depth outside, hall box inside (stay off the
    // back wall and out of the side walls)
    nx = THREE.MathUtils.clamp(nx, -7.2, 7.2);
    nz = THREE.MathUtils.clamp(nz, -13.6, 15.5);
    hostess.position.set(nx, floorY(nz), nz);
    // face travel direction
    tmpQ.setFromEuler(new THREE.Euler(0, Math.atan2(mvVec.x, mvVec.z), 0));
    hostess.quaternion.slerp(tmpQ, Math.min(1, dt * 9));
    setWalking(true);
    if (mixer) mixer.update(dt * 1.35);
  } else {
    setWalking(false);
    // gentle breathing + face the central screen a touch, alive
    hostess.position.y = floorY(hostess.position.z) + Math.sin(idleT * Math.PI) * 0.008;
    tmpQ.setFromEuler(new THREE.Euler(0, 0.32 + Math.sin(idleT * 0.4) * 0.05, 0));
    hostess.quaternion.slerp(tmpQ, Math.min(1, dt * 1.6));
    if (mixer) mixer.update(0);
    if (headBone) {
      tmpV.copy(camera.position);
      headBone.parent.worldToLocal(tmpV);
      const yaw = THREE.MathUtils.clamp(Math.atan2(tmpV.x, tmpV.z), -0.6, 0.6);
      headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, yaw * 0.5, dt * 3);
    }
  }
}

function updateCamera(dt) {
  if (state === 'GREET' || state === 'LOADING') {
    // slow breathing dolly on start framing
    const t = idleT * 0.25;
    camera.position.x = CAM_START.pos.x + Math.sin(t) * 0.35;
    camera.position.y = CAM_START.pos.y + Math.sin(t * 0.7) * 0.12;
    camTarget.lerp(CAM_START.look, 1);
  }

  if (state === 'WALK' && hostess) {
    // follow ~3.6m behind hostess along path, above shoulder
    const back = Math.max(walkT - (3.4 / PATH_LEN), 0);
    const bp = PATH.getPointAt(back);
    tmpV.set(bp.x, bp.y + 1.95, bp.z + 1.2);
    // near the end, blend to the FINAL vantage
    const endBlend = THREE.MathUtils.smoothstep(walkT, 0.82, 1);
    tmpV.lerp(FINAL.pos, endBlend);
    camera.position.lerp(tmpV, Math.min(1, dt * 3.2));

    tmpV2.copy(hostess.position); tmpV2.y += 1.5;
    tmpV2.lerp(FINAL.look, endBlend * 0.85);
    camTarget.lerp(tmpV2, Math.min(1, dt * 4));
  }

  if (state === 'PRESENT' && !navigating) {
    // third-person: the orbit target rides with the character so the camera
    // always follows her as she walks around the hall.
    if (hostess) {
      tmpV.set(hostess.position.x, hostess.position.y + 1.3, hostess.position.z);
      orbit.target.lerp(tmpV, Math.min(1, dt * 4));
    }
    const cp = new THREE.Vector3(
      orbit.target.x + Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * orbit.radius,
      orbit.target.y + Math.sin(orbit.pitch) * orbit.radius + 0.3,
      orbit.target.z + Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * orbit.radius
    );
    // hard safety cage: the camera can never dip below the floor, punch through
    // the roof, or slip behind the back wall into the black void.
    cp.x = THREE.MathUtils.clamp(cp.x, -12.5, 12.5);
    cp.z = THREE.MathUtils.clamp(cp.z, -15.6, 24);
    cp.y = THREE.MathUtils.clamp(cp.y, 0.9, 5.2);
    camera.position.lerp(cp, Math.min(1, dt * 5));
    camTarget.lerp(orbit.target, Math.min(1, dt * 5));
  }
  camera.lookAt(camTarget);
}

function updateChip() {
  if (chip.hidden || !hostess) return;
  tmpV.copy(hostess.position); tmpV.y += 2.05;
  tmpV.project(camera);
  if (tmpV.z > 1) { chip.style.opacity = 0; return; }
  chip.style.opacity = '';
  chip.style.left = ((tmpV.x * 0.5 + 0.5) * innerWidth) + 'px';
  chip.style.top = ((-tmpV.y * 0.5 + 0.5) * innerHeight) + 'px';
}

/* water shimmer */
let waterT = 0;

/* ------------------------------------------------------------
   Composer
   ------------------------------------------------------------ */
let composer = null, bloomPass = null;
function buildComposer() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (!LOW) {
    bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.32, 0.42, 0.9);
    composer.addPass(bloomPass);
  }
  composer.addPass(new OutputPass());
}
buildComposer();

function resize() {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h;
  // portrait phones: widen the lens so the whole hall + side screens fit
  camera.fov = (h > w) ? THREE.MathUtils.clamp(52 + (h / w - 1) * 26, 52, 74) : 52;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
}
addEventListener('resize', resize);
resize();

/* ------------------------------------------------------------
   RAF
   ------------------------------------------------------------ */
let running = true;
document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { clock.getDelta(); loop(); } });
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); location.reload(); });

function loop() {
  if (!running) return;
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);

  tickCountdown();
  updateHostess(dt);
  updateCamera(dt);
  updateChip();
  tickHover();
  tickSlideshow(dt);

  // subtle water sheen
  waterT += dt;
  M.water.roughness = 0.05 + Math.sin(waterT * 1.3) * 0.03;

  composer.render();
}
loop();
