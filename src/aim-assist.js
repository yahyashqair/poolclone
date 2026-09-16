/**
 * In-game aim aids.
 *
 * Uses the ORIGINAL game: same table, same camera, same simulator. Finds the
 * live `SimulatorView` component and exposes its own built-in aids — ghost ball,
 * target marker, and the real shot preview (the game simulates the shot and
 * draws the predicted paths).
 *
 * Nothing is re-implemented here. Props are only forced for toggles the user
 * explicitly changed, so tutorials keep their scripted progression
 * (`show: ["target","preview","ghost"]` steps) untouched.
 */

const STORAGE_KEY = 'mb_aim_aids';
const TOGGLES = [
  ['ghost', 'Ghost ball'],
  ['target', 'Target marker'],
  ['preview', 'Shot preview'],
];

// only keys the user has flipped; empty = leave the game alone
let overrides = {};
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved && typeof saved === 'object') overrides = saved;
} catch {}

/* ------------------------------------------------------------- discovery */
// Production Vue doesn't set `app._instance`, but the renderer always stores
// the root vnode on the mount container (`container._vnode`).
function findSimView() {
  const root = document.querySelector('#app')?._vnode;
  const rootInstance = root && root.component;
  if (!rootInstance) return null;

  let found = null;
  const seen = new Set();

  const visitVNode = (vnode, depth) => {
    if (!vnode || found || depth > 24 || typeof vnode !== 'object') return;
    if (vnode.component) visitInstance(vnode.component, depth + 1);
    const kids = vnode.children;
    if (Array.isArray(kids)) kids.forEach((k) => visitVNode(k, depth));
    else if (kids && typeof kids === 'object') {
      for (const key in kids) {
        const slot = kids[key];
        if (typeof slot !== 'function') continue;
        try {
          const rendered = slot({});
          (Array.isArray(rendered) ? rendered : [rendered]).forEach((k) => visitVNode(k, depth));
        } catch {}
      }
    }
  };

  const visitInstance = (instance, depth) => {
    if (!instance || found || seen.has(instance)) return;
    seen.add(instance);
    const type = instance.type;
    if (type && (type.__name === 'SimulatorView' || type.name === 'SimulatorView')) {
      found = instance;
      return;
    }
    visitVNode(instance.subTree, depth);
  };

  visitInstance(rootInstance, 0);
  return found;
}

/* ------------------------------------------------------------------ panel */
let panel = null;
const boxes = new Map();
let lastInstance = null;

function buildPanel() {
  panel = document.createElement('div');
  panel.id = 'mb-aim-aids';
  panel.style.cssText = [
    'position:fixed', 'left:12px', 'bottom:12px', 'z-index:60',
    'background:rgba(6,20,32,.88)', 'border:1px solid #2b3d4d', 'border-radius:10px',
    'padding:10px 12px', 'font:12px/1.6 Arial,Helvetica,sans-serif', 'color:#e8eef4',
    'min-width:158px', 'user-select:none',
  ].join(';');

  const title = document.createElement('div');
  title.textContent = 'Aim aids';
  title.style.cssText = 'font-weight:700;margin-bottom:4px;color:#ffc62b';
  panel.appendChild(title);

  for (const [key, label] of TOGGLES) {
    const row = document.createElement('label');
    row.style.cssText = 'display:flex;gap:8px;align-items:center;cursor:pointer';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.addEventListener('change', () => {
      overrides[key] = box.checked;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      } catch {}
      apply();
    });
    const text = document.createElement('span');
    text.textContent = label;
    row.append(box, text);
    panel.appendChild(row);
    boxes.set(key, box);
  }

  const hint = document.createElement('div');
  hint.textContent = 'Preview shows while standing.';
  hint.style.cssText = 'margin-top:4px;color:#8fa3b3';
  panel.appendChild(hint);

  const link = document.createElement('a');
  link.href = './trainer.html';
  link.textContent = 'Shot lab →';
  link.style.cssText = 'display:inline-block;margin-top:4px;color:#7dd3fc';
  panel.appendChild(link);

  document.body.appendChild(panel);
}

/* ------------------------------------------------------------------ apply */
function apply() {
  const inst = findSimView();
  if (!inst) {
    if (panel) panel.style.display = 'none';
    lastInstance = null;
    return;
  }
  if (!panel) buildPanel();
  panel.style.display = 'block';

  // reflect the live props when (re)entering a simulator screen
  if (lastInstance !== inst) {
    lastInstance = inst;
    for (const [key, box] of boxes) {
      const value = key in overrides ? overrides[key] : !!inst.props[`show${key[0].toUpperCase()}${key.slice(1)}`];
      if (box.checked !== value) box.checked = value;
    }
  }

  const props = inst.props;
  const names = { ghost: 'showGhost', target: 'showTarget', preview: 'showShotPreview' };
  for (const [key, prop] of Object.entries(names)) {
    if (key in overrides && props[prop] !== overrides[key]) props[prop] = overrides[key];
  }
}

setInterval(apply, 400);
apply();
