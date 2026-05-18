// THE BLAME ENGINE — per-layer 3D environments.
// Each builder constructs a distinct world that *represents* its layer, and
// returns the `character` object the dialogue panel anchors to.

import * as THREE from "three";

export interface SceneCtx {
  base: THREE.MeshStandardMaterial; // structural / lighter
  dark: THREE.MeshStandardMaterial; // structural / darker
  accent: THREE.MeshStandardMaterial; // electric blue, emissive
  entity: THREE.MeshStandardMaterial; // the responsible person / AI
}
export interface LayerScene {
  /** The object the dialogue panel anchors to (the speaker). */
  character: THREE.Object3D;
  update?: (t: number) => void;
}
export type LayerBuilder = (g: THREE.Group, c: SceneCtx) => LayerScene;

const BLUE = 0x3b74ff;

const box = (w: number, h: number, d: number, m: THREE.Material): THREE.Mesh =>
  new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (
  rt: number,
  rb: number,
  h: number,
  m: THREE.Material,
  seg = 32,
): THREE.Mesh => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
const sphere = (r: number, m: THREE.Material, seg = 22): THREE.Mesh =>
  new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), m);
const ring = (r: number, tube: number, m: THREE.Material): THREE.Mesh =>
  new THREE.Mesh(new THREE.TorusGeometry(r, tube, 14, 90), m);
const capsule = (m: THREE.Material): THREE.Mesh =>
  new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.3, 6, 14), m);
const glow = (hex: number, intensity = 1): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({
    color: hex,
    emissive: hex,
    emissiveIntensity: intensity,
    roughness: 0.35,
  });

// 1 — THE USER: a monitor on the surface, screaming an error.
const buildUser: LayerBuilder = (g, c) => {
  const ground = cyl(11, 11, 0.4, c.base, 72);
  ground.position.y = -0.2;
  g.add(ground);

  const screenMat = glow(0xff414c, 0.85);
  const markMat = glow(0xffffff, 1.3);

  const monitor = new THREE.Group();
  monitor.position.set(-0.4, 4.7, 0);
  monitor.rotation.y = 0.16;
  monitor.add(box(5.4, 3.4, 0.4, c.dark));
  const screen = box(4.7, 2.7, 0.16, screenMat);
  screen.position.z = 0.22;
  monitor.add(screen);
  const bar = box(0.36, 1.25, 0.12, markMat);
  bar.position.set(0, 0.36, 0.34);
  const dot = box(0.36, 0.36, 0.12, markMat);
  dot.position.set(0, -0.52, 0.34);
  monitor.add(bar, dot);
  g.add(monitor);

  const stand = box(0.42, 2.6, 0.42, c.dark);
  stand.position.set(-0.4, 2.0, 0);
  const foot = cyl(1.2, 1.2, 0.22, c.dark);
  foot.position.set(-0.4, 0.8, 0);
  g.add(stand, foot);

  const person = capsule(c.entity);
  person.position.set(3.2, 1.3, 2.6);
  g.add(person);

  return {
    character: person,
    update: (t) => {
      screenMat.emissiveIntensity =
        0.7 + Math.sin(t * 7) * 0.18 + (Math.random() < 0.05 ? 0.55 : 0);
      person.position.y = 1.3 + Math.sin(t * 1.3) * 0.08;
      monitor.rotation.y = 0.16 + Math.sin(t * 0.5) * 0.05;
    },
  };
};

// 2 — THE FRONTEND: a browser window in a cloud of floating buttons.
const buildFrontend: LayerBuilder = (g, c) => {
  const win = new THREE.Group();
  win.position.set(0, 4.5, -1.4);
  win.add(box(7.6, 5.0, 0.3, c.base));
  const topbar = box(7.6, 0.74, 0.36, c.dark);
  topbar.position.set(0, 2.13, 0.06);
  win.add(topbar);
  for (let i = 0; i < 3; i++) {
    const d = sphere(0.13, c.accent, 12);
    d.position.set(-3.4 + i * 0.44, 2.13, 0.28);
    win.add(d);
  }
  const viewport = box(7.0, 3.7, 0.1, c.dark);
  viewport.position.set(0, -0.4, 0.2);
  win.add(viewport);
  g.add(win);

  const btns: THREE.Mesh[] = [];
  const btnBase: number[] = [];
  for (let i = 0; i < 9; i++) {
    const b = box(1.5, 0.62, 0.3, i % 3 === 0 ? c.accent : c.base);
    const a = (i / 9) * Math.PI * 2;
    b.position.set(
      Math.cos(a) * (5.0 + (i % 2)),
      3.9 + Math.sin(i * 2.1) * 2.5,
      1.7 + Math.sin(a) * 1.5,
    );
    b.rotation.z = Math.sin(i) * 0.4;
    g.add(b);
    btns.push(b);
    btnBase.push(b.position.y);
  }

  const cursor = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.95, 4),
    glow(BLUE, 0.6),
  );
  cursor.position.set(2.4, 2.0, 3.0);
  cursor.rotation.set(Math.PI, 0.5, 0.3);
  g.add(cursor);

  const dev = capsule(c.entity);
  dev.position.set(-3.8, 1.3, 3.2);
  g.add(dev);

  return {
    character: dev,
    update: (t) => {
      btns.forEach((b, i) => {
        b.position.y = btnBase[i] + Math.sin(t * 1.4 + i) * 0.16;
        b.rotation.z = Math.sin(i) * 0.4 + Math.sin(t * 0.8 + i) * 0.05;
      });
      cursor.position.x = 2.4 + Math.sin(t * 1.3) * 1.3;
      cursor.position.y = 2.2 + Math.cos(t * 1.7) * 0.9;
      dev.rotation.z = Math.sin(t * 5) * 0.05; // a nervous shiver
    },
  };
};

// 3 — THE BACKEND: a server node, pipes, data packets flowing through.
const buildBackend: LayerBuilder = (g, c) => {
  const server = box(2.6, 3.4, 2.6, c.base);
  server.position.set(0, 3.6, 0);
  g.add(server);
  for (let i = 0; i < 4; i++) {
    const slot = box(2.1, 0.18, 0.12, c.accent);
    slot.position.set(0, 2.5 + i * 0.55, 1.32);
    g.add(slot);
  }

  const pipes: { from: THREE.Vector3; to: THREE.Vector3 }[] = [];
  const defs: number[][] = [
    [-7.5, 2.2, 1.6, 7.5, 2.2, 1.6],
    [-6.8, 5.4, -1.3, 6.8, 5.4, -1.3],
    [-5.8, 3.8, 2.8, 5.8, 3.8, -2.8],
  ];
  for (const d of defs) {
    const a = new THREE.Vector3(d[0], d[1], d[2]);
    const b = new THREE.Vector3(d[3], d[4], d[5]);
    const pipe = cyl(0.32, 0.32, a.distanceTo(b), c.dark, 18);
    pipe.position.copy(a.clone().lerp(b, 0.5));
    pipe.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    );
    g.add(pipe);
    pipes.push({ from: a, to: b });
  }

  const packets: { mesh: THREE.Mesh; pipe: number; off: number }[] = [];
  for (let i = 0; i < 9; i++) {
    const pk = box(0.42, 0.42, 0.42, c.accent);
    g.add(pk);
    packets.push({ mesh: pk, pipe: i % pipes.length, off: i / 9 });
  }

  const api = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0), c.entity);
  api.position.set(4.8, 1.5, 3.4);
  g.add(api);

  return {
    character: api,
    update: (t) => {
      packets.forEach((p) => {
        const pp = pipes[p.pipe];
        p.mesh.position.copy(pp.from).lerp(pp.to, (t * 0.18 + p.off) % 1);
      });
      api.rotation.y = t * 0.5;
    },
  };
};

// 4 — THE DATABASE: the iconic cylinder stack and floating table grids.
const buildDatabase: LayerBuilder = (g, c) => {
  const db = new THREE.Group();
  db.position.set(0, 3.8, 0);
  for (let i = 0; i < 4; i++) {
    const disc = cyl(2.7, 2.7, 0.95, i % 2 ? c.base : c.dark, 48);
    disc.position.y = i * 1.05 - 1.6;
    db.add(disc);
    const r = ring(2.7, 0.06, c.accent);
    r.rotation.x = Math.PI / 2;
    r.position.y = i * 1.05 - 1.12;
    db.add(r);
  }
  g.add(db);

  const grids: THREE.Group[] = [];
  for (let n = 0; n < 3; n++) {
    const grid = new THREE.Group();
    for (let row = 0; row < 4; row++) {
      const b = box(2.6, 0.16, 0.16, row === 0 ? c.accent : c.dark);
      b.position.y = row * 0.44;
      grid.add(b);
    }
    const a = (n / 3) * Math.PI * 2;
    grid.position.set(Math.cos(a) * 6.4, 3.6 + n * 0.7, Math.sin(a) * 3.6);
    grid.rotation.y = -a;
    g.add(grid);
    grids.push(grid);
  }

  const dba = capsule(c.entity);
  dba.position.set(-4.8, 1.3, 3.8);
  g.add(dba);

  return {
    character: dba,
    update: (t) => {
      db.rotation.y = t * 0.22;
      grids.forEach((gr) => {
        gr.rotation.y += 0.0026;
      });
    },
  };
};

// 5 — THE NETWORK: a mesh of nodes, edges, and packets in transit.
const buildNetwork: LayerBuilder = (g, c) => {
  const count = 16;
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const tier = i % 3;
    nodes.push(
      new THREE.Vector3(
        Math.cos(a) * (3.4 + tier * 1.7),
        3.8 + Math.sin(i * 1.7) * 2.9,
        Math.sin(a) * (3.4 + tier * 1.7),
      ),
    );
  }
  nodes.forEach((n) => {
    const s = sphere(0.34, c.accent, 14);
    s.position.copy(n);
    g.add(s);
  });

  const edges: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    edges.push([i, (i + 1) % count], [i, (i + 5) % count]);
  }
  const pts: number[] = [];
  edges.forEach(([i, j]) => {
    pts.push(nodes[i].x, nodes[i].y, nodes[i].z);
    pts.push(nodes[j].x, nodes[j].y, nodes[j].z);
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  g.add(
    new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: BLUE,
        transparent: true,
        opacity: 0.4,
      }),
    ),
  );

  const pkMat = glow(0xffffff, 1.0);
  const packets: { mesh: THREE.Mesh; e: number; off: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const pk = box(0.32, 0.32, 0.32, pkMat);
    g.add(pk);
    packets.push({ mesh: pk, e: (i * 3) % edges.length, off: i / 10 });
  }

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0), c.entity);
  core.position.set(0, 3.8, 0);
  g.add(core);

  return {
    character: core,
    update: (t) => {
      packets.forEach((p) => {
        const [i, j] = edges[p.e];
        p.mesh.position.copy(nodes[i]).lerp(nodes[j], (t * 0.22 + p.off) % 1);
      });
      core.rotation.y = t * 0.4;
      core.rotation.x = t * 0.2;
    },
  };
};

// 6 — DNS: an overworked switchboard, drowning in tangled cables.
const buildDns: LayerBuilder = (g, c) => {
  const panel = box(8.8, 5.6, 0.6, c.base);
  panel.position.set(0, 4.5, -1);
  g.add(panel);

  const jacks: THREE.Vector3[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      const jack = cyl(0.16, 0.16, 0.3, c.dark, 10);
      jack.rotation.x = Math.PI / 2;
      const x = -3.6 + col * 0.9;
      const y = 2.7 + row * 0.92;
      jack.position.set(x, y, -0.62);
      g.add(jack);
      jacks.push(new THREE.Vector3(x, y, -0.8));
    }
  }

  const cableMat = glow(BLUE, 0.4);
  for (let i = 0; i < 11; i++) {
    const a = jacks[Math.floor(Math.random() * jacks.length)];
    const b = jacks[Math.floor(Math.random() * jacks.length)];
    const mid = a.clone().lerp(b, 0.5);
    mid.z += 1.8 + Math.random() * 1.6;
    mid.y -= 1.6 + Math.random();
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(a, mid, b),
        24,
        0.07,
        8,
        false,
      ),
      cableMat,
    );
    g.add(tube);
  }

  const dnsMat = glow(BLUE, 0.5);
  const orb = sphere(1.2, dnsMat, 26);
  orb.position.set(0, 4.1, 2.6);
  g.add(orb);

  return {
    character: orb,
    update: (t) => {
      orb.position.y = 4.1 + Math.sin(t * 0.7) * 0.13; // a tired bob
      dnsMat.emissiveIntensity = 0.42 + Math.sin(t * 0.7) * 0.1;
    },
  };
};

// 7 — THE KERNEL: concentric rings around a still, ancient core (ring 0).
const buildKernel: LayerBuilder = (g, c) => {
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const isCore = i === 3;
    const r = ring(5.2 - i * 1.2, 0.16, isCore ? glow(BLUE, 1.3) : c.dark);
    r.position.y = 3.9;
    r.rotation.x = Math.PI / 2 + i * 0.22;
    r.rotation.z = i * 0.4;
    g.add(r);
    rings.push(r);
  }
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), c.entity);
  core.position.set(0, 3.9, 0);
  g.add(core);

  const slab = box(1.5, 3.2, 0.5, c.dark);
  slab.position.set(0, 0.8, 3.8);
  g.add(slab);

  return {
    character: core,
    update: (t) => {
      rings.forEach((r, i) => {
        r.rotation.z += 0.0009 * (i + 1); // slow, precise, mechanical
      });
      core.rotation.y = t * 0.14;
    },
  };
};

// 8 — THE HARDWARE: rows of server racks, blinking, in a cold room.
const buildHardware: LayerBuilder = (g, c) => {
  const floor = box(17, 0.3, 13, c.dark);
  floor.position.y = -0.1;
  g.add(floor);

  const leds: { mat: THREE.MeshStandardMaterial; ph: number }[] = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const x = -5.4 + col * 3.6;
      const z = row === 0 ? -2.6 : 2.6;
      const rack = box(1.9, 5.6, 1.9, c.base);
      rack.position.set(x, 3.0, z);
      g.add(rack);
      const fz = z + (row === 0 ? -0.98 : 0.98);
      for (let k = 0; k < 6; k++) {
        const mat = glow(k % 4 === 0 ? 0xffffff : BLUE, 0.8);
        const led = box(0.22, 0.22, 0.08, mat);
        led.position.set(
          x - 0.5 + (k % 2) * 1.0,
          1.4 + Math.floor(k / 2) * 1.3,
          fz,
        );
        g.add(led);
        leds.push({ mat, ph: Math.random() * 10 });
      }
    }
  }

  const sentinel = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.9, 0),
    c.entity,
  );
  sentinel.position.set(0, 3.0, 0);
  g.add(sentinel);

  return {
    character: sentinel,
    update: (t) => {
      leds.forEach((l) => {
        l.mat.emissiveIntensity = 0.5 + Math.abs(Math.sin(t * 2 + l.ph)) * 0.9;
      });
      sentinel.rotation.y = t * 0.3;
    },
  };
};

// 9 — THE COSMIC RAY: open space, a planet below, a streaking ray.
const buildCosmic: LayerBuilder = (g, c) => {
  const starCount = 600;
  const sp = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    sp[i * 3] = (Math.random() - 0.5) * 72;
    sp[i * 3 + 1] = (Math.random() - 0.5) * 42 + 3;
    sp[i * 3 + 2] = (Math.random() - 0.5) * 72;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: BLUE,
      size: 0.13,
      transparent: true,
      opacity: 0.9,
    }),
  );
  g.add(stars);

  const planet = sphere(5.6, c.dark, 40);
  planet.position.set(2, -16, -5);
  g.add(planet);
  const halo = ring(6.2, 0.12, glow(BLUE, 0.8));
  halo.position.copy(planet.position);
  halo.rotation.x = Math.PI / 2.3;
  g.add(halo);

  const rayMat = glow(0xffffff, 1.7);
  const rayGroup = new THREE.Group();
  rayGroup.add(cyl(0.05, 0.18, 7, rayMat, 8));
  const head = sphere(0.32, rayMat, 12);
  head.position.y = -3.6;
  rayGroup.add(head);
  rayGroup.rotation.z = 0.5;
  g.add(rayGroup);

  // a stable little presence — the cosmic ray you actually speak to
  const entity = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.85, 0),
    glow(BLUE, 0.9),
  );
  entity.position.set(-3.6, 4.4, 1.6);
  g.add(entity);

  return {
    character: entity,
    update: (t) => {
      stars.rotation.y = t * 0.02;
      const k = (t * 0.32) % 1;
      rayGroup.position.set(-6 + k * 12, 9 - k * 13, 1 + Math.sin(k * 3) * 2);
      entity.rotation.y = t * 0.6;
      entity.position.y = 4.4 + Math.sin(t * 1.6) * 0.18;
    },
  };
};

// 10 — THE ROOT CAUSE: the Blame Engine, on a pedestal at the bottom.
const buildRootCause: LayerBuilder = (g, c) => {
  const pedestal = cyl(3.0, 3.8, 1.2, c.dark, 48);
  pedestal.position.y = 0.5;
  g.add(pedestal);
  const step = cyl(2.2, 2.6, 0.8, c.base, 48);
  step.position.y = 1.5;
  g.add(step);

  const coreMat = glow(BLUE, 1.8);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), coreMat);
  core.position.y = 4.2;
  g.add(core);

  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const r = ring(2.6 + i * 0.7, 0.08, c.accent);
    r.position.y = 4.2;
    r.rotation.x = Math.random() * Math.PI;
    r.rotation.y = Math.random() * Math.PI;
    g.add(r);
    rings.push(r);
  }

  const shaft = cyl(0.3, 0.3, 8, glow(BLUE, 0.5), 16);
  shaft.position.y = 8.5;
  g.add(shaft);

  return {
    character: core,
    update: (t) => {
      core.rotation.y = t * 0.5;
      core.rotation.x = t * 0.3;
      coreMat.emissiveIntensity = 1.5 + Math.sin(t * 2.5) * 0.5;
      rings.forEach((r, i) => {
        r.rotation.z += 0.004 * (i + 1);
        r.rotation.x += 0.002 * (i + 1);
      });
    },
  };
};

export const LAYER_BUILDERS: LayerBuilder[] = [
  buildUser,
  buildFrontend,
  buildBackend,
  buildDatabase,
  buildNetwork,
  buildDns,
  buildKernel,
  buildHardware,
  buildCosmic,
  buildRootCause,
];
