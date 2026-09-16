/**
 * 3D aim trainer. Real table geometry + real physics shot simulation.
 * - Drag balls, pick pocket, aim by dragging cloth (or ←/→ fine aim)
 * - Ghost ball + fraction (ghost-ball method)
 * - Shoot runs the frozen engine's own simulation; result from real outcome
 * - Loads drill layouts from src/data/drills.json
 */
import {
  Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight,
  Group, Mesh, SphereGeometry, PlaneGeometry, BoxGeometry, CylinderGeometry,
  MeshStandardMaterial, MeshBasicMaterial,
  Raycaster, Plane, Vector2, Vector3, MOUSE,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Simulator, DEFAULT_CONFIG, loadDrillBalls } from './physics/engine.js';
import { getBallTexture } from './graphics/balls.js';
import { api } from './services/api.js';
import { storage } from './services/storage.js';

const R = DEFAULT_CONFIG.ball_radius;
const HALF_W = DEFAULT_CONFIG.table_length / 4;
const HALF_L = DEFAULT_CONFIG.table_length / 2;
const CUE = 'cue_ball';
const POCKETS = new Simulator().pockets;
const REFS = [[1, 'FULL'], [0.75, '3/4'], [0.5, '1/2'], [0.25, '1/4']];

/* ---------------------------------------------------------------- scene */
const view = document.getElementById('view');
const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x0b1117);
view.appendChild(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera(45, 1, 0.01, 40);
camera.position.set(0, 1.3, 2.1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 0.35;
controls.maxDistance = 6;
controls.mouseButtons = { LEFT: null, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE };

scene.add(new HemisphereLight(0xffffff, 0x223344, 1.15));
const sun = new DirectionalLight(0xffffff, 1.4);
sun.position.set(1.5, 3, 2);
scene.add(sun);

// table
const table = new Group();
scene.add(table);
const cloth = new Mesh(new PlaneGeometry(2 * HALF_W, 2 * HALF_L), new MeshStandardMaterial({ color: 0x2583b5, roughness: 1 }));
cloth.rotation.x = -Math.PI / 2;
table.add(cloth);
const body = new Mesh(new BoxGeometry(2 * HALF_W + 0.18, 0.08, 2 * HALF_L + 0.18), new MeshStandardMaterial({ color: 0x4d1610, roughness: 0.8 }));
body.position.y = -0.045;
table.add(body);
const railMat = new MeshStandardMaterial({ color: 0x6b2416, roughness: 0.7 });
for (const s of [-1, 1]) {
  const long = new Mesh(new BoxGeometry(0.09, 0.035, 2 * HALF_L + 0.18), railMat);
  long.position.set(s * (HALF_W + 0.045), 0.0175, 0);
  table.add(long);
  const short = new Mesh(new BoxGeometry(2 * HALF_W + 0.18, 0.035, 0.09), railMat);
  short.position.set(0, 0.0175, s * (HALF_L + 0.045));
  table.add(short);
}
const pocketMeshes = new Map();
for (const p of POCKETS) {
  // sink mouth into cloth; sides hug the rail instead of poking past it
  const x = p.isSidePocket ? Math.sign(p.center.x) * (HALF_W - 0.012) : p.center.x;
  const m = new Mesh(new CylinderGeometry(Math.min(p.radius, 0.075), Math.min(p.radius, 0.075), 0.05, 24), new MeshBasicMaterial({ color: 0x05080a }));
  m.position.set(x, -0.023, -p.center.y);
  table.add(m);
  pocketMeshes.set(p.name, m);
}

// balls
const ballGeo = new SphereGeometry(R, 32, 24);
const ballGroup = new Group();
scene.add(ballGroup);
let meshes = new Map();

const ghost = new Mesh(new SphereGeometry(R, 24, 18), new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false }));
const ghostWire = new Mesh(new SphereGeometry(R * 1.003, 14, 10), new MeshBasicMaterial({ color: 0xdff0ff, wireframe: true, transparent: true, opacity: 0.45 }));
scene.add(ghost, ghostWire);

function makeStick(color, w = 0.013) {
  const m = new Mesh(new BoxGeometry(1, 0.0012, w), new MeshBasicMaterial({ color }));
  scene.add(m);
  return m;
}
function placeStick(stick, a, b, y = 0.004) {
  const A = toVec(a, y);
  const B = toVec(b, y);
  const dir = new Vector3().subVectors(B, A);
  const len = dir.length() || 1e-6;
  stick.scale.x = len;
  stick.position.copy(A).addScaledVector(dir, 0.5);
  stick.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), dir.normalize());
}
const aimLine = makeStick(0xffffff, 0.011);
const pathLine = makeStick(0xffc62b, 0.013);

const CUE_LEN = 0.75;
const cueMesh = new Mesh(new CylinderGeometry(0.0065, 0.0095, CUE_LEN, 16), new MeshStandardMaterial({ color: 0xd9b382, roughness: 0.5 }));
scene.add(cueMesh);

/* ---------------------------------------------------------------- state */
const state = {
  aim: new Vector2(0, 1),
  target: 'right-side',
  goalType: 1,
  drag: null,
  aimDrag: false,
  playing: false,
  T: 0,
  speed: 1.5,
  showGhost: true,
  shot: null,
  snapshot: null,
  log: [],
};
let layout = new Map(); // type -> { x, y } (engine coords, meters)

/* ------------------------------------------------------------- geometry */
const pocket = (name = state.target) => POCKETS.find((p) => p.name === name);
const objType = () => [...layout.keys()].find((t) => t !== CUE);
const toVec = (p, z = R) => new Vector3(p.x, z, -p.y);

function aimData() {
  const cue = layout.get(CUE);
  const obj = layout.get(objType());
  const p = pocket();
  if (!cue || !obj || !p) return null;
  const dx = p.center.x - obj.x;
  const dy = p.center.y - obj.y;
  const dl = Math.hypot(dx, dy) || 1;
  const ux = dx / dl;
  const uy = dy / dl;
  const ghostPt = { x: obj.x - ux * 2 * R, y: obj.y - uy * 2 * R };
  const cos = Math.max(-1, Math.min(1, state.aim.x * ux + state.aim.y * uy));
  const cut = Math.acos(cos);
  return { cue, obj, pocket: p, ghost: ghostPt, ux, uy, cut, fraction: 1 - Math.sin(cut) };
}

function fractionRef(f) {
  if (f < 0.15) return 'THIN';
  let best = REFS[0];
  for (const r of REFS) if (Math.abs(r[0] - f) < Math.abs(best[0] - f)) best = r;
  return best[1];
}

function snapAimToGhost() {
  const a = aimData();
  if (!a) return;
  state.aim.set(a.ghost.x - a.cue.x, a.ghost.y - a.cue.y).normalize();
}

function buildMeshes() {
  for (const m of meshes.values()) {
    ballGroup.remove(m);
    m.material.map?.dispose();
    m.material.dispose();
  }
  meshes = new Map();
  for (const type of layout.keys()) {
    const m = new Mesh(ballGeo, new MeshStandardMaterial({ map: getBallTexture(type), roughness: 0.18 }));
    m.userData.type = type;
    ballGroup.add(m);
    meshes.set(type, m);
  }
}

function afterLayoutChange(resetCamera) {
  buildMeshes();
  snapAimToGhost();
  state.snapshot = snapshot();
  state.shot = null;
  state.playing = false;
  setResult('–', '');
  if (resetCamera) camBehind();
  updateReadout();
}

const snapshot = () => new Map([...layout].map(([t, p]) => [t, { ...p }]));

function loadDrill(drill) {
  const sim = new Simulator();
  loadDrillBalls(sim, drill);
  layout = new Map();
  for (const b of sim.finalBallState.values()) layout.set(b.type, { x: b.position.x, y: b.position.y });
  state.target = drill.goal.pocket;
  state.goalType = drill.goal.ball;
  afterLayoutChange(true);
}

function loadSandbox() {
  layout = new Map([
    [CUE, { x: -0.05, y: 0.35 }],
    [1, { x: 0.3, y: 0.1 }],
  ]);
  state.target = 'right-side';
  state.goalType = 1;
  afterLayoutChange(true);
}

/* ----------------------------------------------------------------- shot */
function shoot() {
  if (state.playing || state.shot) return;
  state.snapshot = snapshot();
  const sim = new Simulator();
  const idByType = new Map();
  for (const [type, p] of layout) idByType.set(type, sim.addBall(type, new Vector2(p.x, p.y)));
  const c = layout.get(CUE);
  sim.cue.position.copy(new Vector3(c.x, c.y, R));
  sim.cue.axis.copy(new Vector3(state.aim.x, state.aim.y, 0));
  sim.shoot(state.speed);

  const cum = [0];
  for (const e of sim.events) cum.push(cum[cum.length - 1] + e.time);
  const impact = sim.events.findIndex((e) => e.name === 'BallCueImpact');
  const firstHit = sim.events.findIndex((e, i) => i > impact && e.name === 'BallBallImpact');
  state.shot = { sim, idByType, cum, impact, firstHit, endT: cum[sim.events.length] };
  state.T = impact >= 0 ? cum[impact] : 0;
  state.playing = true;
  setResult('…', 'rolling');
  updateButtons();
}

function statesAt(T) {
  const { sim, cum } = state.shot;
  const events = sim.events;
  let idx = -1;
  for (let i = 0; i < events.length; i++) {
    if (cum[i + 1] <= T + 1e-6) idx = i;
    else break;
  }
  const t0 = idx >= 0 ? cum[idx + 1] : 0;
  return sim.ballStateAt(idx, Math.max(0, T - t0));
}

function finishShot() {
  state.playing = false;
  const { sim, idByType, firstHit } = state.shot;
  const goal = sim.finalBallState.get(idByType.get(state.goalType));
  const cue = sim.finalBallState.get(idByType.get(CUE));
  const made = goal?.state === 'Pocketed';
  const scratch = cue?.state === 'Pocketed';

  let detail = '';
  if (firstHit >= 0) {
    const ev = sim.events[firstHit];
    const hitter = [ev.ballA, ev.ballB].find((b) => b && b.type !== CUE);
    if (hitter && hitter.type !== state.goalType) detail += `hit ${hitter.type}-ball first. `;
    const after = sim.ballStateAt(firstHit, 1e-3);
    const objAfter = after.get(idByType.get(state.goalType));
    if (objAfter) {
      const p = pocket();
      const want = Math.atan2(p.center.y - objAfter.position.y, p.center.x - objAfter.position.x);
      const got = Math.atan2(objAfter.velocity.y, objAfter.velocity.x);
      const dev = ((got - want) * 180) / Math.PI;
      detail += `object ball ${Math.abs(dev).toFixed(1)}° ${dev > 0 ? 'left' : 'right'} of the pocket line (cut-induced throw). `;
    }
  } else {
    detail += 'no ball contact. ';
  }
  if (scratch) detail += 'Cue ball scratched. ';

  const a = aimData();
  state.log.unshift({ cut: a ? (a.cut * 180) / Math.PI : 0, fraction: a ? a.fraction : 0, made });
  state.log = state.log.slice(0, 8);
  renderLog();
  setResult(made ? 'Pocketed' : 'Missed', detail || (made ? 'Clean pot.' : ''));
  updateReadout();
  updateButtons();
}

function resetBalls() {
  if (state.snapshot) layout = new Map([...state.snapshot].map(([t, p]) => [t, { ...p }]));
  state.shot = null;
  state.playing = false;
  setResult('–', '');
  buildMeshes();
  updateReadout();
  updateButtons();
}

function updateButtons() {
  document.getElementById('shoot').disabled = state.playing || !!state.shot;
}

/* --------------------------------------------------------------- visuals */
function updateVisuals() {
  if (state.shot) {
    const T = Math.min(state.T, state.shot.endT);
    const map = statesAt(T);
    for (const [type, mesh] of meshes) {
      const b = map.get(state.shot.idByType.get(type));
      if (!b) continue;
      mesh.visible = b.state !== 'Pocketed';
      mesh.position.set(b.position.x, b.position.z, -b.position.y);
    }
  } else {
    for (const [type, mesh] of meshes) {
      const p = layout.get(type);
      mesh.visible = true;
      mesh.position.copy(toVec(p));
    }
  }

  const a = aimData();
  const showAim = !!a && !state.shot;
  ghost.visible = ghostWire.visible = state.showGhost && !!a;
  aimLine.visible = pathLine.visible = showAim;
  cueMesh.visible = showAim;
  if (!a) return;

  const ghostPos = toVec(a.ghost);
  ghost.position.copy(ghostPos);
  ghostWire.position.copy(ghostPos);

  if (showAim) {
    const cuePos = toVec(a.cue);
    placeStick(aimLine, { x: a.cue.x, y: a.cue.y }, a.ghost, 0.004);
    placeStick(pathLine, { x: a.obj.x, y: a.obj.y }, a.pocket.center, 0.006);
    const dir = new Vector3(state.aim.x, 0, -state.aim.y);
    cueMesh.position.copy(cuePos).addScaledVector(dir, -(0.02 + CUE_LEN / 2));
    cueMesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir);
  }

  for (const [name, mesh] of pocketMeshes) {
    mesh.material.color.set(name === state.target ? 0xffc62b : 0x05080a);
  }
}

function updateReadout() {
  const a = aimData();
  if (!a) return;
  const deg = (a.cut * 180) / Math.PI;
  document.getElementById('out-cut').textContent = `${deg.toFixed(1)}°`;
  document.getElementById('out-frac').textContent = a.fraction.toFixed(2);
  document.getElementById('out-ref').textContent = fractionRef(a.fraction);
  document.getElementById('out-aim').textContent = `${((Math.atan2(state.aim.y, state.aim.x) * 180) / Math.PI).toFixed(1)}°`;
  document.getElementById('out-target').textContent = a.pocket.name;
  const made = state.log.filter((s) => s.made).length;
  document.getElementById('summary').textContent = `${made} / ${state.log.length}`;
}

function setResult(text, detail) {
  const el = document.getElementById('out-result');
  el.textContent = text;
  el.className = text === 'Pocketed' ? 'made' : text === 'Missed' ? 'miss' : '';
  document.getElementById('out-detail').textContent = detail || '';
}

function renderLog() {
  document.getElementById('log').innerHTML = state.log
    .map((s, i) => `<tr><td>${state.log.length - i}</td><td>${s.cut.toFixed(1)}</td><td>${s.fraction.toFixed(2)}</td><td class="${s.made ? 'made' : 'miss'}">${s.made ? '✔' : '✖'}</td></tr>`)
    .join('');
}

/* ------------------------------------------------------------ interaction */
const raycaster = new Raycaster();
const plane = new Plane(new Vector3(0, 1, 0), -R);
const ndc = new Vector2();

function pick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hitBall = raycaster.intersectObjects([...meshes.values()], false)[0];
  const p = new Vector3();
  raycaster.ray.intersectPlane(plane, p);
  return { ballType: hitBall?.object.userData.type ?? null, point: p ? { x: p.x, y: -p.z } : null };
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  if (state.shot) return;
  const { ballType, point } = pick(e);
  if (ballType != null) {
    state.drag = ballType;
    renderer.domElement.setPointerCapture(e.pointerId);
    return;
  }
  if (!point) return;
  const near = POCKETS.find((pk) => Math.hypot(pk.center.x - point.x, pk.center.y - point.y) < pk.radius * 1.8);
  if (near) {
    state.target = near.name;
    state.shot = null;
    state.snapshot = snapshot();
    setResult('–', '');
    updateReadout();
    return;
  }
  state.aimDrag = true;
  setAimToward(point);
  renderer.domElement.setPointerCapture(e.pointerId);
});

renderer.domElement.addEventListener('pointermove', (e) => {
  if (state.shot) return;
  const { point } = pick(e);
  if (!point) return;
  if (state.aimDrag) setAimToward(point);
  else if (state.drag != null) moveBall(state.drag, point);
});

renderer.domElement.addEventListener('pointerup', () => {
  state.drag = null;
  state.aimDrag = false;
  updateReadout();
});

function setAimToward(point) {
  const cue = layout.get(CUE);
  const dx = point.x - cue.x;
  const dy = point.y - cue.y;
  if (Math.hypot(dx, dy) < 1e-4) return;
  state.aim.set(dx, dy).normalize();
}

function moveBall(type, point) {
  const other = [...layout].find(([t]) => t !== type);
  const x = Math.max(-HALF_W + R, Math.min(HALF_W - R, point.x));
  const y = Math.max(-HALF_L + R, Math.min(HALF_L - R, point.y));
  if (other) {
    const [ot, op] = other;
    const dx = x - op.x;
    const dy = y - op.y;
    const d = Math.hypot(dx, dy);
    if (d < 2 * R + 1e-4 && d > 1e-6) {
      const k = (2 * R + 1e-4) / d;
      point = { x: op.x + dx * k, y: op.y + dy * k };
      layout.set(type, { x: point.x, y: point.y });
      state.shot = null;
      return;
    }
  }
  layout.set(type, { x, y });
  state.shot = null;
}

function rotateAim(rad) {
  if (state.shot) return;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  state.aim.set(state.aim.x * c - state.aim.y * s, state.aim.x * s + state.aim.y * c).normalize();
  updateReadout();
}

/* --------------------------------------------------------------- camera */
function camBehind() {
  const a = aimData();
  if (!a) return;
  camera.up.set(0, 1, 0);
  const dir = new Vector3(state.aim.x, 0, -state.aim.y);
  const stand = new Vector3(a.cue.x, 0, -a.cue.y).addScaledVector(dir, -1.25);
  camera.position.set(stand.x, 0.92, stand.z);
  const look = new Vector3(a.ghost.x, 0, -a.ghost.y).lerp(new Vector3(a.pocket.center.x, 0, -a.pocket.center.y), 0.35);
  controls.target.set(look.x, 0.02, look.z);
  controls.update();
}

function camTop() {
  camera.up.set(0, 0, -1);
  camera.position.set(0, 3.35, 0.0001);
  controls.target.set(0, 0, 0);
  controls.update();
}

/* ------------------------------------------------------------------- ui */
document.getElementById('speed').addEventListener('input', (e) => {
  state.speed = Number(e.target.value);
  document.getElementById('speed-out').textContent = state.speed.toFixed(1);
});
document.getElementById('shoot').addEventListener('click', shoot);
document.getElementById('reset').addEventListener('click', resetBalls);
document.getElementById('cam-behind').addEventListener('click', camBehind);
document.getElementById('cam-top').addEventListener('click', camTop);
document.getElementById('aim-ghost').addEventListener('click', () => {
  snapAimToGhost();
  updateReadout();
});
document.getElementById('ghost').addEventListener('click', (e) => {
  state.showGhost = !state.showGhost;
  e.target.textContent = state.showGhost ? 'Ghost on' : 'Ghost off';
});

window.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea')) return;
  if (e.key === 'ArrowLeft') { rotateAim(e.shiftKey ? -5 * Math.PI / 720 : -Math.PI / 720); e.preventDefault(); }
  else if (e.key === 'ArrowRight') { rotateAim(e.shiftKey ? 5 * Math.PI / 720 : Math.PI / 720); e.preventDefault(); }
  else if (e.code === 'Space') { e.preventDefault(); if (!state.shot) shoot(); }
  else if (e.key === 'r' || e.key === 'R') resetBalls();
});

async function loadDrills() {
  const { results } = await api.getDrills();
  const sel = document.getElementById('drill');
  sel.innerHTML = '<option value="">Sandbox</option>' + results.map((d) => `<option value="${d.id}">${d.id} — ${d.name}</option>`).join('');
  sel.addEventListener('change', () => {
    const d = results.find((x) => String(x.id) === sel.value);
    if (d) loadDrill(d);
    else loadSandbox();
  });
}

async function dashboard() {
  const { results } = await api.getDrills();
  const sessions = storage.getSessions();
  const rows = results
    .map((d) => {
      const mine = sessions.filter((s) => String(s.drill) === String(d.id));
      const attempts = mine.flatMap((s) => s.attempts || []);
      const made = attempts.filter((a) => a.ball_pocketed).length;
      const errs = attempts.map((a) => a.error).filter((x) => typeof x === 'number');
      return {
        name: `${d.id} — ${d.name}`,
        sessions: mine.length,
        shots: attempts.length,
        pct: attempts.length ? `${((100 * made) / attempts.length).toFixed(0)}%` : '—',
        err: errs.length ? ((errs.reduce((s, x) => s + Math.abs(x), 0) / errs.length) * 180 / Math.PI).toFixed(1) : '—',
      };
    })
    .filter((r) => r.sessions > 0);
  document.getElementById('stats').innerHTML = rows.length
    ? rows.map((r) => `<tr><td>${r.name}</td><td>${r.sessions}</td><td>${r.shots}</td><td>${r.pct}</td><td>${r.err}</td></tr>`).join('')
    : '<tr><td colspan="5">No sessions yet — play drills on the table page first.</td></tr>';
}

/* ----------------------------------------------------------------- loop */
function resize() {
  const w = view.clientWidth;
  const h = view.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(view);
resize();

let last = performance.now();
function tick(now) {
  const dt = (now - last) / 1000;
  last = now;
  if (state.playing) {
    state.T += dt;
    if (state.T >= state.shot.endT) {
      state.T = state.shot.endT;
      finishShot();
    }
  }
  updateVisuals();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

loadSandbox();
resize();
updateButtons();
requestAnimationFrame(tick);
loadDrills();
dashboard();
