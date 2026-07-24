/* ============================================================
   3D SHOWROOM LOBBY · WiseWheel Automate
   WebGL2 · three.js — black-marble pavilion, gold light, an
   animated hostess that walks you inside to every live project.
   ============================================================ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
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
  { id: 'cakes',     name: 'MAYA CAKES',     tag: 'קונדיטוריה · עוגות',   url: '../cake-landing/index.html', thumb: '../cake-landing/assets/images/hero-color-cake.png' },
  { id: 'kav',       name: 'KAV',            tag: 'תחבורה · חשמלי',      url: '../kav/index.html',       thumb: '../kav/assets/images/kav-hero.jpg' },
  { id: 'forma',     name: 'FORMA',          tag: 'מסחר · אריזות',       url: '../packaging-commerce/index.html', thumb: '../packaging-commerce/assets/images/hero-desktop.png' },
  { id: 'monarch',   name: 'MONARCH',        tag: 'תיירות · קזינו',      url: '../poker/index.html',     thumb: '../assets/thumbs/poker.jpg' },
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
const IS_TOUCH = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEVICE_MEMORY = navigator.deviceMemory || 8;
const CPU_CORES = navigator.hardwareConcurrency || 8;
const LOW = IS_TOUCH && (DEVICE_MEMORY <= 4 || CPU_CORES <= 4);
const DPR_CAP = IS_TOUCH ? 2.25 : 2;
function qualityDpr() {
  const nativeDpr = devicePixelRatio || 1;
  const pixelBudget = LOW ? 2400000 : 3600000;
  const budgetDpr = Math.sqrt(pixelBudget / Math.max(1, innerWidth * innerHeight));
  return Math.min(nativeDpr, DPR_CAP, Math.max(1.5, budgetDpr));
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(qualityDpr());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = LOW ? 0.92 : 0.88;
renderer.shadowMap.enabled = !LOW;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const MAX_ANISO = Math.min(16, renderer.capabilities.getMaxAnisotropy());

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0d1526, 34, 120);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 300);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

/* ------------------------------------------------------------
   Materials — marble · gold · glass
   ------------------------------------------------------------ */
function marbleTexture(base = '#777982', vein = 'rgba(235,236,242,.42)', size = 512) {
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
function tiledStoneTexture(size = 1024, tiles = 4) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'), rnd = seeded(74119);
  const tile = size / tiles;
  x.fillStyle = '#5e595c'; x.fillRect(0, 0, size, size);
  for (let row = 0; row < tiles; row++) {
    for (let col = 0; col < tiles; col++) {
      const x0 = col * tile, y0 = row * tile;
      const shade = 74 + Math.floor(rnd() * 22);
      const grad = x.createLinearGradient(x0, y0, x0 + tile, y0 + tile);
      grad.addColorStop(0, `rgb(${shade + 7},${shade + 3},${shade + 5})`);
      grad.addColorStop(1, `rgb(${shade - 5},${shade - 7},${shade - 4})`);
      x.fillStyle = grad; x.fillRect(x0 + 1, y0 + 1, tile - 2, tile - 2);
      x.save(); x.beginPath(); x.rect(x0 + 3, y0 + 3, tile - 6, tile - 6); x.clip();
      for (let v = 0; v < 5; v++) {
        x.strokeStyle = v % 3 === 0 ? 'rgba(224,218,212,.28)' : 'rgba(33,30,34,.24)';
        x.lineWidth = 0.8 + rnd() * 1.25;
        x.beginPath();
        let px = x0 - tile * 0.2 + rnd() * tile * 1.4;
        let py = y0 + rnd() * tile;
        x.moveTo(px, py);
        for (let k = 0; k < 7; k++) {
          px += tile * (0.08 + rnd() * 0.12);
          py += (rnd() - 0.5) * tile * 0.18;
          x.lineTo(px, py);
        }
        x.stroke();
      }
      x.restore();
    }
  }
  x.strokeStyle = 'rgba(17,16,19,.7)'; x.lineWidth = 3;
  for (let i = 0; i <= tiles; i++) {
    const p = i * tile;
    x.beginPath(); x.moveTo(p, 0); x.lineTo(p, size); x.stroke();
    x.beginPath(); x.moveTo(0, p); x.lineTo(size, p); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function repeatedTexture(source, rx, ry) {
  const t = source.clone();
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = MAX_ANISO;
  t.needsUpdate = true;
  return t;
}
const marbleMap = marbleTexture();
marbleMap.anisotropy = MAX_ANISO;
const stoneTiles = tiledStoneTexture();
const plazaMap = repeatedTexture(stoneTiles, 5, 5);
const pathMap = repeatedTexture(stoneTiles, 1, 3);
const hallFloorMap = repeatedTexture(stoneTiles, 1.5, 1.25);
const stepMap = repeatedTexture(stoneTiles, 1, 0.5);
const stageMap = marbleTexture('#686163', 'rgba(210,146,76,.58)', 768);
stageMap.repeat.set(2.4, 2.4);
stageMap.anisotropy = MAX_ANISO;
const M = {
  marble: new THREE.MeshPhysicalMaterial({ map: marbleMap, color: 0x55535b, roughness: 0.27, metalness: 0.12, clearcoat: 0.28, clearcoatRoughness: 0.22, envMapIntensity: 0.8 }),
  marbleDark: new THREE.MeshPhysicalMaterial({ map: marbleMap, color: 0x24252b, roughness: 0.34, metalness: 0.16, clearcoat: 0.2, envMapIntensity: 0.7 }),
  floorOut: new THREE.MeshPhysicalMaterial({ map: plazaMap, color: 0xaaa3a6, roughness: 0.31, metalness: 0.1, clearcoat: 0.46, clearcoatRoughness: 0.23, envMapIntensity: 0.82 }),
  floorIn: new THREE.MeshPhysicalMaterial({ map: hallFloorMap, color: 0xb2aaac, roughness: 0.27, metalness: 0.11, clearcoat: 0.56, clearcoatRoughness: 0.19, envMapIntensity: 0.92 }),
  path: new THREE.MeshPhysicalMaterial({ map: pathMap, color: 0xd0c9c9, roughness: 0.29, metalness: 0.11, clearcoat: 0.44, clearcoatRoughness: 0.2, envMapIntensity: 0.86 }),
  step: new THREE.MeshPhysicalMaterial({ map: stepMap, color: 0x918a8d, roughness: 0.31, metalness: 0.08, clearcoat: 0.38, clearcoatRoughness: 0.25, envMapIntensity: 0.78 }),
  stage: new THREE.MeshPhysicalMaterial({ map: stageMap, color: 0x4b4649, roughness: 0.16, metalness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.1, envMapIntensity: 1.2 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xa9c0d5, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.11, transmission: 0, depthWrite: false, envMapIntensity: 0.82, side: THREE.DoubleSide }),
  fabric: new THREE.MeshStandardMaterial({ color: 0x38343a, roughness: 0.82, metalness: 0 }),
  fabric2: new THREE.MeshStandardMaterial({ color: 0x4b4034, roughness: 0.76, metalness: 0.03 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x315c31, roughness: 0.84, flatShading: false, envMapIntensity: 0.28 }),
  leafLit: new THREE.MeshStandardMaterial({ color: 0x557b35, roughness: 0.8, flatShading: false, emissive: 0x16280d, emissiveIntensity: 0.18, envMapIntensity: 0.32 }),
  rock: new THREE.MeshStandardMaterial({ color: 0x555861, roughness: 0.92, flatShading: false, envMapIntensity: 0.3 }),
  water: new THREE.MeshPhysicalMaterial({ color: 0x102b42, emissive: 0x061725, emissiveIntensity: 0.32, roughness: 0.08, metalness: 0.18, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.4, transparent: true, opacity: 0.94 }),
};
M.gold = new THREE.MeshStandardMaterial({ color: 0xa9652d, emissive: 0xff9f45, emissiveIntensity: LOW ? 0.95 : 0.72, roughness: 0.3, metalness: 0.28 });
const goldStripMat = M.gold;
const warmGlowMat = new THREE.MeshStandardMaterial({ color: 0xffc778, emissive: 0xffa846, emissiveIntensity: LOW ? 0.95 : 0.78, roughness: 0.42 });
const barkMat = new THREE.MeshStandardMaterial({ color: 0x3d2a1c, roughness: 0.96, metalness: 0 });
const treeLeafMat = new THREE.MeshStandardMaterial({
  color: 0xffffff, vertexColors: true, roughness: 0.8,
  emissive: 0x183414, emissiveIntensity: 0.48, envMapIntensity: 0.34
});
let waterShader = null;
M.water.onBeforeCompile = (shader) => {
  shader.uniforms.uWaterTime = { value: 0 };
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uWaterTime;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      float waveA = sin(position.x * 2.15 + uWaterTime * 1.15);
      float waveB = sin(position.y * 2.85 - uWaterTime * .82);
      transformed.z += (waveA + waveB) * .014;`);
  waterShader = shader;
};

const animatedTrees = [];
function seeded(seed) {
  let n = seed >>> 0;
  return () => {
    n += 0x6D2B79F5;
    let t = n;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function matrixBetween(a, b, radius, target) {
  const dir = b.clone().sub(a), len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  target.compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(radius, len, radius));
}
function makeTree(x, z, scale, seed) {
  const rnd = seeded(seed);
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);

  const segments = [];
  const tips = [];
  const trunkTop = new THREE.Vector3(0, 3.5 * scale, 0);
  segments.push([new THREE.Vector3(0, 0, 0), trunkTop, 0.19 * scale]);
  const branchCount = LOW ? 11 : 17;
  for (let i = 0; i < branchCount; i++) {
    const angle = (i / branchCount) * Math.PI * 2 + rnd() * 0.7;
    const sy = (1.35 + rnd() * 2.0) * scale;
    const reach = (0.72 + rnd() * 1.1) * scale;
    const start = new THREE.Vector3((rnd() - 0.5) * 0.13, sy, (rnd() - 0.5) * 0.13);
    const end = new THREE.Vector3(Math.cos(angle) * reach, sy + (0.42 + rnd() * 0.9) * scale, Math.sin(angle) * reach);
    segments.push([start, end, (0.032 + rnd() * 0.027) * scale]);
    const twig = end.clone().add(new THREE.Vector3(
      Math.cos(angle + (rnd() - 0.5)) * 0.5 * scale,
      (0.35 + rnd() * 0.45) * scale,
      Math.sin(angle + (rnd() - 0.5)) * 0.5 * scale
    ));
    segments.push([end, twig, (0.018 + rnd() * 0.018) * scale]);
    tips.push(end, twig);
  }

  const branchGeo = new THREE.CylinderGeometry(0.72, 1, 1, LOW ? 6 : 9, 1);
  const branches = new THREE.InstancedMesh(branchGeo, barkMat, segments.length);
  const matrix = new THREE.Matrix4();
  segments.forEach((s, i) => { matrixBetween(s[0], s[1], s[2], matrix); branches.setMatrixAt(i, matrix); });
  branches.castShadow = !LOW; branches.receiveShadow = true; tree.add(branches);

  const leafCount = LOW ? 52 : 90;
  const leafGeo = new THREE.SphereGeometry(0.16, LOW ? 5 : 7, LOW ? 3 : 5);
  const leaves = new THREE.InstancedMesh(leafGeo, treeLeafMat, leafCount);
  const q = new THREE.Quaternion();
  for (let i = 0; i < leafCount; i++) {
    const tip = tips[i % tips.length];
    const p = tip.clone().add(new THREE.Vector3((rnd() - 0.5) * 0.8, (rnd() - 0.35) * 0.75, (rnd() - 0.5) * 0.8).multiplyScalar(scale));
    const s = (0.62 + rnd() * 0.62) * scale;
    q.setFromEuler(new THREE.Euler(rnd(), rnd() * Math.PI, rnd()));
    matrix.compose(p, q, new THREE.Vector3(s * (1.1 + rnd() * 0.55), s * (0.45 + rnd() * 0.28), s * (0.8 + rnd() * 0.45)));
    leaves.setMatrixAt(i, matrix);
    leaves.setColorAt(i, new THREE.Color().setHSL(0.25 + rnd() * 0.05, 0.4 + rnd() * 0.18, 0.24 + rnd() * 0.16));
  }
  leaves.instanceMatrix.needsUpdate = true;
  if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  leaves.castShadow = !LOW; tree.add(leaves);

  world.add(tree);
  animatedTrees.push({ group: tree, phase: rnd() * Math.PI * 2, amount: 0.0035 + rnd() * 0.003 });
  return tree;
}

/* ------------------------------------------------------------
   Sky dome + stars
   ------------------------------------------------------------ */
{
  const skyGeo = new THREE.SphereGeometry(180, 24, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x102748) }, mid: { value: new THREE.Color(0x294b75) }, low: { value: new THREE.Color(0x566d8f) } },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 low;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
      }
      void main(){
        vec3 n = normalize(vP); float h = n.y;
        vec3 c = mix(mid, top, smoothstep(0.06, 0.6, h));
        c = mix(low, c, smoothstep(-0.04, 0.14, h));
        float cloud = noise(n.xz*4.5+n.y*2.0)*.65 + noise(n.xz*9.0-n.y)*.35;
        float mask = smoothstep(.54,.82,cloud) * smoothstep(-.02,.72,h);
        c = mix(c, vec3(.48,.58,.72), mask*.5);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  const starGeo = new THREE.BufferGeometry();
  const pts = [];
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2, e = 0.18 + Math.random() * 0.75, r = 160;
    pts.push(r * Math.cos(e) * Math.cos(a), r * Math.sin(e), r * Math.cos(e) * Math.sin(a));
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xd6e3ff, size: 0.32, sizeAttenuation: true, transparent: true, opacity: 0.32, fog: false })));
}

/* ------------------------------------------------------------
   Lights (emissive-led look — few real lights, no shadows)
   ------------------------------------------------------------ */
scene.add(new THREE.HemisphereLight(0x6587b5, 0x19141a, 0.88));
scene.add(new THREE.AmbientLight(0xffead4, 0.42));
const moon = new THREE.DirectionalLight(0xadc6ef, 1.15);
moon.position.set(-24, 34, 25); moon.castShadow = !LOW;
moon.shadow.mapSize.set(1024,1024); scene.add(moon);
const hallLight = new THREE.PointLight(0xffc47c, 12, 36, 1.8); hallLight.position.set(0, 4.2, -7); scene.add(hallLight);
const doorLight = new THREE.PointLight(0xffb768, 7, 19, 1.9); doorLight.position.set(0, 3.0, 2.8); scene.add(doorLight);
const pathLight = new THREE.PointLight(0xffb05d, 0.85, 18, 2); pathLight.position.set(0, 1.2, 12); scene.add(pathLight);

/* ------------------------------------------------------------
   Geometry helpers
   ------------------------------------------------------------ */
const world = new THREE.Group(); scene.add(world);
function box(w, h, d, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = !LOW; m.receiveShadow = true;
  world.add(m); return m;
}

/* ============================================================
   EXTERIOR — plaza, light-lines, pools, greenery, glow cubes
   ============================================================ */
{
  // plaza floor
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), M.floorOut);
  plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0, 12);
  world.add(plaza);

  // A single processional path. The reference is luxurious because the
  // composition is quiet: polished black stone, water and two fine light rails.
  box(6.2, 0.045, 31, M.path, 0, 0.018, 16.3);
  for (const sx of [-3.15, 3.15]) box(0.075, 0.035, 31, goldStripMat, sx, 0.04, 16.3);
  // entrance steps
  for (let i = 0; i < 3; i++) {
    box(10.5 - i * 0.7, 0.15, 1.15 - i * 0.12, M.step, 0, 0.075 + i * 0.15, 3.4 - i * 0.55);
    box(10.4 - i * 0.7, 0.028, 0.05, goldStripMat, 0, 0.16 + i * 0.15, 3.95 - i * 0.55);
  }

  // water pools with rocks + bushes
  for (const sx of [-1, 1]) {
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(11, 13, LOW ? 12 : 28, LOW ? 14 : 32), M.water);
    pool.rotation.x = -Math.PI / 2; pool.position.set(sx * 8.6, 0.02, 12.5);
    world.add(pool);
    box(0.12, 0.1, 13.2, M.marbleDark, sx * 3.05, 0.05, 12.5);
    for (let i = 0; i < 5; i++) {
      const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.5, 1), M.rock);
      r.position.set(sx * (5.5 + Math.random() * 5), 0.2, 7.5 + Math.random() * 10);
      r.scale.set(1.25 + Math.random() * 0.5, 0.7 + Math.random() * 0.45, 0.9 + Math.random() * 0.4);
      r.rotation.set(Math.random() * 3, Math.random() * 3, 0); r.castShadow = !LOW; world.add(r);
    }
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4 + Math.random() * 0.45, LOW ? 1 : 2), Math.random() > 0.5 ? M.leafLit : M.leaf);
      b.scale.y = 0.75;
      b.position.set(sx * (4.4 + Math.random() * 7), 0.3, 5.8 + Math.random() * 13);
      world.add(b);
    }
    for (const [ti, tz, tx, ts] of [[0, 6, 11.4, 0.9], [1, 16.8, 11.8, 1.08], [2, 22, 13.2, 1.18]]) {
      makeTree(sx * tx, tz, ts, 1200 + (sx > 0 ? 100 : 0) + ti * 17);
      const uplight = new THREE.PointLight(0xffa653, 48, 8.5, 2);
      uplight.position.set(sx * (tx - 0.7), 0.55, tz + 0.5); world.add(uplight);
    }
    // glow cube lamps
    for (const gz of [6.5, 11, 15.5, 20]) box(0.22, 0.22, 0.22, warmGlowMat, sx * 3.6, 0.12, gz);
  }

  // Fine ornamental grasses catch the uplights around the pool islands.
  const grassRnd = seeded(8842);
  const grassCount = LOW ? 64 : 120;
  const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.045, 0.5, 6), M.leafLit, grassCount);
  const gm = new THREE.Matrix4(), gq = new THREE.Quaternion();
  for (let i = 0; i < grassCount; i++) {
    const side = i % 2 ? -1 : 1;
    const p = new THREE.Vector3(side * (11.2 + grassRnd() * 2.6), 0.22, 5 + grassRnd() * 19);
    const s = 0.55 + grassRnd() * 0.9;
    gq.setFromEuler(new THREE.Euler((grassRnd() - 0.5) * 0.18, grassRnd() * Math.PI, (grassRnd() - 0.5) * 0.18));
    gm.compose(p, gq, new THREE.Vector3(s, s, s));
    grass.setMatrixAt(i, gm);
  }
  grass.instanceMatrix.needsUpdate = true; grass.castShadow = !LOW; world.add(grass);
}

/* ============================================================
   PAVILION — shell, glass, roof LED, interior hall
   ============================================================ */
const INTERIOR_Y = 0.45;          // interior floor height (top of steps)
const HALL = new THREE.Vector3(0, INTERIOR_Y, -7.4);  // hall centre
const STAGE_RADIUS = 4.58;
const STAGE_Y = INTERIOR_Y + 0.145;
const FIRE_APPROACH = new THREE.Vector3(6.35, INTERIOR_Y, -13.25);
const fireFx = {
  photoFlames: [], smoke: [], embers: [], light: null, time: 0,
  strength: 1, transitionFrom: 1, transitionTo: 1, transitionStart: 0,
};
let fireOn = true;
const fireSourceTexture = new THREE.TextureLoader().load('assets/fire-source-premium.png');
fireSourceTexture.colorSpace = THREE.SRGBColorSpace;
fireSourceTexture.anisotropy = MAX_ANISO;
fireSourceTexture.minFilter = THREE.LinearMipmapLinearFilter;
fireSourceTexture.magFilter = THREE.LinearFilter;
fireSourceTexture.wrapS = fireSourceTexture.wrapT = THREE.ClampToEdgeWrapping;

function photographicFireMaterial(seed = 1.7) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: fireSourceTexture },
      uTime: { value: 0 },
      uStrength: { value: 1 },
      uSeed: { value: seed },
    },
    vertexShader: `varying vec2 vUv;
      uniform float uTime; uniform float uSeed;
      void main(){
        vUv=uv;
        vec3 p=position;
        float lift=smoothstep(.06,1.,uv.y);
        float broad=sin(uv.y*7.2+uTime*3.15+uSeed)*.052;
        float counter=sin(uv.y*13.6-uTime*2.35+uSeed*1.4)*.024;
        float fine=sin(uv.y*25.0+uTime*5.1+uSeed*2.1)*.011;
        p.x+=(broad+counter+fine)*lift;
        p.y+=sin(uv.x*8.0+uTime*4.2+uSeed)*.024*lift;
        p.y+=sin(uTime*3.35+uSeed+uv.y*4.0)*.016*lift;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }`,
    fragmentShader: `varying vec2 vUv;
      uniform sampler2D uMap; uniform float uTime; uniform float uStrength; uniform float uSeed;
      float hash(vec2 p){
        return fract(sin(dot(p,vec2(127.1,311.7))+uSeed)*43758.5453123);
      }
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p);
        f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
                   mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
      }
      float fbm(vec2 p){
        float value=0.,amp=.5;
        for(int i=0;i<4;i++){ value+=amp*noise(p);p=p*2.03+vec2(7.1,11.7);amp*=.5; }
        return value;
      }
      void main(){
        vec2 uv=vUv;
        float rise=uTime*.82;
        float heat=fbm(vec2(uv.x*4.2+uSeed,uv.y*5.0-rise));
        float detail=fbm(vec2(uv.x*9.5-uSeed,uv.y*10.5-rise*1.72));
        float upper=smoothstep(.08,1.,uv.y);
        float pulse=sin(uTime*3.45+uSeed)*.5+.5;
        uv.x+=(heat-.5)*.105*upper;
        uv.x+=sin(uv.y*10.0+uTime*3.6+uSeed)*.034*upper;
        uv.x+=sin(uv.y*22.0-uTime*5.0+uSeed)*.012*upper;
        uv.y+=(detail-.5)*.032*upper;
        uv.y+=sin(uv.x*9.0+uTime*4.1+uSeed)*.013*upper;
        uv.y+=(pulse-.5)*.022*upper;
        if(uv.x<.002||uv.x>.998||uv.y<.002||uv.y>.998) discard;
        vec3 col=texture2D(uMap,uv).rgb;
        float energy=max(col.r,max(col.g,col.b));
        float flicker=.92+sin(uTime*13.1+uSeed)*.045+sin(uTime*7.7+uv.y*5.)*.032;
        col*=flicker*(.93+heat*.16);
        float alpha=smoothstep(.012,.21,energy)*uStrength;
        alpha*=smoothstep(.012,.055,energy);
        if(alpha<.008) discard;
        gl_FragColor=vec4(col,alpha);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    toneMapped: false,
  });
}

function smokeMaterial(seed) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uStrength: { value: 1 }, uSeed: { value: seed } },
    vertexShader: `varying vec2 vUv;
      void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uStrength; uniform float uSeed;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(41.7,289.1))+uSeed)*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
      void main(){
        vec2 p=vUv; float n=noise(vec2(p.x*3.2+sin(uTime*.3),p.y*4.-uTime*.38));
        float body=smoothstep(.48,.68,n+(.5-abs(p.x-.5))*.46);
        float fade=smoothstep(0.,.22,p.y)*(1.-smoothstep(.72,1.,p.y));
        float a=body*fade*.13*uStrength;
        if(a<.008) discard;
        gl_FragColor=vec4(vec3(.22,.2,.2),a);
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.NormalBlending, toneMapped: false,
  });
}

function emberTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(16, 16, 1, 16, 16, 15);
  g.addColorStop(0, '#fff7c4'); g.addColorStop(.22, '#ffb02d');
  g.addColorStop(.55, 'rgba(255,70,8,.7)'); g.addColorStop(1, 'rgba(255,30,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function buildFireplace(zB) {
  const x = 6.45, front = zB + 0.5;
  box(2.5, 3.45, 0.34, M.marbleDark, x, 2.18, zB + 0.25);
  box(1.62, 1.28, 0.12, new THREE.MeshStandardMaterial({ color: 0x070606, roughness: 0.95 }), x, 1.37, front);
  box(2.72, 0.14, 0.5, M.marble, x, 3.76, front);
  box(1.84, 0.06, 0.1, goldStripMat, x, 2.04, front + 0.08);
  for (const sx of [-0.88, 0.88]) box(0.11, 1.7, 0.1, goldStripMat, x + sx, 1.3, front + 0.08);

  const logMat = new THREE.MeshStandardMaterial({
    color: 0x17100d, emissive: 0x3b0d04, emissiveIntensity: 0.16,
    roughness: 0.98, metalness: 0,
  });
  const logEndMat = new THREE.MeshStandardMaterial({
    color: 0x63301b, emissive: 0x2d0903, emissiveIntensity: 0.12,
    roughness: 1, metalness: 0,
  });
  for (let i = 0; i < 3; i++) {
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.12, 1.05, 18),
      [logMat, logEndMat, logEndMat]
    );
    log.position.set(x + (i - 1) * 0.17, 0.86 + (i % 2) * 0.08, front + 0.2);
    log.rotation.z = Math.PI / 2 + (i - 1) * 0.18; log.rotation.y = 0.2 * i; world.add(log);
  }

  // One high-resolution photographic source is deformed continuously on the
  // GPU. The subdivided plane lets the vertex stage sway the silhouette while
  // the fragment stage adds independent heat-turbulence within the flame.
  const photoFlame = new THREE.Mesh(
    new THREE.PlaneGeometry(1.82, 1.62, 28, 38),
    photographicFireMaterial()
  );
  photoFlame.position.set(x, 1.40, front + 0.13);
  photoFlame.userData.fireBase = {
    x,
    y: 1.40,
    phase: 2.17,
  };
  photoFlame.renderOrder = 9;
  world.add(photoFlame);
  fireFx.photoFlames.push(photoFlame);

  // A single instanced coal bed adds granular red heat below the logs without
  // spending one draw call per ember.
  const coalMat = new THREE.MeshStandardMaterial({
    color: 0x2a0804, emissive: 0xff2b08, emissiveIntensity: 1.7,
    roughness: 0.92, metalness: 0,
  });
  const coalCount = LOW ? 12 : 22;
  const coals = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.045, 0), coalMat, coalCount);
  const coalRnd = seeded(6118), coalMatrix = new THREE.Matrix4();
  for (let i = 0; i < coalCount; i++) {
    const p = new THREE.Vector3(
      x + (coalRnd() - 0.5) * 1.15,
      0.79 + coalRnd() * 0.09,
      front + 0.15 + coalRnd() * 0.12
    );
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(coalRnd() * 2, coalRnd() * 3, coalRnd()));
    const s = 0.65 + coalRnd() * 0.7;
    coalMatrix.compose(p, q, new THREE.Vector3(s * 1.4, s * 0.55, s));
    coals.setMatrixAt(i, coalMatrix);
  }
  coals.instanceMatrix.needsUpdate = true;
  world.add(coals);
  for (let i = 0; i < 2; i++) {
    const mat = smokeMaterial(3.2 + i * 4.7);
    const smoke = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.45), mat);
    smoke.position.set(x + (i ? 0.12 : -0.12), 2.05, front + 0.2 + i * 0.012);
    smoke.renderOrder = 7; world.add(smoke); fireFx.smoke.push(smoke);
  }
  const tex = emberTexture();
  for (let i = 0; i < (LOW ? 6 : 12); i++) {
    const ember = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xffb24a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    ember.userData = { phase: i / 12, speed: 0.32 + (i % 5) * 0.07, lane: ((i * 7) % 11) / 10 - 0.5 };
    world.add(ember); fireFx.embers.push(ember);
  }
  fireFx.origin = new THREE.Vector3(x, 0.91, front + 0.24);
  fireFx.light = new THREE.PointLight(0xff6c24, 15, 9, 2);
  fireFx.light.position.set(x, 1.35, zB + 2.0); world.add(fireFx.light);
}

{
  const W = 23, D = 19, H = 5.6;  // footprint
  const zF = 2.2, zB = zF - D;    // front/back wall z

  // interior floor
  const fl = new THREE.Mesh(new THREE.CylinderGeometry(10.4, 10.4, 0.1, 48), M.floorIn);
  fl.position.set(HALL.x, INTERIOR_Y - 0.05, HALL.z); world.add(fl);
  box(W, 0.1, D, M.floorIn, 0, INTERIOR_Y - 0.051, zF - D / 2);

  // Roof slab + four fine fascia rails. A full emissive plane was the source
  // of the blown-out roof in the first QA pass.
  box(W + 2.4, 0.5, D + 2.4, M.marbleDark, 0, H + 0.25, zF - D / 2);
  box(W + 2.45, 0.055, 0.06, goldStripMat, 0, H, zF + 1.18);
  box(W + 2.45, 0.055, 0.06, goldStripMat, 0, H, zB - 1.18);
  box(0.06, 0.055, D + 2.4, goldStripMat, -W / 2 - 1.18, H, zF - D / 2);
  box(0.06, 0.055, D + 2.4, goldStripMat, W / 2 + 1.18, H, zF - D / 2);
  // pitched block (silhouette, back-left like reference)
  const pitched = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 5.4, 2.6, 4, 1), M.marbleDark);
  pitched.rotation.y = Math.PI / 4; pitched.position.set(-5.5, H + 1.8, -8); world.add(pitched);

  // corner + door columns
  for (const [cx, cz] of [[-W / 2, zF], [W / 2, zF], [-W / 2, zB], [W / 2, zB], [-2.9, zF], [2.9, zF]]) {
    box(0.8, H, 0.8, M.marble, cx, H / 2, cz);
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
  // Illuminated display niches flank the hero wall, echoing the reference
  // shelving and adding depth without competing with the main screen.
  for (const sx of [-1]) {
    box(2.05, 3.65, 0.12, M.marbleDark, sx * 6.45, 2.45, zB + 0.24);
    box(0.035, 3.45, 0.06, goldStripMat, sx * 7.38, 2.45, zB + 0.34);
    box(0.035, 3.45, 0.06, goldStripMat, sx * 5.52, 2.45, zB + 0.34);
    for (const sy of [1.25, 2.25, 3.25]) {
      box(1.85, 0.025, 0.16, goldStripMat, sx * 6.45, sy, zB + 0.35);
      const decor = new THREE.Mesh(
        sy === 2.25 ? new THREE.SphereGeometry(0.16, 16, 12) : new THREE.CylinderGeometry(0.09, 0.14, 0.38, 14),
        sy === 3.25 ? M.fabric2 : M.gold
      );
      decor.position.set(sx * 6.45 + (sy === 2.25 ? 0.3 : -0.28), sy + 0.2, zB + 0.5);
      world.add(decor);
    }
  }
  buildFireplace(zB);
  // side interior wall segments (hold side screens)
  for (const sx of [-1, 1]) {
    box(0.3, H, 9.5, M.marble, sx * 8.6, H / 2, -9);
  }

  // ceiling disc + 3 concentric gold rings (signature, reference 3D2)
  const ceil = new THREE.Mesh(new THREE.CylinderGeometry(9.8, 9.8, 0.12, 48), M.marbleDark);
  ceil.position.set(HALL.x, H - 0.1, HALL.z); world.add(ceil);
  for (const [r, y] of [[1.7, H - 0.56], [3.0, H - 0.36], [4.35, H - 0.18]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.038, 10, 96), goldStripMat);
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
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.9, 0.14, 64), M.stage);
  plat.position.set(HALL.x, INTERIOR_Y + 0.07, HALL.z); world.add(plat);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(4.86, 0.035, 10, 96), goldStripMat);
  rim.rotation.x = Math.PI / 2; rim.position.set(HALL.x, INTERIOR_Y + 0.05, HALL.z); world.add(rim);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(STAGE_RADIUS, 64), M.stage);
  rug.rotation.x = -Math.PI / 2; rug.position.set(HALL.x, STAGE_Y, HALL.z); world.add(rug);

  // sofas around the platform
  const sofa = (x, z, ry, width = 2.05) => {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new RoundedBoxGeometry(width, 0.3, 0.82, LOW ? 2 : 4, 0.1), M.fabric);
    seat.position.y = 0.4;
    const base = new THREE.Mesh(new RoundedBoxGeometry(width + 0.08, 0.13, 0.76, 2, 0.045), M.marbleDark);
    base.position.y = 0.22;
    const back = new THREE.Mesh(new RoundedBoxGeometry(width, 0.56, 0.18, LOW ? 2 : 4, 0.075), M.fabric);
    back.position.set(0, 0.77, -0.35); back.rotation.x = -0.1;
    const armL = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.46, 0.84, 3, 0.075), M.fabric);
    armL.position.set(-width / 2 + 0.08, 0.52, 0);
    const armR = armL.clone(); armR.position.x = width / 2 - 0.08;
    const cushionCount = width < 1.7 ? 1 : 3;
    const cushions = [];
    for (let i = 0; i < cushionCount; i++) {
      const cushion = new THREE.Mesh(new RoundedBoxGeometry(width / cushionCount - 0.13, 0.38, 0.12, 3, 0.055), i === cushionCount - 1 ? M.fabric2 : M.fabric);
      cushion.position.set((i - (cushionCount - 1) / 2) * (width / cushionCount - 0.02), 0.75, -0.22);
      cushion.rotation.x = -0.11; cushions.push(cushion);
    }
    const legGeo = new THREE.CylinderGeometry(0.026, 0.038, 0.22, 10);
    for (const lx of [-width * 0.38, width * 0.38]) for (const lz of [-0.25, 0.25]) {
      const leg = new THREE.Mesh(legGeo, M.gold); leg.position.set(lx, 0.1, lz); leg.rotation.z = lx < 0 ? -0.08 : 0.08; g.add(leg);
    }
    g.add(base, seat, back, armL, armR, ...cushions);
    g.traverse(o => { if (o.isMesh) { o.castShadow = !LOW; o.receiveShadow = true; } });
    g.position.set(x, INTERIOR_Y, z); g.rotation.y = ry; world.add(g);
  };
  sofa(HALL.x - 5.65, HALL.z + 1.5, Math.PI / 2.3, 1.55);
  sofa(HALL.x + 5.65, HALL.z + 1.5, -Math.PI / 2.3, 1.55);
  sofa(HALL.x - 5.35, HALL.z - 3.5, Math.PI / 3.3);
  sofa(HALL.x + 5.35, HALL.z - 3.5, -Math.PI / 3.3);
  sofa(HALL.x - 2.6, HALL.z + 5.25, Math.PI * 0.92, 2.35);
  sofa(HALL.x + 2.6, HALL.z + 5.25, -Math.PI * 0.92, 2.35);

  // Low sculptural coffee tables add the missing middle layer from the
  // reference lounge, with bronze feet and matte stone tops.
  for (const [tx, tz, tr] of [[-4.35, -4.8, 0.58], [4.35, -4.8, 0.58], [0, -5.85, 0.76]]) {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, 0.09, 32), M.marbleDark);
    top.position.set(tx, INTERIOR_Y + 0.48, tz); top.castShadow = !LOW; world.add(top);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 0.42, 16), M.gold);
    stem.position.set(tx, INTERIOR_Y + 0.23, tz); world.add(stem);
  }

  // thin warm cove strip low on the side walls (subtle wash, never blown out)
  for (const sx of [-1, 1]) {
    const cove = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 8.4), new THREE.MeshStandardMaterial({ color: 0xffca8a, emissive: 0xffb45c, emissiveIntensity: LOW ? 1.1 : 0.7, roughness: 0.6 }));
    cove.position.set(sx * 8.42, 0.7, -8); world.add(cove);
  }
}

/* ============================================================
   KIOSK + COMPLETE PROJECT WALLS
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

function makeScreen(site, w, h, pos, ry, showCaption = true) {
  const g = new THREE.Group();
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.22, h + 0.22, 0.11), M.marbleDark);
  back.position.z = -0.07; g.add(back);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xd9aa65, emissive: 0xb86a20, emissiveIntensity: 0.48, roughness: 0.32, metalness: 0.75 });
  const rails = [
    new THREE.Mesh(new THREE.BoxGeometry(w + 0.17, 0.045, 0.045), frameMat),
    new THREE.Mesh(new THREE.BoxGeometry(w + 0.17, 0.045, 0.045), frameMat),
    new THREE.Mesh(new THREE.BoxGeometry(0.045, h + 0.17, 0.045), frameMat),
    new THREE.Mesh(new THREE.BoxGeometry(0.045, h + 0.17, 0.045), frameMat),
  ];
  rails[0].position.set(0, h / 2 + 0.08, 0);
  rails[1].position.set(0, -h / 2 - 0.08, 0);
  rails[2].position.set(-w / 2 - 0.08, 0, 0);
  rails[3].position.set(w / 2 + 0.08, 0, 0);
  rails.forEach(r => g.add(r));
  const frame = rails[0];
  // screen face
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: thumbTex[site.id], toneMapped: false })
  );
  g.add(face);
  if (showCaption) {
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(w, h * 0.18), new THREE.MeshBasicMaterial({ map: captionTexture(site.name, site.tag), toneMapped: false, transparent: true }));
    cap.position.set(0, -(h / 2) - h * 0.11 - 0.12, 0.001); g.add(cap);
  }

  g.position.copy(pos); g.rotation.y = ry;
  world.add(g);
  face.userData = { site, frame, group: g, baseScale: 1 };
  screens.push(face);
  return g;
}

let centralFace = null, centralIndex = 3; // start on champagne — elegant
function buildScreens() {
  // hero central screen on back wall — a rotating slideshow of all sites
  makeScreen(SITES[centralIndex], 7.25, 4.05, new THREE.Vector3(0, 3.0, -16.55), 0, false);
  centralFace = screens[screens.length - 1];
  centralFace.userData.isCentral = true;

  // Every project receives a permanent physical screen. The calculation is
  // data-driven so adding another SITES entry never silently drops a brand.
  const wallCount = Math.ceil(SITES.length / 2);
  const zFront = -2.65, zBack = -14.2;
  for (let i = 0; i < wallCount; i++) {
    const z = wallCount === 1
      ? (zFront + zBack) * 0.5
      : THREE.MathUtils.lerp(zFront, zBack, i / (wallCount - 1));
    makeScreen(SITES[i], 2.55, 1.44, new THREE.Vector3(8.32, 2.55, z), -Math.PI / 2);
    const opposite = SITES[i + wallCount];
    if (opposite) makeScreen(opposite, 2.55, 1.44, new THREE.Vector3(-8.32, 2.55, z), Math.PI / 2);
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
  kio.position.set(HALL.x, INTERIOR_Y + 0.15, HALL.z + 0.4); kio.rotation.y = Math.PI * 0.02;
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
  new THREE.Vector3(-2.15, 0, 14.4),
  new THREE.Vector3(-1.1, 0, 9.5),
  new THREE.Vector3(0, 0, 5.2),
  new THREE.Vector3(0, INTERIOR_Y, 1.4),
  new THREE.Vector3(0, INTERIOR_Y, -3.4),
  new THREE.Vector3(-0.8, INTERIOR_Y, -1.9),
  new THREE.Vector3(-1.25, INTERIOR_Y, 0.15),
], false, 'catmullrom', 0.12);
const HOME = new THREE.Vector3(-1.25, INTERIOR_Y, 0.15);
const PATH_LEN = PATH.getLength();
const WALK_DURATION = 8.5;                    // fixed, predictable walk-in (s)
const WALK_SPEED = PATH_LEN / WALK_DURATION;  // m/s → drives foot cadence

let hostess = null, mixer = null, walkAction = null, headBone = null, armBone = null;
let footBones = [], footClearance = 0.025;
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
    thumbTex[s.id].anisotropy = MAX_ANISO;
    thumbTex[s.id].minFilter = THREE.LinearMipmapLinearFilter;
    thumbTex[s.id].magFilter = THREE.LinearFilter;
    thumbTex[s.id].minFilter = THREE.LinearMipmapLinearFilter;
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
        if (n === 'lefttoebase' || n === 'righttoebase') footBones.push(o);
      }
      if (o.isMesh) {
        o.frustumCulled = false;
        o.castShadow = !LOW;
        o.receiveShadow = true;
      }
    });

    mixer = new THREE.AnimationMixer(model);
    const walkClip = THREE.AnimationClip.findByName(gltf.animations, 'Walking') || gltf.animations[0];
    walkAction = mixer.clipAction(walkClip);
    walkAction.play();
    walkAction.paused = true;            // greet: frozen on first frame + procedural idle

    hostess.position.copy(PATH.getPoint(0));
    hostess.rotation.y = 0;              // face +Z (toward camera)
    world.add(hostess);
    // Calibrate the toe-bone height against the normalized, rendered mesh.
    // During locomotion we preserve this tiny clearance and only ever lift the
    // rig out of a surface; this avoids both stair penetration and foot skating.
    hostess.updateMatrixWorld(true);
    if (footBones.length) {
      let minToe = Infinity;
      for (const bone of footBones) {
        bone.getWorldPosition(tmpV);
        minToe = Math.min(minToe, tmpV.y);
      }
      footClearance = THREE.MathUtils.clamp(minToe - hostess.position.y, 0.012, 0.06);
    }
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
  pos: new THREE.Vector3(0, 2.45, PORTRAIT0 ? 27 : 21.5),
  look: new THREE.Vector3(0, PORTRAIT0 ? -2.0 : 2.25, -3.2),
};
const FINAL = {
  pos: new THREE.Vector3(0, 2.25, PORTRAIT0 ? 5.3 : 3.4),
  look: new THREE.Vector3(0, 2.2, -9.2),
};
// free-look orbit around hall. yaw range kept tight enough that the camera
// never swings behind the walls into the night (phones sit further back, so
// their yaw span must be narrower than desktop's).
const orbit = {
  yaw: 0, pitch: 0.015, radius: PORTRAIT0 ? 12.7 : 10.8,
  target: new THREE.Vector3(HALL.x, 1.78, HALL.z),
  yawMin: -Math.PI, yawMax: Math.PI,         // full turn — camera follows the character
  pitchMin: -0.08, pitchMax: 0.38,
  rMin: PORTRAIT0 ? 7.4 : 6.2, rMax: PORTRAIT0 ? 15 : 13.5,
};
let dragging = false, px = 0, py = 0, pinchD = 0, followHostess = false;

camera.position.copy(CAM_START.pos);
camTarget.copy(CAM_START.look);
camera.lookAt(camTarget);

const chip = $('chip'), enterWrap = $('enterWrap'),
      ringFill = $('ringFill'), cdEl = $('cd'), hint = $('hint'), tip = $('tip'),
      dpad = $('dpad'), screenCtl = $('screenCtl'), fireSwitch = $('fireSwitch');
const fireLabel = $('fireLabel');
let fireNear = false;

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
  followHostess = true;
  state = 'PRESENT';
  enterInteractive('הזיזו את הדמות עם החצים / WASD · לחצו על מסך כדי להיכנס');
}

function arrive() {
  state = 'PRESENT';
  followHostess = false;
  if (walkAction) walkAction.paused = true;
  if (hostess) {
    if (PORTRAIT0) hostess.position.x = -0.45;
    hostess.rotation.y = 0.12;
  }
  chip.textContent = 'הגענו! בחרו מסך — או טיילו עם החצים';
  setTimeout(() => chip.classList.add('fade'), 5200);
  orbit.target.set(HALL.x, 1.78, HALL.z);
  orbit.yaw = 0;
  orbit.pitch = 0.015;
  orbit.radius = PORTRAIT0 ? 12.7 : 10.8;
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

function setFire(on) {
  fireFx.transitionFrom = fireFx.strength;
  fireFx.transitionTo = on ? 1 : 0;
  fireFx.transitionStart = now();
  fireOn = on;
  fireSwitch.setAttribute('aria-pressed', String(on));
  fireSwitch.classList.toggle('is-off', !on);
  fireLabel.textContent = on ? 'כיבוי האח' : 'הדלקת האח';
  if (navigator.vibrate) navigator.vibrate(24);
}
fireSwitch.addEventListener('click', () => setFire(!fireOn));

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
  else if (k === 'f' && fireNear) { e.preventDefault(); setFire(!fireOn); }
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
    groundHostess(surfaceY(hostess.position.x, hostess.position.z));
  }

  if (state === 'WALK') {
    walkT = Math.min((now() - walkStartMs) / 1000 / WALK_DURATION, 1);
    const ease = walkT < 0.05 ? walkT / 0.05 : 1;                    // gentle start
    const p = PATH.getPointAt(walkT);                                // arc-length → constant speed
    p.y = surfaceY(p.x, p.z);
    hostess.position.copy(p);
    // face along tangent
    const tan = PATH.getTangentAt(Math.min(walkT + 0.001, 1));
    const targetYaw = Math.atan2(tan.x, tan.z);                      // model faces +Z at rot 0
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, targetYaw, 0));
    hostess.quaternion.slerp(q, Math.min(1, dt * 6));
    if (mixer) mixer.update(dt * ease);
    groundHostess(p.y);
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
const footProbe = new THREE.Vector3();
let groundLift = 0;

// Resolve the actual walkable top surface in X/Z. The stage sits 14.5 cm
// above the hall floor, so a depth-only resolver makes feet disappear into it.
function surfaceY(x, z) {
  if (z > 3.975) return 0;
  if (z > 3.365) return 0.15;
  if (z > 2.755) return 0.30;
  const onStage = Math.hypot(x - HALL.x, z - HALL.z) <= STAGE_RADIUS - 0.04;
  return onStage ? STAGE_Y : INTERIOR_Y;
}

function groundHostess(surfaceY) {
  groundLift = 0;
  if (!hostess || !footBones.length) return;
  hostess.updateMatrixWorld(true);
  let lowestToe = Infinity;
  for (const bone of footBones) {
    bone.getWorldPosition(footProbe);
    lowestToe = Math.min(lowestToe, footProbe.y);
  }
  const penetration = surfaceY + footClearance - lowestToe;
  if (penetration > 0) {
    // Keep corrections bounded: large jumps indicate a bad animation frame and
    // should not launch the character. Stair level itself is handled above.
    groundLift = Math.min(penetration, 0.12);
    hostess.position.y += groundLift;
    hostess.updateMatrixWorld(true);
  }
}

// Read-only diagnostics used by the documented QA loop. The pose/view helpers
// are deliberately namespaced and have no UI surface; they make repeatable
// stair and close-up captures possible without altering the authored GLB.
if (new URLSearchParams(location.search).has('qa')) window.__lobbyQA = {
  metrics() {
    const toes = [];
    if (hostess) {
      hostess.updateMatrixWorld(true);
      for (const bone of footBones) {
        bone.getWorldPosition(footProbe);
        toes.push({ name: bone.name, y: +footProbe.y.toFixed(4) });
      }
    }
    const surface = hostess ? surfaceY(hostess.position.x, hostess.position.z) : 0;
    return {
      state,
      root: hostess ? {
        x: +hostess.position.x.toFixed(3),
        y: +hostess.position.y.toFixed(3),
        z: +hostess.position.z.toFixed(3),
      } : null,
      surface,
      surfaceKind: surface === STAGE_Y ? 'stage' : (surface === INTERIOR_Y ? 'hall' : 'entrance'),
      footClearance: +footClearance.toFixed(4),
      groundLift: +groundLift.toFixed(4),
      toes,
      fireOn,
      fireStrength: +fireFx.strength.toFixed(3),
      fireTime: +fireFx.time.toFixed(3),
      siteIds: SITES.map(site => site.id),
      screenCount: screens.length,
      buffer: [renderer.domElement.width, renderer.domElement.height],
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
    };
  },
  pose(z, x = 0, animationTime = 0.4) {
    if (!hostess) return false;
    state = 'PRESENT';
    navigating = true;
    hostess.position.set(x, surfaceY(x, z), z);
    if (walkAction) {
      walkAction.paused = true;
      walkAction.time = animationTime;
      mixer.update(0);
    }
    groundHostess(surfaceY(x, z));
    return true;
  },
  view(name) {
    state = 'PRESENT';
    navigating = true;
    const views = {
      stairs: [[4.9, 1.65, 7.25], [0, 0.42, 3.0]],
      interior: [[0, 2.65, 1.35], [0, 1.85, -8.2]],
      stage: [[0, 2.0, 1.2], [0, 0.66, -4.4]],
      fire: [[6.45, 1.62, -13.15], [6.45, 1.48, -16.02]],
      floor: [[5.9, 1.15, 7.7], [0, 0.06, 7.4]],
    };
    const selected = views[name];
    if (!selected) return false;
    camera.position.fromArray(selected[0]);
    camTarget.fromArray(selected[1]);
    camera.lookAt(camTarget);
    return true;
  },
  pick(clientX, clientY) {
    const p = new THREE.Vector2(
      (clientX / innerWidth) * 2 - 1,
      -(clientY / innerHeight) * 2 + 1
    );
    ray.setFromCamera(p, camera);
    return ray.intersectObjects(world.children, true).slice(0, 4).map(hit => ({
      name: hit.object.name || hit.object.geometry?.type || hit.object.type,
      distance: +hit.distance.toFixed(3),
      position: hit.object.getWorldPosition(new THREE.Vector3()).toArray().map(v => +v.toFixed(2)),
      material: hit.object.material?.name || hit.object.material?.type,
    }));
  },
};
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
    const surface = surfaceY(nx, nz);
    hostess.position.set(nx, surface, nz);
    // face travel direction
    tmpQ.setFromEuler(new THREE.Euler(0, Math.atan2(mvVec.x, mvVec.z), 0));
    hostess.quaternion.slerp(tmpQ, Math.min(1, dt * 9));
    setWalking(true);
    if (mixer) mixer.update(dt * 1.35);
    groundHostess(surface);
  } else {
    setWalking(false);
    // gentle breathing + face the central screen a touch, alive
    const surface = surfaceY(hostess.position.x, hostess.position.z);
    hostess.position.y = surface + Math.sin(idleT * Math.PI) * 0.008;
    tmpQ.setFromEuler(new THREE.Euler(0, 0.32 + Math.sin(idleT * 0.4) * 0.05, 0));
    hostess.quaternion.slerp(tmpQ, Math.min(1, dt * 1.6));
    if (mixer) mixer.update(0);
    groundHostess(surface);
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
    if (followHostess && hostess) {
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
  const chipHalf = Math.min(innerWidth * 0.42, chip.offsetWidth * 0.5) + 10;
  const chipX = THREE.MathUtils.clamp((tmpV.x * 0.5 + 0.5) * innerWidth, chipHalf, innerWidth - chipHalf);
  chip.style.left = chipX + 'px';
  chip.style.top = ((-tmpV.y * 0.5 + 0.5) * innerHeight) + 'px';
}

/* water shimmer */
let waterT = 0;

function updateEnvironmentFx(dt) {
  // Fire motion follows wall time, so thermal throttling never turns it into a
  // slow-motion loop on mobile.
  fireFx.time = now() * 0.001;
  const t = fireFx.time;

  for (const tree of animatedTrees) {
    tree.group.rotation.z = Math.sin(t * 0.42 + tree.phase) * tree.amount;
    tree.group.rotation.x = Math.sin(t * 0.31 + tree.phase * 1.7) * tree.amount * 0.72;
  }

  // Wall-clock transition keeps the switch responsive even on a thermally
  // throttled phone where RAF can be irregular.
  const fireK = THREE.MathUtils.smoothstep(
    THREE.MathUtils.clamp((now() - fireFx.transitionStart) / 460, 0, 1),
    0, 1
  );
  fireFx.strength = THREE.MathUtils.lerp(fireFx.transitionFrom, fireFx.transitionTo, fireK);
  for (const flame of fireFx.photoFlames) {
    flame.material.uniforms.uTime.value = t;
    flame.material.uniforms.uStrength.value = fireFx.strength;
    const base = flame.userData.fireBase;
    const pulse = Math.sin(t * 3.4 + base.phase);
    flame.position.x = base.x + Math.sin(t * 2.65 + base.phase) * 0.036;
    flame.position.y = base.y + Math.sin(t * 4.15 + base.phase) * 0.018;
    flame.scale.x = 1 + Math.sin(t * 2.25 + base.phase) * 0.035;
    flame.scale.y = 1 + pulse * 0.048;
    flame.rotation.z = Math.sin(t * 2.9 + base.phase) * 0.018;
    flame.visible = fireFx.strength > 0.01;
  }
  for (const smoke of fireFx.smoke) {
    smoke.material.uniforms.uTime.value = t;
    smoke.material.uniforms.uStrength.value = fireFx.strength;
    smoke.visible = fireFx.strength > 0.02;
  }
  for (const ember of fireFx.embers) {
    const d = ember.userData;
    const k = (t * d.speed + d.phase) % 1;
    ember.position.set(
      fireFx.origin.x + d.lane * 0.52 + Math.sin(t * 2.4 + d.phase * 14) * 0.13,
      fireFx.origin.y + 0.22 + k * 1.45,
      fireFx.origin.z + 0.02
    );
    const s = 0.028 + (1 - k) * 0.045;
    ember.scale.set(s, s, 1);
    ember.material.opacity = fireFx.strength * (1 - k) * 0.9;
    ember.visible = fireFx.strength > 0.01;
  }
  if (fireFx.light) {
    const target = fireFx.strength * (12.5 + Math.sin(t * 13.1) * 2.2 + Math.sin(t * 7.3) * 1.4);
    fireFx.light.intensity = THREE.MathUtils.lerp(fireFx.light.intensity, target, Math.min(1, dt * 10));
    fireFx.light.color.setRGB(
      1,
      0.29 + Math.sin(t * 5.1) * 0.025,
      0.075 + Math.sin(t * 8.7) * 0.012
    );
  }

  fireNear = !!hostess && state === 'PRESENT' &&
    Math.hypot(hostess.position.x - FIRE_APPROACH.x, hostess.position.z - FIRE_APPROACH.z) < 3.35;
  fireSwitch.hidden = !fireNear;
}

/* ------------------------------------------------------------
   Composer
   ------------------------------------------------------------ */
let composer = null, bloomPass = null;
function buildComposer() {
  // On touch devices render directly into the multisampled default framebuffer.
  // This keeps true MSAA and avoids the soft/pixelated look of a single-sample
  // post-processing target while still retaining ACES tone mapping.
  if (LOW) return;
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.2, 0.3, 1.02);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
}
buildComposer();

function resize() {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h;
  camera.fov = (h > w) ? 58 : 52;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(qualityDpr());
  renderer.setSize(w, h);
  if (composer) composer.setSize(w, h);
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
  updateEnvironmentFx(dt);

  // subtle water sheen
  waterT += dt;
  if (waterShader) waterShader.uniforms.uWaterTime.value = waterT;
  M.water.roughness = 0.05 + Math.sin(waterT * 1.3) * 0.03;

  if (composer) composer.render();
  else renderer.render(scene, camera);
}
loop();
