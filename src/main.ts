// THE BLAME ENGINE — the descent.
// A scroll-driven camera falls through a 10-layer 3D stack. At each layer the
// world dims to a spotlight and the suspect speaks, the dialogue panel pinned
// to them. You are the investigator. It always ends the same way.

import * as THREE from "three";
import Lenis from "lenis";
import { LAYERS, COLD_OPEN, ORIGIN_INCIDENT } from "./layers";
import { LAYER_BUILDERS, type LayerScene } from "./layer-scenes";
import { generateVerdict } from "./verdict-engine";
import "./style.css";

const LAYER_GAP = 16;
const N = LAYERS.length;
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const clamp = (x: number, a: number, b: number): number =>
  Math.max(a, Math.min(b, x));
const smoothstep = (e0: number, e1: number, x: number): number => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

type ThemeName = "dark" | "light";
interface Palette {
  bg: number;
  base: number;
  structure: number;
  accent: number;
  character: number;
}
const PALETTES: Record<ThemeName, Palette> = {
  dark: {
    bg: 0x0a0a0b,
    base: 0x1d1d22,
    structure: 0x121214,
    accent: 0x3b74ff,
    character: 0xf2f2f4,
  },
  light: {
    bg: 0xefefec,
    base: 0xdcdcd8,
    structure: 0xc6c6c0,
    accent: 0x1f4fff,
    character: 0x111114,
  },
};

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function showFallback(): void {
  const div = document.createElement("div");
  div.className = "nowebgl show";
  div.innerHTML =
    "<div><h1 style='font-size:2rem;margin-bottom:.6rem'>blamethe.tech</h1>" +
    "<p style='font-family:monospace;opacity:.7'>This descent needs WebGL. " +
    "Your browser declined. Classic. Blame the tech.</p></div>";
  document.body.appendChild(div);
}

function main(): void {
  const canvas = el<HTMLCanvasElement>("scene");

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    showFallback();
    return;
  }

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(vw, vh);

  const stored = localStorage.getItem("blame-theme");
  let theme: ThemeName = stored === "light" ? "light" : "dark";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTES[theme].bg);
  scene.fog = new THREE.Fog(PALETTES[theme].bg, 18, 78);

  const camera = new THREE.PerspectiveCamera(48, vw / vh, 0.1, 320);

  // --- shared materials ---
  const matBase = new THREE.MeshStandardMaterial({
    roughness: 0.85,
    metalness: 0.12,
  });
  const matStructure = new THREE.MeshStandardMaterial({
    roughness: 0.92,
    metalness: 0.05,
  });
  const matAccent = new THREE.MeshStandardMaterial({
    roughness: 0.4,
    metalness: 0.2,
    emissiveIntensity: 0.7,
  });
  const matCharacter = new THREE.MeshStandardMaterial({
    roughness: 0.5,
    metalness: 0.25,
    emissiveIntensity: 0.2,
  });

  // --- lights ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(8, 14, 10);
  scene.add(key);
  const headlamp = new THREE.PointLight(0xffffff, 110, 90, 2);
  scene.add(headlamp);

  // --- build the stack ---
  const layerScenes: LayerScene[] = [];
  for (let i = 0; i < N; i++) {
    const g = new THREE.Group();
    g.position.y = -i * LAYER_GAP;
    layerScenes.push(
      LAYER_BUILDERS[i](g, {
        base: matBase,
        dark: matStructure,
        accent: matAccent,
        entity: matCharacter,
      }),
    );
    scene.add(g);
  }

  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, N * LAYER_GAP + 8, 12),
    matStructure,
  );
  beam.position.y = -((N - 1) * LAYER_GAP) / 2;
  scene.add(beam);

  // --- particles ---
  const particleCount = 420;
  const pPos = new Float32Array(particleCount * 3);
  const totalDepth = N * LAYER_GAP;
  for (let i = 0; i < particleCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 48;
    pPos[i * 3 + 1] = 6 - Math.random() * (totalDepth + 12);
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 48;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.06,
    transparent: true,
    opacity: 0.4,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // --- theme ---
  function applyTheme(name: ThemeName): void {
    theme = name;
    document.documentElement.dataset.theme = name;
    const p = PALETTES[name];
    scene.background = new THREE.Color(p.bg);
    (scene.fog as THREE.Fog).color.setHex(p.bg);
    matBase.color.setHex(p.base);
    matStructure.color.setHex(p.structure);
    matAccent.color.setHex(p.accent);
    matAccent.emissive.setHex(p.accent);
    matCharacter.color.setHex(p.character);
    matCharacter.emissive.setHex(p.accent);
    pMat.color.setHex(p.accent);
    headlamp.color.setHex(p.accent);
    localStorage.setItem("blame-theme", name);
  }
  applyTheme(theme);
  el<HTMLButtonElement>("theme").addEventListener("click", () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  });

  // --- stack map ---
  const spineEl = el<HTMLElement>("spine");
  for (const layer of LAYERS) {
    const item = document.createElement("div");
    item.className = "spine-item";
    item.innerHTML =
      `<span class="spine-label">${layer.name}</span>` +
      `<span class="spine-tick"></span>`;
    spineEl.appendChild(item);
  }
  function updateSpine(active: number): void {
    const items = spineEl.children;
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle("active", i === active);
      items[i].classList.toggle("passed", i < active);
    }
  }

  // --- dialogue panel (anchored to the speaker) ---
  const stationEl = el<HTMLElement>("station");
  const stDepth = el<HTMLElement>("st-depth");
  const stRole = el<HTMLElement>("st-role");
  const stName = el<HTMLElement>("st-name");
  const stScript = el<HTMLElement>("st-script");
  const scrimEl = el<HTMLElement>("scrim");
  const descendCue = el<HTMLElement>("descend-cue");

  const TYPE_CPS = 58; // characters per second
  const LINE_HOLD = 0.72; // seconds to hold a finished line
  let sceneIdx = -1;
  let lineEls: HTMLElement[] = [];
  let curLine = 0;
  let curChars = 0;
  let holdT = 0;
  let sceneDone = false;

  function loadScene(i: number): void {
    sceneIdx = i;
    const layer = LAYERS[i];
    stDepth.textContent = String(layer.depth).padStart(2, "0");
    stRole.textContent = layer.role;
    stName.textContent = layer.name;
    stScript.textContent = "";
    lineEls = layer.script.map(() => {
      const p = document.createElement("p");
      p.className = "st-line";
      stScript.appendChild(p);
      return p;
    });
    curLine = 0;
    curChars = 0;
    holdT = 0;
    sceneDone = false;
    descendCue.classList.remove("show");
    updateSpine(i);
  }

  function advanceScene(dt: number): void {
    const script = LAYERS[sceneIdx].script;
    if (!sceneDone) {
      if (curLine >= script.length) {
        sceneDone = true;
        descendCue.classList.add("show");
        if (LAYERS[sceneIdx].kind === "verdict") revealVerdict();
      } else {
        const cur = script[curLine];
        if (curChars < cur.length) {
          curChars = Math.min(cur.length, curChars + TYPE_CPS * dt);
        } else {
          holdT += dt;
          if (holdT >= LINE_HOLD) {
            curLine++;
            curChars = 0;
            holdT = 0;
          }
        }
      }
    }
    for (let k = 0; k < lineEls.length; k++) {
      const full = script[k];
      if (k < curLine) {
        lineEls[k].textContent = full;
        lineEls[k].className = "st-line said";
      } else if (k === curLine) {
        lineEls[k].textContent = full.slice(0, Math.floor(curChars));
        lineEls[k].className =
          curChars < full.length ? "st-line typing" : "st-line";
      } else {
        lineEls[k].textContent = "";
        lineEls[k].className = "st-line";
      }
    }
  }

  // --- anchor the panel + scrim to the speaking character ---
  const wpos = new THREE.Vector3();
  let panelX = 0;
  let panelY = 0;
  let panelInit = false;
  function positionPanel(i: number, focus: number): void {
    layerScenes[i].character.getWorldPosition(wpos);
    wpos.project(camera);
    const cx = (wpos.x * 0.5 + 0.5) * vw;
    const cy = (-wpos.y * 0.5 + 0.5) * vh;

    const pw = stationEl.offsetWidth;
    const ph = stationEl.offsetHeight;
    const tx =
      cx < vw * 0.5
        ? clamp(cx + 80, 18, vw - pw - 18)
        : clamp(cx - 80 - pw, 18, vw - pw - 18);
    const ty = clamp(cy - ph * 0.5, 88, vh - ph - 24);
    if (!panelInit) {
      panelX = tx;
      panelY = ty;
      panelInit = true;
    } else {
      panelX += (tx - panelX) * 0.16;
      panelY += (ty - panelY) * 0.16;
    }
    stationEl.style.transform = `translate(${panelX}px, ${panelY}px)`;
    stationEl.style.opacity = String(smoothstep(0.12, 0.55, focus));

    scrimEl.style.setProperty("--cx", `${cx}px`);
    scrimEl.style.setProperty("--cy", `${cy}px`);
    scrimEl.style.opacity = String(focus * 0.95);
  }

  // --- verdict ---
  const verdictEl = el<HTMLElement>("verdict");
  let verdictOpen = false;
  function revealVerdict(): void {
    if (verdictOpen) return;
    verdictOpen = true;
    const v = generateVerdict(ORIGIN_INCIDENT);
    el("v-case").textContent = v.caseId;
    el("v-sev").textContent = v.severity;
    el("v-incident").textContent = v.incident;
    el("v-root").textContent = v.rootCause;
    el("v-finding").textContent = v.finding;
    el("v-blame").textContent = v.blame;
    el("v-rec").textContent = v.recommendation;
    el("v-confidence").textContent = `confidence ${v.confidence}%`;
    verdictEl.hidden = false;
    lenis.stop();
    requestAnimationFrame(() => verdictEl.classList.add("show"));
  }
  function hideVerdict(): void {
    if (!verdictOpen) return;
    verdictOpen = false;
    verdictEl.classList.remove("show");
    lenis.start();
    window.setTimeout(() => {
      if (!verdictOpen) verdictEl.hidden = true;
    }, 650);
  }
  el<HTMLButtonElement>("v-again").addEventListener("click", () => {
    hideVerdict();
    lenis.scrollTo(0, { duration: 2.4 });
  });

  // --- scroll + camera ---
  const lenis = new Lenis({ lerp: 0.085 });
  lenis.stop(); // locked until the cold open is dismissed

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / vw - 0.5) * 2;
    mouseY = (e.clientY / vh - 0.5) * 2;
  });

  const focusPt = new THREE.Vector3();
  function updateCamera(progress: number): void {
    const camY = -progress * (N - 1) * LAYER_GAP;
    camera.position.set(mouseX * 1.8, camY + 6.0 - mouseY * 1.0, 15);
    focusPt.set(0, camY + 2.4, 0);
    camera.lookAt(focusPt);
    headlamp.position.set(mouseX * 3, camY + 5, 9);
  }

  // --- intro: boot count, then cold open ---
  let descending = false;
  let dismissed = false;
  const introEl = el<HTMLElement>("intro");
  const introNum = el<HTMLElement>("intro-num");
  const introLines = el<HTMLElement>("intro-lines");
  const introGo = el<HTMLButtonElement>("intro-go");

  function dismissIntro(): void {
    if (dismissed) return;
    dismissed = true;
    introEl.classList.add("done");
    descending = true;
    lenis.start();
  }
  function armDismiss(): void {
    introGo.addEventListener("click", dismissIntro);
    window.addEventListener("wheel", dismissIntro, { once: true, passive: true });
    window.addEventListener("touchstart", dismissIntro, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", dismissIntro, { once: true });
  }
  function runColdOpen(): void {
    let li = 0;
    const typeLine = (): void => {
      if (li >= COLD_OPEN.length) {
        introGo.hidden = false;
        requestAnimationFrame(() => introGo.classList.add("show"));
        armDismiss();
        return;
      }
      const text = COLD_OPEN[li];
      const p = document.createElement("p");
      p.className = "intro-line";
      introLines.appendChild(p);
      let ci = 0;
      const tick = (): void => {
        ci++;
        p.textContent = text.slice(0, ci);
        if (ci < text.length) window.setTimeout(tick, 30);
        else {
          li++;
          window.setTimeout(typeLine, 540);
        }
      };
      tick();
    };
    typeLine();
  }
  function runIntro(): void {
    let n = 0;
    const count = (): void => {
      n += Math.ceil((100 - n) * 0.16) + 1;
      if (n >= 100) {
        introNum.textContent = "100";
        window.setTimeout(() => {
          introNum.classList.add("hide");
          runColdOpen();
        }, 320);
        return;
      }
      introNum.textContent = String(n);
      window.setTimeout(count, 32);
    };
    count();
  }

  // --- render loop ---
  let lastTime = 0;
  function frame(time: number): void {
    const dt = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0.016;
    lastTime = time;

    lenis.raf(time);
    const progress = clamp01(lenis.progress || 0);
    const pos = progress * (N - 1);
    updateCamera(progress);

    if (descending) {
      const idx = clamp(Math.round(pos), 0, N - 1);
      if (idx !== sceneIdx) loadScene(idx);
      const focus = 1 - smoothstep(0.12, 0.42, Math.abs(pos - Math.round(pos)));
      if (focus > 0.5) advanceScene(dt);
      positionPanel(idx, focus);
      if (verdictOpen && idx < N - 1) hideVerdict();
    }

    const t = time * 0.001;
    for (const s of layerScenes) s.update?.(t);
    beam.rotation.y = t * 0.04;
    particles.rotation.y = t * 0.012;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    renderer.setSize(vw, vh);
  });

  runIntro();
  requestAnimationFrame(frame);
}

main();
