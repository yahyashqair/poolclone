# MillionBalls - 3D Pool Billiards Simulator

An ultra-realistic, client-side 3D pool and billiards simulator running entirely in modern web browsers using **Three.js** and **Vue 3**.

🎮 **[Play Live on GitHub Pages](https://yahyashqair.github.io/poolclone/)**

---

## Features

- **Realistic Billiard Physics**:
  - Continuous Collision Detection (CCD) preventing ball tunneling through cushions or balls.
  - Full two-phase friction transition: sliding friction (Coulomb model) seamlessly transitioning to pure rolling motion.
  - Cut-induced throw and ball-ball dynamic friction.
  - Spin dynamics: English, draw, follow, and cue deflection / squirt angle.
  - Realistic cushion rebound with non-linear restitution and vertical damping.
  - Accurate pocket mouth geometry, slate shelf, and drop behavior.
- **Practice Drills & Achievements**:
  - 14 practice drills covering rail cuts, back-cuts, spot shots, and corner cuts.
  - In-browser drill tracking, streak counters, and achievements.
- **Interactive Tutorials**:
  - Step-by-step guided lessons with 3D table demonstrations:
    - Basic Pool Concepts & Terminology (full hits, cut shots, undercutting, overcutting)
    - Touchscreen Controls & Stance
    - Keyboard Controls
    - The Ghost-Ball Aiming Method
- **100% Client-Side & Offline-Ready**:
  - Zero backend requirements.
  - Local persistence via `localStorage` for drill history, favorites, and settings.
  - Deployed directly to GitHub Pages.

---

## Architecture & Code Structure

The project is structured according to modern modular standards:

```text
poolclone/
├── public/                 # Static assets copied directly to build output
│   ├── .nojekyll           # Bypasses Jekyll on GitHub Pages
│   ├── 404.html            # SPA fallback & hash redirector
│   ├── favicon.ico
│   ├── checker.png         # 3D floor texture
│   ├── logo-light.svg
│   └── tutorials/          # Step-by-step lesson JSON files
│
├── src/
│   ├── data/               # Static game data
│   │   ├── drills.json     # 14 billiard drill layouts & objectives
│   │   └── tutorials/      # Tutorial lesson definitions
│   │
│   ├── physics/            # Pure Mathematical Physics Engine (Untouched & Verified)
│   │   ├── constants.js    # Standard WPA table, ball, cue, & friction parameters
│   │   ├── engine.js       # Continuous collision solver, Ball, Cue, Simulator
│   │   └── index.js        # Physics module export barrel
│   │
│   ├── graphics/           # Three.js 3D Visual Rendering Layer
│   │   ├── balls.js        # Dynamic HTML5 canvas texture generator (1-15 & cue ball)
│   │   └── table.js        # 3D table visual specifications, cloth colors, & room
│   │
│   ├── services/           # Application Services
│   │   ├── api.js          # Client-side API router
│   │   └── storage.js      # LocalStorage persistence manager
│   │
│   └── styles/
│       └── main.css        # Core stylesheet
│
├── index.html              # HTML entry point
├── package.json            # Dependencies, scripts, and metadata
├── vite.config.js          # Vite build configuration (base: './')
└── README.md
```

---

## Physics Engine Deep Dive

The core physics engine (`src/physics/engine.js`) implements realistic physics modeling:

### 1. Physical Units
All calculations use standard SI units:
- Length: meters ($1\text{ in} = 0.0254\text{ m}$)
- Mass: kilograms ($1\text{ oz} = 0.02834952\text{ kg}$)
- Angles: radians
- Standard Tournament Specs: 100-inch table bed length, 2.25-inch balls (170g), 19oz cue.

### 2. Motion States (`BallState`)
A ball transitions through discrete physical states:
- `Stationary`: Zero linear and angular velocity.
- `Sliding`: Relative velocity at contact point with cloth $\mathbf{v}_{rel} = \mathbf{v} + \mathbf{\omega} \times \mathbf{r} \neq 0$. Coulomb friction accelerates rotation until $\mathbf{v} = R\omega$.
- `Rolling`: Contact point has zero relative velocity; ball decelerates due to rolling resistance.
- `Spinning`: Ball has pure vertical z-axis rotation that decays from cloth friction.
- `Flying`: Airborne ballistic trajectory under gravity ($g = 9.80665\text{ m/s}^2$).
- `Pocketed`: Fall into pocket aperture below table slate bed.

### 3. Continuous Collision Detection (CCD)
Unlike discrete tick-based physics, the simulator computes exact polynomial time-of-impact (TOI) roots:
- Solves for ball-ball collision time $t$ where $\|\mathbf{p}_A(t) - \mathbf{p}_B(t)\| = 2R$.
- Solves for ball-cushion line and corner-arc impact times.
- Advance simulation to the earliest event, resolves momentum transfer, and continues.

---

## Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation
```bash
git clone https://github.com/yahyashqair/poolclone.git
cd poolclone
npm install
```

### Development Server
Run Vite with hot-module reload:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Production Build
Build optimized bundle for deployment:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## Controls

### Keyboard
| Action | Key |
| :--- | :--- |
| **Move Around Table** | Left / Right Arrow Keys |
| **Drop into Shooting Stance** | Space or C |
| **Stand Up from Stance** | C |
| **Fine Aim** | Left / Right Arrow Keys (while down) |
| **Take Shot** | Spacebar (while down) |
| **Keyboard Help** | ? |

### Touchscreen
- **Standing**: Drag the movement joystick left or right to circle the cue ball. Tap joystick to drop down into shooting stance.
- **Shooting Stance**: Drag fine-aim joystick to micro-adjust angle. Tap bullseye button to strike the cue ball.

---

## Adding Custom Drills

You can add new practice drills by adding an entry to `src/data/drills.json`:

```json
{
  "id": 16,
  "name": "Corner Pocket Bank Shot",
  "description": "Bank the 8-ball off the long rail into the corner pocket.",
  "layout": {
    "balls": [
      { "type": "cue_ball", "position": { "x": 0, "y": -20 } },
      { "type": 8, "position": { "x": -10, "y": 10 } }
    ]
  },
  "goal": { "ball": 8, "pocket": "bottom-right" }
}
```

---

## License

ISC License.
