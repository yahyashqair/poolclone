/**
 * Aim trainer sidecar. Top-down ghost-ball + fractions visualizer and
 * drill progress dashboard. No dependency on legacy bundle internals.
 */
import { Simulator, DEFAULT_CONFIG } from './physics/engine.js';
import { api } from './services/api.js';
import { storage } from './services/storage.js';

const R = DEFAULT_CONFIG.ball_radius; // m
const sim = new Simulator();
const pockets = sim.pockets.map(p => ({ name: p.name, x: p.center.x, y: p.center.y }));

const state = {
  cue: { x: 0.3, y: -0.5 },
  obj: { x: -0.2, y: 0.3 },
  pocket: pockets[0],
  drag: null,
};

const canvas = document.getElementById('table');
const ctx = canvas.getContext('2d');
const readout = document.getElementById('readout');

// World (m) -> screen. Table area x:[-0.85,0.85], y:[-0.8,0.8]
const W2S = (x, y) => [
  (x + 0.85) / 1.7 * canvas.width,
  (0.8 - y) / 1.6 * canvas.height,
];
const S2W = (sx, sy) => [
  sx / canvas.width * 1.7 - 0.85,
  0.8 - sy / canvas.height * 1.6,
];
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const norm = v => { const l = Math.hypot(v.x, v.y) || 1; return { x: v.x / l, y: v.y / l }; };
const dot = (a, b) => a.x * b.x + a.y * b.y;

function solve() {
  const toPocket = norm(sub(state.pocket, state.obj));
  const ghost = { x: state.obj.x - toPocket.x * 2 * R, y: state.obj.y - toPocket.y * 2 * R };
  const along = norm(sub(ghost, state.cue));
  const cut = Math.acos(Math.min(1, Math.max(-1, dot(along, toPocket))));
  const fraction = 1 - Math.sin(cut); // 1=full, .5=half-ball (~30°), .25≈48°
  return { ghost, cut, fraction };
}

const REFS = [[1, 'FULL'], [0.75, '3/4'], [0.5, '1/2'], [0.25, '1/4']];
function nearestRef(f) {
  let best = REFS[0];
  for (const r of REFS) if (Math.abs(r[0] - f) < Math.abs(best[0] - f)) best = r;
  return f < 0.15 ? 'THIN' : best[1];
}

function draw() {
  const { ghost } = solve();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const line = (a, b, color, dash = []) => {
    ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(...W2S(a.x, a.y)); ctx.lineTo(...W2S(b.x, b.y)); ctx.stroke();
    ctx.setLineDash([]);
  };
  const ball = (p, color, outline = false) => {
    const [sx, sy] = W2S(p.x, p.y);
    const r = R / 1.7 * canvas.width;
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, 2 * Math.PI);
    if (outline) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
    else { ctx.fillStyle = color; ctx.fill(); }
  };
  // aim + object path
  line(state.cue, ghost, '#fff', [6, 4]);
  line(state.obj, state.pocket, '#fc0');
  // pockets
  for (const p of pockets) {
    const [sx, sy] = W2S(p.x, p.y);
    ctx.beginPath(); ctx.arc(sx, sy, 10, 0, 2 * Math.PI);
    ctx.fillStyle = p === state.pocket ? '#fc0' : '#000';
    ctx.fill();
  }
  ball(ghost, null, true);
  ball(state.obj, '#fcb500');
  ball(state.cue, '#fff');

  const { cut, fraction } = solve();
  readout.innerHTML =
    `Cut <b>${(cut * 180 / Math.PI).toFixed(1)}°</b> · ` +
    `Overlap <b>${fraction.toFixed(2)}</b> → aim <b>${nearestRef(fraction)}</b> · ` +
    `Pocket <b>${state.pocket.name}</b>`;
}

function hit(sx, sy) {
  const [x, y] = S2W(sx, sy);
  const d = (p) => Math.hypot(p.x - x, p.y - y);
  if (d(state.cue) < 3 * R) return 'cue';
  if (d(state.obj) < 3 * R) return 'obj';
  let best = null;
  for (const p of pockets) if (Math.hypot(p.x - x, p.y - y) < 0.09) best = p;
  return best ? { pocket: best } : null;
}

function pos(e) {
  const r = canvas.getBoundingClientRect();
  return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height];
}
canvas.addEventListener('pointerdown', (e) => {
  const [sx, sy] = pos(e);
  const h = hit(sx, sy);
  if (h && h.pocket) { state.pocket = h.pocket; draw(); return; }
  if (h) { state.drag = h; canvas.setPointerCapture(e.pointerId); }
});
canvas.addEventListener('pointermove', (e) => {
  if (!state.drag) return;
  const [x, y] = S2W(...pos(e));
  state[state.drag].x = Math.max(-0.8, Math.min(0.8, x));
  state[state.drag].y = Math.max(-0.6, Math.min(0.6, y));
  draw();
});
canvas.addEventListener('pointerup', () => { state.drag = null; });

async function dashboard() {
  const { results } = await api.getDrills();
  const sessions = storage.getSessions();
  const rows = results.map(d => {
    const mine = sessions.filter(s => String(s.drill) === String(d.id));
    const attempts = mine.flatMap(s => s.attempts || []);
    const made = attempts.filter(a => a.ball_pocketed).length;
    const errs = attempts.map(a => a.error).filter(e => typeof e === 'number');
    return {
      name: `${d.id} — ${d.name}`,
      sessions: mine.length,
      shots: attempts.length,
      pct: attempts.length ? (100 * made / attempts.length).toFixed(0) + '%' : '—',
      err: errs.length ? (errs.reduce((a, b) => a + Math.abs(b), 0) / errs.length * 180 / Math.PI).toFixed(1) : '—',
    };
  }).filter(r => r.sessions > 0);
  const tb = document.querySelector('#stats tbody');
  tb.innerHTML = rows.length
    ? rows.map(r => `<tr><td>${r.name}</td><td>${r.sessions}</td><td>${r.shots}</td><td>${r.pct}</td><td>${r.err}</td></tr>`).join('')
    : `<tr><td colspan="5">No sessions yet — play drills on the table page first.</td></tr>`;
}

draw();
dashboard();
