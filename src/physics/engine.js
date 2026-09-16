/**
 * Billiard Physics Simulation Engine — FROZEN VENDOR COPY. DO NOT EDIT.
 * Extracted from legacy bundle; minified identifiers kept as-is.
 * Tune via ./constants.js or wrappers, never here.
 * Public surface: named exports + default at file end (Simulator, Ball, Cue, ...).
 */

import { Vector2, Vector3, Quaternion, Matrix4 } from 'three';

// Map Three.js math classes to physics engine identifiers
const gt = Vector2;
const U = Vector3;
const vs = Quaternion;
const pe = Matrix4;
const pt = (e, t, n) => { e[t] = n; };

const ge = 0.0254,
  i2 = 12 * ge,
  xn = 0.01,
  We = 0.001,
  Je = Math.PI / 180,
  zg = 0.02834952,
  s2 = 0.001,
  Nc = 1,
  ui = 1,
  Qn = 0.001;
let cy = {
  table_length: 100 * ge,
  corner_pocket_size: 4.5 * ge,
  side_pocket_size: 5 * ge,
  corner_facing_angle: 140 * Je,
  side_facing_angle: 104 * Je,
  pocket_hole_radius: 3.25 * ge,
  corner_pocket_shelf: 2 * ge,
  side_pocket_shelf: 0.375 * ge,
  cushion_corner_radius: 0.25 * ge,
  cushion_width: 2 * ge,
  cushion_nose_height: 0.635 * 2.25 * ge,
  cushion_back_height: 1.6 * ge,
  ball_radius: 0.5 * 2.25 * ge,
  ball_mass: 6 * zg,
  cue: {
    tip_radius: 0.5 * 21.21 * We,
    shaft_radius: 0.5 * 12 * We,
    mass: 19 * zg,
    endmass: 5 * s2,
    taper_length: 10 * ge,
    shaft_length: 29 * ge,
    joint_radius: 0.5 * 21.5 * We,
    butt_radius: 0.5 * 31.5 * We,
    butt_length: 29 * ge,
  },
  stroke: {
    max_speed: 4.5 * Nc,
    max_backswing: 12 * ge,
    practice_strokes: [0.75, 0.5, 0.25],
    pre_backswing_pause: 750 * Qn,
    backswing_accel_time: 200 * Qn,
    backswing_speed: 0.5 * Nc,
    backswing_pause: 100 * Qn,
    followthrough_time: 150 * Qn,
  },
  gravitational_acceleration: 9.80665,
  ball_ball_friction: 0.05,
  ball_cloth_friction: 0.2,
  ball_rail_friction: 0.2,
  rolling_resistance: 0.01,
  ball_ball_cor: 0.95,
  ball_rail_cor: 0.75,
  ball_table_cor: 0.5,
  min_bounce_height: 1 * We,
};
const uy = 1e-9;
function Sn(e, t = uy) {
  return e > -t && e < t;
}
function $n(e, t, n = uy) {
  return Sn(e - t, n);
}
function io(e, t = 0) {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}
class wi {
  constructor(t, n) {
    pt(this, "real");
    pt(this, "imag");
    ((this.real = t), (this.imag = n));
  }
  add(t) {
    return t instanceof wi
      ? new wi(this.real + t.real, this.imag + t.imag)
      : new wi(this.real + t, this.imag);
  }
  mul(t) {
    return t instanceof wi
      ? new wi(
          this.real * t.real - this.imag * t.imag,
          this.real * t.imag + this.imag * t.real,
        )
      : new wi(this.real * t, this.imag * t);
  }
}
function Vf(e) {
  let t = [];
  for (let n of e)
    typeof n == "number" ? t.push(n) : Sn(n.imag) && t.push(n.real);
  return t;
}
class Zd {
  constructor(t) {
    this.coeffs = t;
  }
  value(t) {
    return this.coeffs.reduceRight(
      ([n, i], s) => [n + s * i, i * t],
      [0, 1],
    )[0];
  }
  derivative() {
    let t = this.coeffs.map((n, i) => (this.coeffs.length - 1 - i) * n);
    return (t.pop(), new Zd(t));
  }
}
function hy(e, t, n) {
  const i = t / e,
    s = n / e,
    r = -0.5 * i;
  let o = r * r - s,
    a;
  o < 0 && ((a = !0), (o = -o));
  let l = Math.sqrt(o);
  return a ? [new wi(r, l), new wi(r, -l)] : [r + l, r - l];
}
function fy(e, t, n, i) {
  const s = t / e,
    r = n / e,
    o = i / e,
    a = 1 / 3,
    l = s * a,
    c = l * l,
    u = Math.sqrt(3),
    h = a * r - c,
    f = l * (2 * c - r) + o,
    d = 0.25 * f * f + h * h * h;
  if (h == 0 && f == 0 && d == 0) {
    const p = -Math.cbrt(o);
    return [p, p, p];
  } else if (d <= 0) {
    const p = Math.sqrt(-h),
      g = Math.acos((-0.5 * f) / (p * p * p)),
      _ = Math.cos(a * g),
      m = u * Math.sin(a * g);
    return [2 * p * _ - l, -p * (_ + m) - l, -p * (_ - m) - l];
  } else {
    const p = Math.sqrt(d),
      g = Math.cbrt(-0.5 * f + p),
      _ = Math.cbrt(-0.5 * f - p),
      m = g + _,
      b = g - _;
    return [
      m - l,
      new wi(-0.5 * m - l, b * u * 0.5),
      new wi(-0.5 * m - l, -b * u * 0.5),
    ];
  }
}
function r2(e, t, n, i, s) {
  const r = t / e,
    o = n / e,
    a = i / e,
    l = s / e,
    c = (8 * o - 3 * r * r) / 8,
    u = (r * r * r - 4 * r * o + 8 * a) / 8,
    h = (-3 * r * r * r * r + 16 * r * r * o - 64 * r * a + 256 * l) / 256,
    f = -r / 4,
    d = c,
    p = (2 * c * c - 8 * h) / 8,
    g = -(u * u) / 8;
  let _ = [];
  if (Sn(g)) {
    const m = c * c - 4 * h;
    if (m < 0) return [];
    const b = Math.sqrt(m);
    return (
      [b, -b].forEach((y) => {
        const x = (-c + y) / 2;
        if (x >= 0) {
          let D = Math.sqrt(x);
          (_.push(f + D), _.push(f - D));
        }
      }),
      _
    );
  } else {
    const m = fy(1, d, p, g)[0],
      b = Math.sqrt(2 * m);
    if (Sn(m)) throw new Error("Zeroish root");
    [b, -b].forEach((y) => {
      const x = -2 * (c + m + u / y);
      if (x >= 0) {
        const D = Math.sqrt(x);
        (_.push(f + (y + D) / 2), _.push(f + (y - D) / 2));
      }
    });
  }
  return _;
}
function o2(e, t, n = { maxiter: 10, threshold: 1e-15 }) {
  let i = new Zd(e),
    s = i.derivative();
  return t.map((r) => {
    for (let o = 0; o < n.maxiter; ++o) {
      let a = i.value(r);
      if (a > -n.threshold && a < n.threshold) break;
      let l = s.value(r);
      if (Sn(l)) {
        console.warn(`${e}: Got zeroish derivative improving root ${r}`);
        break;
      }
      r -= a / l;
    }
    return r;
  });
}
function la(e, t) {
  return Math.sqrt(e ** 2 - t ** 2);
}
function Uc(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
new U(1, 0, 0);
new U(0, 1, 0);
const Gi = new U(0, 0, 1);
function zi(e, t) {
  return new U(e.x, e.y, t);
}
function ve(e) {
  return new gt(e.x, e.y);
}
function Ge(e, t) {
  return t.clone().sub(e).normalize();
}
function a2(e, t, n) {
  const i = e.distanceTo(t),
    s = e.distanceTo(n),
    r = t.distanceTo(n),
    o = Ge(t, n);
  let a = (r * i) / (s + i);
  return t.clone().addScaledVector(o, a);
}
function Hf(e, t) {
  const n = e.clone().projectOnVector(t),
    i = e.clone().sub(n);
  return [n, i];
}
function Vg(e, t) {
  return $n(e.dot(t) / (e.length() * t.length()), -1);
}
function Eh(e) {
  return !e.x && !e.y && !e.z;
}
function Ar(e) {
  let t = Sn(e.x) && Sn(e.y);
  return "z" in e ? t && Sn(e.z) : t;
}
function l2(e, t) {
  let n = $n(e.x, t.x) && $n(e.y, t.y);
  return "z" in e && "z" in t ? n && $n(e.z, t.z) : n;
}
function ea(e) {
  return Ar(e) ? new U() : e;
}
function dy(e, t) {
  let n = Math.atan2(e.x * t.y - e.y * t.x, e.x * t.x + e.y * t.y);
  return (n < 0 && (n += Math.PI * 2), n);
}
function Hg(e, t, n) {
  return e.clone().sub(t).angleTo(n.clone().sub(t));
}
const py = 6048e5,
  c2 = 864e5,
  Gg = Symbol.for("constructDateFrom");
function ei(e, t) {
  return typeof e == "function"
    ? e(t)
    : e && typeof e == "object" && Gg in e
      ? e[Gg](t)
      : e instanceof Date
        ? new e.constructor(t)
        : new Date(t);
}
function mi(e, t) {
  return ei(t || e, e);
}
function u2(e, t, n) {
  const i = mi(e, n == null ? void 0 : n.in);
  return isNaN(t) ? ei(e, NaN) : (i.setDate(i.getDate() + t), i);
}
let h2 = {};
function yu() {
  return h2;
}
function Wa(e, t) {
  var a, l, c, u;
  const n = yu(),
    i =
      (t == null ? void 0 : t.weekStartsOn) ??
      ((l = (a = t == null ? void 0 : t.locale) == null ? void 0 : a.options) ==
      null
        ? void 0
        : l.weekStartsOn) ??
      n.weekStartsOn ??
      ((u = (c = n.locale) == null ? void 0 : c.options) == null
        ? void 0
        : u.weekStartsOn) ??
      0,
    s = mi(e, t == null ? void 0 : t.in),
    r = s.getDay(),
    o = (r < i ? 7 : 0) + r - i;
  return (s.setDate(s.getDate() - o), s.setHours(0, 0, 0, 0), s);
}
function Fc(e, t) {
  return Wa(e, { ...t, weekStartsOn: 1 });
}
function my(e, t) {
  const n = mi(e, t == null ? void 0 : t.in),
    i = n.getFullYear(),
    s = ei(n, 0);
  (s.setFullYear(i + 1, 0, 4), s.setHours(0, 0, 0, 0));
  const r = Fc(s),
    o = ei(n, 0);
  (o.setFullYear(i, 0, 4), o.setHours(0, 0, 0, 0));
  const a = Fc(o);
  return n.getTime() >= r.getTime()
    ? i + 1
    : n.getTime() >= a.getTime()
      ? i
      : i - 1;
}
function Wg(e) {
  const t = mi(e),
    n = new Date(
      Date.UTC(
        t.getFullYear(),
        t.getMonth(),
        t.getDate(),
        t.getHours(),
        t.getMinutes(),
        t.getSeconds(),
        t.getMilliseconds(),
      ),
    );
  return (n.setUTCFullYear(t.getFullYear()), +e - +n);
}
function Kd(e, ...t) {
  const n = ei.bind(
    null,
    t.find((i) => typeof i == "object"),
  );
  return t.map(n);
}
function Oc(e, t) {
  const n = mi(e, t == null ? void 0 : t.in);
  return (n.setHours(0, 0, 0, 0), n);
}
function f2(e, t, n) {
  const [i, s] = Kd(n == null ? void 0 : n.in, e, t),
    r = Oc(i),
    o = Oc(s),
    a = +r - Wg(r),
    l = +o - Wg(o);
  return Math.round((a - l) / c2);
}
function d2(e, t) {
  const n = my(e, t),
    i = ei(e, 0);
  return (i.setFullYear(n, 0, 4), i.setHours(0, 0, 0, 0), Fc(i));
}
function Jd(e) {
  return ei(e, Date.now());
}
function gy(e, t, n) {
  const [i, s] = Kd(n == null ? void 0 : n.in, e, t);
  return +Oc(i) == +Oc(s);
}
function p2(e) {
  return (
    e instanceof Date ||
    (typeof e == "object" &&
      Object.prototype.toString.call(e) === "[object Date]")
  );
}
function m2(e) {
  return !((!p2(e) && typeof e != "number") || isNaN(+mi(e)));
}
function g2(e, t) {
  const n = mi(e, t == null ? void 0 : t.in);
  return (n.setFullYear(n.getFullYear(), 0, 1), n.setHours(0, 0, 0, 0), n);
}
const _2 = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds",
    },
    xSeconds: { one: "1 second", other: "{{count}} seconds" },
    halfAMinute: "half a minute",
    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes",
    },
    xMinutes: { one: "1 minute", other: "{{count}} minutes" },
    aboutXHours: { one: "about 1 hour", other: "about {{count}} hours" },
    xHours: { one: "1 hour", other: "{{count}} hours" },
    xDays: { one: "1 day", other: "{{count}} days" },
    aboutXWeeks: { one: "about 1 week", other: "about {{count}} weeks" },
    xWeeks: { one: "1 week", other: "{{count}} weeks" },
    aboutXMonths: { one: "about 1 month", other: "about {{count}} months" },
    xMonths: { one: "1 month", other: "{{count}} months" },
    aboutXYears: { one: "about 1 year", other: "about {{count}} years" },
    xYears: { one: "1 year", other: "{{count}} years" },
    overXYears: { one: "over 1 year", other: "over {{count}} years" },
    almostXYears: { one: "almost 1 year", other: "almost {{count}} years" },
  },
  v2 = (e, t, n) => {
    let i;
    const s = _2[e];
    return (
      typeof s == "string"
        ? (i = s)
        : t === 1
          ? (i = s.one)
          : (i = s.other.replace("{{count}}", t.toString())),
      n != null && n.addSuffix
        ? n.comparison && n.comparison > 0
          ? "in " + i
          : i + " ago"
        : i
    );
  };
function Th(e) {
  return (t = {}) => {
    const n = t.width ? String(t.width) : e.defaultWidth;
    return e.formats[n] || e.formats[e.defaultWidth];
  };
}
const y2 = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy",
  },
  x2 = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a",
  },
  b2 = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}",
  },
  S2 = {
    date: Th({ formats: y2, defaultWidth: "full" }),
    time: Th({ formats: x2, defaultWidth: "full" }),
    dateTime: Th({ formats: b2, defaultWidth: "full" }),
  },
  M2 = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P",
  },
  w2 = (e, t, n, i) => M2[e];
function na(e) {
  return (t, n) => {
    const i = n != null && n.context ? String(n.context) : "standalone";
    let s;
    if (i === "formatting" && e.formattingValues) {
      const o = e.defaultFormattingWidth || e.defaultWidth,
        a = n != null && n.width ? String(n.width) : o;
      s = e.formattingValues[a] || e.formattingValues[o];
    } else {
      const o = e.defaultWidth,
        a = n != null && n.width ? String(n.width) : e.defaultWidth;
      s = e.values[a] || e.values[o];
    }
    const r = e.argumentCallback ? e.argumentCallback(t) : t;
    return s[r];
  };
}
const E2 = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"],
  },
  T2 = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"],
  },
  A2 = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    wide: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  C2 = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  },
  R2 = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
  },
  P2 = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
  },
  D2 = (e, t) => {
    const n = Number(e),
      i = n % 100;
    if (i > 20 || i < 10)
      switch (i % 10) {
        case 1:
          return n + "st";
        case 2:
          return n + "nd";
        case 3:
          return n + "rd";
      }
    return n + "th";
  },
  L2 = {
    ordinalNumber: D2,
    era: na({ values: E2, defaultWidth: "wide" }),
    quarter: na({
      values: T2,
      defaultWidth: "wide",
      argumentCallback: (e) => e - 1,
    }),
    month: na({ values: A2, defaultWidth: "wide" }),
    day: na({ values: C2, defaultWidth: "wide" }),
    dayPeriod: na({
      values: R2,
      defaultWidth: "wide",
      formattingValues: P2,
      defaultFormattingWidth: "wide",
    }),
  };
function ia(e) {
  return (t, n = {}) => {
    const i = n.width,
      s = (i && e.matchPatterns[i]) || e.matchPatterns[e.defaultMatchWidth],
      r = t.match(s);
    if (!r) return null;
    const o = r[0],
      a = (i && e.parsePatterns[i]) || e.parsePatterns[e.defaultParseWidth],
      l = Array.isArray(a) ? N2(a, (h) => h.test(o)) : I2(a, (h) => h.test(o));
    let c;
    ((c = e.valueCallback ? e.valueCallback(l) : l),
      (c = n.valueCallback ? n.valueCallback(c) : c));
    const u = t.slice(o.length);
    return { value: c, rest: u };
  };
}
function I2(e, t) {
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && t(e[n])) return n;
}
function N2(e, t) {
  for (let n = 0; n < e.length; n++) if (t(e[n])) return n;
}
function U2(e) {
  return (t, n = {}) => {
    const i = t.match(e.matchPattern);
    if (!i) return null;
    const s = i[0],
      r = t.match(e.parsePattern);
    if (!r) return null;
    let o = e.valueCallback ? e.valueCallback(r[0]) : r[0];
    o = n.valueCallback ? n.valueCallback(o) : o;
    const a = t.slice(s.length);
    return { value: o, rest: a };
  };
}
const F2 = /^(\d+)(th|st|nd|rd)?/i,
  O2 = /\d+/i,
  k2 = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i,
  },
  B2 = { any: [/^b/i, /^(a|c)/i] },
  z2 = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i,
  },
  V2 = { any: [/1/i, /2/i, /3/i, /4/i] },
  H2 = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
  },
  G2 = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],
    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^ap/i,
      /^may/i,
      /^jun/i,
      /^jul/i,
      /^au/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],
  },
  W2 = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i,
  },
  $2 = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i],
  },
  X2 = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i,
  },
  q2 = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i,
    },
  },
  j2 = {
    ordinalNumber: U2({
      matchPattern: F2,
      parsePattern: O2,
      valueCallback: (e) => parseInt(e, 10),
    }),
    era: ia({
      matchPatterns: k2,
      defaultMatchWidth: "wide",
      parsePatterns: B2,
      defaultParseWidth: "any",
    }),
    quarter: ia({
      matchPatterns: z2,
      defaultMatchWidth: "wide",
      parsePatterns: V2,
      defaultParseWidth: "any",
      valueCallback: (e) => e + 1,
    }),
    month: ia({
      matchPatterns: H2,
      defaultMatchWidth: "wide",
      parsePatterns: G2,
      defaultParseWidth: "any",
    }),
    day: ia({
      matchPatterns: W2,
      defaultMatchWidth: "wide",
      parsePatterns: $2,
      defaultParseWidth: "any",
    }),
    dayPeriod: ia({
      matchPatterns: X2,
      defaultMatchWidth: "any",
      parsePatterns: q2,
      defaultParseWidth: "any",
    }),
  },
  Y2 = {
    code: "en-US",
    formatDistance: v2,
    formatLong: S2,
    formatRelative: w2,
    localize: L2,
    match: j2,
    options: { weekStartsOn: 0, firstWeekContainsDate: 1 },
  };
function Z2(e, t) {
  const n = mi(e, t == null ? void 0 : t.in);
  return f2(n, g2(n)) + 1;
}
function K2(e, t) {
  const n = mi(e, t == null ? void 0 : t.in),
    i = +Fc(n) - +d2(n);
  return Math.round(i / py) + 1;
}
function _y(e, t) {
  var u, h, f, d;
  const n = mi(e, t == null ? void 0 : t.in),
    i = n.getFullYear(),
    s = yu(),
    r =
      (t == null ? void 0 : t.firstWeekContainsDate) ??
      ((h = (u = t == null ? void 0 : t.locale) == null ? void 0 : u.options) ==
      null
        ? void 0
        : h.firstWeekContainsDate) ??
      s.firstWeekContainsDate ??
      ((d = (f = s.locale) == null ? void 0 : f.options) == null
        ? void 0
        : d.firstWeekContainsDate) ??
      1,
    o = ei((t == null ? void 0 : t.in) || e, 0);
  (o.setFullYear(i + 1, 0, r), o.setHours(0, 0, 0, 0));
  const a = Wa(o, t),
    l = ei((t == null ? void 0 : t.in) || e, 0);
  (l.setFullYear(i, 0, r), l.setHours(0, 0, 0, 0));
  const c = Wa(l, t);
  return +n >= +a ? i + 1 : +n >= +c ? i : i - 1;
}
function J2(e, t) {
  var a, l, c, u;
  const n = yu(),
    i =
      (t == null ? void 0 : t.firstWeekContainsDate) ??
      ((l = (a = t == null ? void 0 : t.locale) == null ? void 0 : a.options) ==
      null
        ? void 0
        : l.firstWeekContainsDate) ??
      n.firstWeekContainsDate ??
      ((u = (c = n.locale) == null ? void 0 : c.options) == null
        ? void 0
        : u.firstWeekContainsDate) ??
      1,
    s = _y(e, t),
    r = ei((t == null ? void 0 : t.in) || e, 0);
  return (r.setFullYear(s, 0, i), r.setHours(0, 0, 0, 0), Wa(r, t));
}
function Q2(e, t) {
  const n = mi(e, t == null ? void 0 : t.in),
    i = +Wa(n, t) - +J2(n, t);
  return Math.round(i / py) + 1;
}
function Le(e, t) {
  const n = e < 0 ? "-" : "",
    i = Math.abs(e).toString().padStart(t, "0");
  return n + i;
}
const Rs = {
    y(e, t) {
      const n = e.getFullYear(),
        i = n > 0 ? n : 1 - n;
      return Le(t === "yy" ? i % 100 : i, t.length);
    },
    M(e, t) {
      const n = e.getMonth();
      return t === "M" ? String(n + 1) : Le(n + 1, 2);
    },
    d(e, t) {
      return Le(e.getDate(), t.length);
    },
    a(e, t) {
      const n = e.getHours() / 12 >= 1 ? "pm" : "am";
      switch (t) {
        case "a":
        case "aa":
          return n.toUpperCase();
        case "aaa":
          return n;
        case "aaaaa":
          return n[0];
        case "aaaa":
        default:
          return n === "am" ? "a.m." : "p.m.";
      }
    },
    h(e, t) {
      return Le(e.getHours() % 12 || 12, t.length);
    },
    H(e, t) {
      return Le(e.getHours(), t.length);
    },
    m(e, t) {
      return Le(e.getMinutes(), t.length);
    },
    s(e, t) {
      return Le(e.getSeconds(), t.length);
    },
    S(e, t) {
      const n = t.length,
        i = e.getMilliseconds(),
        s = Math.trunc(i * Math.pow(10, n - 3));
      return Le(s, t.length);
    },
  },
  Zr = {
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  },
  $g = {
    G: function (e, t, n) {
      const i = e.getFullYear() > 0 ? 1 : 0;
      switch (t) {
        case "G":
        case "GG":
        case "GGG":
          return n.era(i, { width: "abbreviated" });
        case "GGGGG":
          return n.era(i, { width: "narrow" });
        case "GGGG":
        default:
          return n.era(i, { width: "wide" });
      }
    },
    y: function (e, t, n) {
      if (t === "yo") {
        const i = e.getFullYear(),
          s = i > 0 ? i : 1 - i;
        return n.ordinalNumber(s, { unit: "year" });
      }
      return Rs.y(e, t);
    },
    Y: function (e, t, n, i) {
      const s = _y(e, i),
        r = s > 0 ? s : 1 - s;
      if (t === "YY") {
        const o = r % 100;
        return Le(o, 2);
      }
      return t === "Yo"
        ? n.ordinalNumber(r, { unit: "year" })
        : Le(r, t.length);
    },
    R: function (e, t) {
      const n = my(e);
      return Le(n, t.length);
    },
    u: function (e, t) {
      const n = e.getFullYear();
      return Le(n, t.length);
    },
    Q: function (e, t, n) {
      const i = Math.ceil((e.getMonth() + 1) / 3);
      switch (t) {
        case "Q":
          return String(i);
        case "QQ":
          return Le(i, 2);
        case "Qo":
          return n.ordinalNumber(i, { unit: "quarter" });
        case "QQQ":
          return n.quarter(i, { width: "abbreviated", context: "formatting" });
        case "QQQQQ":
          return n.quarter(i, { width: "narrow", context: "formatting" });
        case "QQQQ":
        default:
          return n.quarter(i, { width: "wide", context: "formatting" });
      }
    },
    q: function (e, t, n) {
      const i = Math.ceil((e.getMonth() + 1) / 3);
      switch (t) {
        case "q":
          return String(i);
        case "qq":
          return Le(i, 2);
        case "qo":
          return n.ordinalNumber(i, { unit: "quarter" });
        case "qqq":
          return n.quarter(i, { width: "abbreviated", context: "standalone" });
        case "qqqqq":
          return n.quarter(i, { width: "narrow", context: "standalone" });
        case "qqqq":
        default:
          return n.quarter(i, { width: "wide", context: "standalone" });
      }
    },
    M: function (e, t, n) {
      const i = e.getMonth();
      switch (t) {
        case "M":
        case "MM":
          return Rs.M(e, t);
        case "Mo":
          return n.ordinalNumber(i + 1, { unit: "month" });
        case "MMM":
          return n.month(i, { width: "abbreviated", context: "formatting" });
        case "MMMMM":
          return n.month(i, { width: "narrow", context: "formatting" });
        case "MMMM":
        default:
          return n.month(i, { width: "wide", context: "formatting" });
      }
    },
    L: function (e, t, n) {
      const i = e.getMonth();
      switch (t) {
        case "L":
          return String(i + 1);
        case "LL":
          return Le(i + 1, 2);
        case "Lo":
          return n.ordinalNumber(i + 1, { unit: "month" });
        case "LLL":
          return n.month(i, { width: "abbreviated", context: "standalone" });
        case "LLLLL":
          return n.month(i, { width: "narrow", context: "standalone" });
        case "LLLL":
        default:
          return n.month(i, { width: "wide", context: "standalone" });
      }
    },
    w: function (e, t, n, i) {
      const s = Q2(e, i);
      return t === "wo"
        ? n.ordinalNumber(s, { unit: "week" })
        : Le(s, t.length);
    },
    I: function (e, t, n) {
      const i = K2(e);
      return t === "Io"
        ? n.ordinalNumber(i, { unit: "week" })
        : Le(i, t.length);
    },
    d: function (e, t, n) {
      return t === "do"
        ? n.ordinalNumber(e.getDate(), { unit: "date" })
        : Rs.d(e, t);
    },
    D: function (e, t, n) {
      const i = Z2(e);
      return t === "Do"
        ? n.ordinalNumber(i, { unit: "dayOfYear" })
        : Le(i, t.length);
    },
    E: function (e, t, n) {
      const i = e.getDay();
      switch (t) {
        case "E":
        case "EE":
        case "EEE":
          return n.day(i, { width: "abbreviated", context: "formatting" });
        case "EEEEE":
          return n.day(i, { width: "narrow", context: "formatting" });
        case "EEEEEE":
          return n.day(i, { width: "short", context: "formatting" });
        case "EEEE":
        default:
          return n.day(i, { width: "wide", context: "formatting" });
      }
    },
    e: function (e, t, n, i) {
      const s = e.getDay(),
        r = (s - i.weekStartsOn + 8) % 7 || 7;
      switch (t) {
        case "e":
          return String(r);
        case "ee":
          return Le(r, 2);
        case "eo":
          return n.ordinalNumber(r, { unit: "day" });
        case "eee":
          return n.day(s, { width: "abbreviated", context: "formatting" });
        case "eeeee":
          return n.day(s, { width: "narrow", context: "formatting" });
        case "eeeeee":
          return n.day(s, { width: "short", context: "formatting" });
        case "eeee":
        default:
          return n.day(s, { width: "wide", context: "formatting" });
      }
    },
    c: function (e, t, n, i) {
      const s = e.getDay(),
        r = (s - i.weekStartsOn + 8) % 7 || 7;
      switch (t) {
        case "c":
          return String(r);
        case "cc":
          return Le(r, t.length);
        case "co":
          return n.ordinalNumber(r, { unit: "day" });
        case "ccc":
          return n.day(s, { width: "abbreviated", context: "standalone" });
        case "ccccc":
          return n.day(s, { width: "narrow", context: "standalone" });
        case "cccccc":
          return n.day(s, { width: "short", context: "standalone" });
        case "cccc":
        default:
          return n.day(s, { width: "wide", context: "standalone" });
      }
    },
    i: function (e, t, n) {
      const i = e.getDay(),
        s = i === 0 ? 7 : i;
      switch (t) {
        case "i":
          return String(s);
        case "ii":
          return Le(s, t.length);
        case "io":
          return n.ordinalNumber(s, { unit: "day" });
        case "iii":
          return n.day(i, { width: "abbreviated", context: "formatting" });
        case "iiiii":
          return n.day(i, { width: "narrow", context: "formatting" });
        case "iiiiii":
          return n.day(i, { width: "short", context: "formatting" });
        case "iiii":
        default:
          return n.day(i, { width: "wide", context: "formatting" });
      }
    },
    a: function (e, t, n) {
      const s = e.getHours() / 12 >= 1 ? "pm" : "am";
      switch (t) {
        case "a":
        case "aa":
          return n.dayPeriod(s, {
            width: "abbreviated",
            context: "formatting",
          });
        case "aaa":
          return n
            .dayPeriod(s, { width: "abbreviated", context: "formatting" })
            .toLowerCase();
        case "aaaaa":
          return n.dayPeriod(s, { width: "narrow", context: "formatting" });
        case "aaaa":
        default:
          return n.dayPeriod(s, { width: "wide", context: "formatting" });
      }
    },
    b: function (e, t, n) {
      const i = e.getHours();
      let s;
      switch (
        (i === 12
          ? (s = Zr.noon)
          : i === 0
            ? (s = Zr.midnight)
            : (s = i / 12 >= 1 ? "pm" : "am"),
        t)
      ) {
        case "b":
        case "bb":
          return n.dayPeriod(s, {
            width: "abbreviated",
            context: "formatting",
          });
        case "bbb":
          return n
            .dayPeriod(s, { width: "abbreviated", context: "formatting" })
            .toLowerCase();
        case "bbbbb":
          return n.dayPeriod(s, { width: "narrow", context: "formatting" });
        case "bbbb":
        default:
          return n.dayPeriod(s, { width: "wide", context: "formatting" });
      }
    },
    B: function (e, t, n) {
      const i = e.getHours();
      let s;
      switch (
        (i >= 17
          ? (s = Zr.evening)
          : i >= 12
            ? (s = Zr.afternoon)
            : i >= 4
              ? (s = Zr.morning)
              : (s = Zr.night),
        t)
      ) {
        case "B":
        case "BB":
        case "BBB":
          return n.dayPeriod(s, {
            width: "abbreviated",
            context: "formatting",
          });
        case "BBBBB":
          return n.dayPeriod(s, { width: "narrow", context: "formatting" });
        case "BBBB":
        default:
          return n.dayPeriod(s, { width: "wide", context: "formatting" });
      }
    },
    h: function (e, t, n) {
      if (t === "ho") {
        let i = e.getHours() % 12;
        return (i === 0 && (i = 12), n.ordinalNumber(i, { unit: "hour" }));
      }
      return Rs.h(e, t);
    },
    H: function (e, t, n) {
      return t === "Ho"
        ? n.ordinalNumber(e.getHours(), { unit: "hour" })
        : Rs.H(e, t);
    },
    K: function (e, t, n) {
      const i = e.getHours() % 12;
      return t === "Ko"
        ? n.ordinalNumber(i, { unit: "hour" })
        : Le(i, t.length);
    },
    k: function (e, t, n) {
      let i = e.getHours();
      return (
        i === 0 && (i = 24),
        t === "ko" ? n.ordinalNumber(i, { unit: "hour" }) : Le(i, t.length)
      );
    },
    m: function (e, t, n) {
      return t === "mo"
        ? n.ordinalNumber(e.getMinutes(), { unit: "minute" })
        : Rs.m(e, t);
    },
    s: function (e, t, n) {
      return t === "so"
        ? n.ordinalNumber(e.getSeconds(), { unit: "second" })
        : Rs.s(e, t);
    },
    S: function (e, t) {
      return Rs.S(e, t);
    },
    X: function (e, t, n) {
      const i = e.getTimezoneOffset();
      if (i === 0) return "Z";
      switch (t) {
        case "X":
          return qg(i);
        case "XXXX":
        case "XX":
          return cr(i);
        case "XXXXX":
        case "XXX":
        default:
          return cr(i, ":");
      }
    },
    x: function (e, t, n) {
      const i = e.getTimezoneOffset();
      switch (t) {
        case "x":
          return qg(i);
        case "xxxx":
        case "xx":
          return cr(i);
        case "xxxxx":
        case "xxx":
        default:
          return cr(i, ":");
      }
    },
    O: function (e, t, n) {
      const i = e.getTimezoneOffset();
      switch (t) {
        case "O":
        case "OO":
        case "OOO":
          return "GMT" + Xg(i, ":");
        case "OOOO":
        default:
          return "GMT" + cr(i, ":");
      }
    },
    z: function (e, t, n) {
      const i = e.getTimezoneOffset();
      switch (t) {
        case "z":
        case "zz":
        case "zzz":
          return "GMT" + Xg(i, ":");
        case "zzzz":
        default:
          return "GMT" + cr(i, ":");
      }
    },
    t: function (e, t, n) {
      const i = Math.trunc(+e / 1e3);
      return Le(i, t.length);
    },
    T: function (e, t, n) {
      return Le(+e, t.length);
    },
  };
function Xg(e, t = "") {
  const n = e > 0 ? "-" : "+",
    i = Math.abs(e),
    s = Math.trunc(i / 60),
    r = i % 60;
  return r === 0 ? n + String(s) : n + String(s) + t + Le(r, 2);
}
function qg(e, t) {
  return e % 60 === 0
    ? (e > 0 ? "-" : "+") + Le(Math.abs(e) / 60, 2)
    : cr(e, t);
}
function cr(e, t = "") {
  const n = e > 0 ? "-" : "+",
    i = Math.abs(e),
    s = Le(Math.trunc(i / 60), 2),
    r = Le(i % 60, 2);
  return n + s + t + r;
}
const jg = (e, t) => {
    switch (e) {
      case "P":
        return t.date({ width: "short" });
      case "PP":
        return t.date({ width: "medium" });
      case "PPP":
        return t.date({ width: "long" });
      case "PPPP":
      default:
        return t.date({ width: "full" });
    }
  },
  vy = (e, t) => {
    switch (e) {
      case "p":
        return t.time({ width: "short" });
      case "pp":
        return t.time({ width: "medium" });
      case "ppp":
        return t.time({ width: "long" });
      case "pppp":
      default:
        return t.time({ width: "full" });
    }
  },
  tD = (e, t) => {
    const n = e.match(/(P+)(p+)?/) || [],
      i = n[1],
      s = n[2];
    if (!s) return jg(e, t);
    let r;
    switch (i) {
      case "P":
        r = t.dateTime({ width: "short" });
        break;
      case "PP":
        r = t.dateTime({ width: "medium" });
        break;
      case "PPP":
        r = t.dateTime({ width: "long" });
        break;
      case "PPPP":
      default:
        r = t.dateTime({ width: "full" });
        break;
    }
    return r.replace("{{date}}", jg(i, t)).replace("{{time}}", vy(s, t));
  },
  eD = { p: vy, P: tD },
  nD = /^D+$/,
  iD = /^Y+$/,
  sD = ["D", "DD", "YY", "YYYY"];
function rD(e) {
  return nD.test(e);
}
function oD(e) {
  return iD.test(e);
}
function aD(e, t, n) {
  const i = lD(e, t, n);
  if ((console.warn(i), sD.includes(e))) throw new RangeError(i);
}
function lD(e, t, n) {
  const i = e[0] === "Y" ? "years" : "days of the month";
  return `Use \`${e.toLowerCase()}\` instead of \`${e}\` (in \`${t}\`) for formatting ${i} to the input \`${n}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}
const cD = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,
  uD = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,
  hD = /^'([^]*?)'?$/,
  fD = /''/g,
  dD = /[a-zA-Z]/;
function pD(e, t, n) {
  var u, h, f, d;
  const i = yu(),
    s = i.locale ?? Y2,
    r =
      i.firstWeekContainsDate ??
      ((h = (u = i.locale) == null ? void 0 : u.options) == null
        ? void 0
        : h.firstWeekContainsDate) ??
      1,
    o =
      i.weekStartsOn ??
      ((d = (f = i.locale) == null ? void 0 : f.options) == null
        ? void 0
        : d.weekStartsOn) ??
      0,
    a = mi(e, n == null ? void 0 : n.in);
  if (!m2(a)) throw new RangeError("Invalid time value");
  let l = t
    .match(uD)
    .map((p) => {
      const g = p[0];
      if (g === "p" || g === "P") {
        const _ = eD[g];
        return _(p, s.formatLong);
      }
      return p;
    })
    .join("")
    .match(cD)
    .map((p) => {
      if (p === "''") return { isToken: !1, value: "'" };
      const g = p[0];
      if (g === "'") return { isToken: !1, value: mD(p) };
      if ($g[g]) return { isToken: !0, value: p };
      if (g.match(dD))
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" +
            g +
            "`",
        );
      return { isToken: !1, value: p };
    });
  s.localize.preprocessor && (l = s.localize.preprocessor(a, l));
  const c = { firstWeekContainsDate: r, weekStartsOn: o, locale: s };
  return l
    .map((p) => {
      if (!p.isToken) return p.value;
      const g = p.value;
      (oD(g) || rD(g)) && aD(g, t, String(e));
      const _ = $g[g[0]];
      return _(a, g, s.localize, c);
    })
    .join("");
}
function mD(e) {
  const t = e.match(hD);
  return t ? t[1].replace(fD, "'") : e;
}
function gD(e, t, n) {
  const [i, s] = Kd(n == null ? void 0 : n.in, e, t);
  return i.getFullYear() === s.getFullYear();
}
function _D(e, t) {
  return gD(ei(e, e), Jd(e));
}
function vD(e, t) {
  return gy(ei(e, e), Jd(e));
}
function yD(e, t, n) {
  return u2(e, -1, n);
}
function xD(e, t) {
  return gy(ei(e, e), yD(Jd(e)));
}
function bD() {
  var e;
  return (
    ((e = new Error().stack) == null ? void 0 : e.split("at ")[5]) ||
    "(missing stack)"
  );
}
function qt(e, t = "") {
  if (!e)
    throw (t && (t = ` "${t}"`), new Error(`Assertion${t} failed at ${bD()}`));
}
function $i(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Yg(e, t, n) {
  return (n || (n = t + "s"), `${e} ${e == 1 ? t : n}`);
}
function SD(e) {
  if ((e instanceof Date || (e = new Date(e)), vD(e))) return "Today";
  if (xD(e)) return "Yesterday";
  {
    let t = pD(e, "LLL d");
    return (_D(e) || (t += ", " + e.getFullYear()), t);
  }
}
function MD(e, t, n, i) {
  const s = Ar(n),
    r = Ar(t);
  if (s && r) return [];
  const o = 0.25 * n.dot(n),
    a = n.dot(t),
    l = n.dot(e) + t.dot(t),
    c = 2 * e.dot(t),
    u = e.dot(e) - i ** 2;
  let h;
  if (
    (s
      ? (qt(Sn(o)), qt(Sn(a)), (h = Vf(hy(l, c, u))))
      : Sn(u)
        ? (h = [0, ...Vf(fy(o, a, l, c))])
        : (h = o2([o, a, l, c, u], r2(o, a, l, c, u))),
    h.some((f) => !isFinite(f)))
  )
    throw new Error("Got Infinite root");
  if (h.some((f) => isNaN(f))) throw new Error("Got NaN root");
  return h.filter((f) => f >= 0);
}
let xu = MD;
const Cr = "cue_ball",
  wD = 0.1;
var An = ((e) => (
  (e.Stationary = "Stationary"),
  (e.Sliding = "Sliding"),
  (e.Rolling = "Rolling"),
  (e.Spinning = "Spinning"),
  (e.Flying = "Flying"),
  (e.Pocketed = "Pocketed"),
  e
))(An || {});
const lo = class lo {
  constructor(t, n, i, s, r) {
    pt(this, "config");
    pt(this, "id");
    pt(this, "type");
    pt(this, "name");
    pt(this, "radius");
    pt(this, "mass");
    pt(this, "state");
    pt(this, "position");
    pt(this, "orientation");
    pt(this, "velocity");
    pt(this, "omega");
    pt(this, "acceleration");
    pt(this, "alpha");
    if (t instanceof lo) {
      const o = t;
      ((this.config = o.config),
        (this.id = o.id),
        (this.type = o.type),
        (this.name = o.name),
        (this.radius = o.radius),
        (this.mass = o.mass),
        (this.state = o.state),
        (this.position = o.position.clone()),
        (this.orientation = o.orientation.clone()),
        (this.velocity = o.velocity.clone()),
        (this.omega = o.omega.clone()),
        (this.acceleration = o.acceleration.clone()),
        (this.alpha = o.alpha.clone()));
    } else
      (qt(n),
        qt(i),
        qt(s),
        qt(r),
        (this.config = t),
        (this.id = lo.nextId++),
        (this.type = n),
        (this.name = n == "cue_ball" ? "cue ball" : n + "-ball"),
        (this.radius = i),
        (this.mass = s),
        (this.position = r.clone()),
        (this.orientation = new vs().random()),
        (this.state = "Stationary"),
        (this.velocity = new U()),
        (this.omega = new U()),
        (this.acceleration = new U()),
        (this.alpha = new U()));
  }
  clone() {
    return new lo(this);
  }
  stateAt(t) {
    if (this.state == "Stationary" || this.state == "Pocketed")
      return this.clone();
    const n = this.position
      .clone()
      .addScaledVector(this.velocity, t)
      .addScaledVector(this.acceleration, 0.5 * t * t);
    let i = this.orientation.clone(),
      s = this.omega.clone();
    for (let l = 0; l < t;) {
      let c = Math.min(t - l, wD);
      (qt(c > 0),
        s.addScaledVector(this.alpha, c),
        i.premultiply(
          new vs().setFromAxisAngle(s.clone().normalize(), s.length() * c),
        ),
        (l += c));
    }
    const r = this.velocity.clone().addScaledVector(this.acceleration, t),
      o = this.omega.clone().addScaledVector(this.alpha, t);
    let a = this.clone();
    return (a.position.copy(n), a.orientation.copy(i), a.changeMotion(r, o), a);
  }
  changeMotion(t, n) {
    (this.velocity.copy(ea(t)), this.omega.copy(ea(n)));
    const i = new U(0, 0, -this.radius),
      s = this.config.ball_cloth_friction,
      r = this.config.rolling_resistance,
      o = (2 / 5) * this.radius ** 2,
      a = this.config.gravitational_acceleration;
    if (!Sn(this.velocity.z) || this.position.z > this.radius)
      return (
        (this.state = "Flying"),
        (this.acceleration = new U(0, 0, -a)),
        (this.alpha = new U()),
        this
      );
    let l = ea(this.omega.clone().cross(i).add(this.velocity));
    const c = l
        .clone()
        .normalize()
        .multiplyScalar(-s * a),
      u = i.clone().cross(c).divideScalar(o),
      h = this.omega
        .clone()
        .normalize()
        .multiplyScalar((-r * a) / this.radius),
      f = h.clone().cross(i).multiplyScalar(-1);
    return (
      (this.acceleration = ea(new U().addVectors(f, c))),
      (this.alpha = ea(new U().addVectors(h, u))),
      Eh(l)
        ? Eh(this.velocity)
          ? Eh(this.omega)
            ? (this.state = "Stationary")
            : (this.state = "Spinning")
          : (this.state = "Rolling")
        : (this.state = "Sliding"),
      this
    );
  }
  getCollision(t) {
    const n = new U().subVectors(this.position, t.position),
      i = new U().subVectors(this.velocity, t.velocity),
      s = new U().subVectors(this.acceleration, t.acceleration),
      r = this.radius + t.radius;
    let o;
    return (
      xu(n, i, s, r).forEach((a) => {
        if (o && o.time <= a) return;
        let l = this.stateAt(a),
          c = t.stateAt(a),
          u = l.position.distanceTo(c.position);
        if (!$n(u, r))
          throw (
            console.error(`Bad root. R=${r}, dist=${u}, time=${a}`, {
              myState: l,
              tbState: c,
            }),
            new Error("Bad root, balls not in contact at predicted collision")
          );
        let h = new U().subVectors(c.position, l.position);
        new U().subVectors(c.velocity, l.velocity).dot(h) < 0 &&
          (o = new Xa(a, this, t));
      }),
      o
    );
  }
  getStateChange() {
    if (["Stationary", "Pocketed", "Flying"].includes(this.state)) return;
    let t = [];
    const n = new U(0, 0, -this.radius);
    let i = this.omega.clone().cross(n).add(this.velocity),
      s = this.alpha.clone().cross(n).add(this.acceleration);
    if (
      (Ar(i) || (qt(Vg(i, s)), t.push(i.length() / s.length())),
      Sn(this.omega.z) ||
        (qt(!Sn(this.alpha.z)),
        qt(Math.sign(this.omega.z) != Math.sign(this.alpha.z)),
        t.push(-this.omega.z / this.alpha.z)),
      !Ar(this.omega))
    ) {
      let r = this.alpha.clone().projectOnVector(this.omega);
      Vg(this.omega, r) && t.push(this.omega.length() / r.length());
    }
    return (qt(t.length), new yy(Math.min(...t), this));
  }
  isMovingTowards(t) {
    return t.clone().sub(this.position).dot(this.velocity) > 0;
  }
  getPointVelocity(t) {
    return this.omega
      .clone()
      .cross(t.clone().sub(this.position))
      .add(this.velocity);
  }
  landingTime() {
    if (this.state != "Flying") return;
    let t = hy(
        0.5 * this.acceleration.z,
        this.velocity.z,
        this.position.z - this.radius,
      ),
      n = Vf(t)
        .filter((i) => Sn(i) || i > 0)
        .filter((i) => this.stateAt(i).velocity.z < 0);
    return (
      qt(
        n.length == 1,
        `There should be exactly one solution. Found [${n.join(", ")}].`,
      ),
      n[0] < 0 ? 0 : n[0]
    );
  }
};
pt(lo, "nextId", 1);
let $a = lo;
class $o {
  constructor() {
    pt(this, "_updatedBalls");
  }
  get updatedBalls() {
    return (
      this._updatedBalls || (this._updatedBalls = this.computeUpdatedBalls()),
      this._updatedBalls
    );
  }
}
class Kr {
  constructor(t, n, i = !0) {
    pt(this, "name", "PlaceBall");
    pt(this, "time", 0);
    pt(this, "updatedBalls");
    this.ball = t;
    let s = t.clone();
    ((s.position = zi(n, t.radius)),
      (s.state = "Stationary"),
      i && (s.orientation = new vs().random()),
      (this.updatedBalls = [s]));
  }
}
class yy extends $o {
  constructor(n, i) {
    super();
    pt(this, "name", "BallMotionChange");
    ((this.time = n), (this.ball = i));
  }
  computeUpdatedBalls() {
    return [this.ball.stateAt(this.time)];
  }
}
class Xa extends $o {
  constructor(n, i, s) {
    super();
    pt(this, "name", "BallBallImpact");
    pt(this, "time");
    pt(this, "ballA");
    pt(this, "ballB");
    ((this.time = n),
      (this.ballA = i.clone().stateAt(n)),
      (this.ballB = s.clone().stateAt(n)),
      qt(
        $n(
          this.ballA.position.distanceTo(this.ballB.position),
          this.ballA.radius + this.ballB.radius,
        ),
        "Balls in contact at predicted collision",
      ));
  }
  computeUpdatedBalls() {
    const n = Ge(this.ballA.position, this.ballB.position),
      i = this.ballA.position.clone().addScaledVector(n, this.ballA.radius);
    (qt($n(i.distanceTo(this.ballA.position), this.ballA.radius)),
      qt($n(i.distanceTo(this.ballB.position), this.ballB.radius)));
    const s = this.ballA.velocity.clone().projectOnVector(n),
      r = this.ballB.velocity.clone().projectOnVector(n),
      o = this.ballA.velocity.clone().sub(s),
      a = this.ballB.velocity.clone().sub(r),
      l = this.ballA.mass,
      c = this.ballB.mass,
      u = this.ballA.config.ball_ball_cor,
      h = r
        .clone()
        .multiplyScalar((u + 1) * c)
        .sub(s.clone().multiplyScalar(u * c - l))
        .divideScalar(l + c),
      f = s
        .clone()
        .multiplyScalar((u + 1) * l)
        .sub(r.clone().multiplyScalar(u * l - c))
        .divideScalar(l + c),
      d = h.clone().add(o),
      p = f.clone().add(a),
      g = Hf(this.ballA.getPointVelocity(i), n)[1],
      m = Hf(this.ballB.getPointVelocity(i), n)[1].clone().sub(g),
      b = this.ballA.config.ball_ball_friction,
      y = Math.min(h.clone().sub(s).length() * b * (5 / 2), m.length() / 2),
      x = m.clone().normalize().multiplyScalar(y);
    d.add(x);
    const D = this.ballA.omega
        .clone()
        .add(i.clone().sub(this.ballA.position).cross(x)),
      L = Math.min(f.clone().sub(r).length() * b * (5 / 2), m.length() / 2),
      N = m.clone().normalize().multiplyScalar(-L);
    p.add(N);
    const I = this.ballB.omega
      .clone()
      .add(i.clone().sub(this.ballB.position).cross(N));
    return [
      this.ballA.clone().changeMotion(d, D),
      this.ballB.clone().changeMotion(p, I),
    ];
  }
}
class Qd {
  constructor(t, n, i) {
    pt(this, "config");
    pt(this, "position");
    pt(this, "axis");
    ((this.config = t), (this.position = n.clone()), (this.axis = i.clone()));
  }
  clone() {
    return new Qd(this.config, this.position, this.axis);
  }
  get tipSphereCenter() {
    return this.position
      .clone()
      .addScaledVector(this.axis, -this.config.cue.tip_radius);
  }
  getCoordinateSystem() {
    let t = new U().crossVectors(this.axis, Gi).normalize(),
      n = new U().crossVectors(t, this.axis);
    return { x: t, y: n, z: this.axis.clone() };
  }
  getImpact(t, n, i) {
    const s = this.config.cue.tip_radius,
      r = this.config.cue.shaft_radius,
      o = this.position.clone().addScaledVector(this.axis, -s);
    let a = new U().subVectors(n.position, o).projectOnVector(this.axis).add(o),
      l = a.distanceTo(n.position),
      c = Ge(a, n.position);
    if (l > n.radius + r) return;
    const u = (l * s) / (s + n.radius);
    let h,
      f,
      d = u > r;
    if (!d)
      ((h = a
        .clone()
        .addScaledVector(c, u)
        .addScaledVector(this.axis, -la(n.radius, l - u))),
        (f = a.clone().addScaledVector(this.axis, -la(n.radius + s, l) + s)));
    else {
      const g = la(n.radius, l - r);
      ((h = a.clone().addScaledVector(c, r).addScaledVector(this.axis, -g)),
        (f = a.clone().addScaledVector(this.axis, -(g + la(s, r) - s))));
    }
    const p = this.position.distanceTo(f);
    return new vr(t, n, this, i, h, p, d);
  }
  getRadiusAt(t) {
    return t <= this.config.cue.taper_length
      ? this.config.cue.tip_radius
      : t <= this.config.cue.shaft_length
        ? He.lerp(
            this.config.cue.tip_radius,
            this.config.cue.joint_radius,
            (t - this.config.cue.taper_length) /
              (this.config.cue.shaft_length - this.config.cue.taper_length),
          )
        : t <= this.config.cue.shaft_length + this.config.cue.butt_length
          ? He.lerp(
              this.config.cue.joint_radius,
              this.config.cue.butt_radius,
              (t - this.config.cue.shaft_length) / this.config.cue.butt_length,
            )
          : 0;
  }
}
function ED(e) {
  return typeof e.getCueDisplacement == "function";
}
class tp {
  constructor(t, n) {
    pt(this, "name", "CueStroke");
    pt(this, "time", 0);
    pt(this, "updatedBalls", []);
    pt(this, "cueMotions");
    pt(this, "backswingDistance");
    pt(this, "strokeTime");
    ((this.finalSpeed = t),
      (this.config = n),
      (this.backswingDistance =
        (this.finalSpeed / this.config.stroke.max_speed) *
        this.config.stroke.max_backswing),
      (this.cueMotions = [
        ...this.calculatePracticeStrokes(),
        [0, this.config.stroke.pre_backswing_pause],
        ...this.calculateBackswing(),
        [0, this.config.stroke.backswing_pause],
        this.calculateStroke(),
      ]),
      (this.strokeTime = this.cueMotions.reduce((i, [s, r]) => i + r, 0)));
  }
  calculatePracticeStrokes() {
    return this.config.stroke.practice_strokes.flatMap((t) => {
      let n = this.backswingDistance * t;
      return [
        ...this.calculateTrapezoid(n),
        ...this.reverseMotion(this.calculateTrapezoid(n)),
      ];
    });
  }
  calculateBackswing() {
    return this.calculateTrapezoid(this.backswingDistance);
  }
  calculateStroke() {
    let t = this.finalSpeed ** 2 / (2 * this.backswingDistance),
      n = this.finalSpeed / t;
    return [t, n];
  }
  getCueDisplacement(t) {
    let n = 0,
      i = 0;
    for (let [s, r] of this.cueMotions) {
      let o = Math.min(r, t);
      if (((n += i * o + 0.5 * s * o * o), (i += s * o), (t -= o), t <= 0))
        break;
    }
    return n;
  }
  calculateTrapezoid(t) {
    let n = this.config.stroke.backswing_speed,
      i = this.config.stroke.backswing_accel_time,
      s = n / i,
      r = 0.5 * n * i;
    return r < t / 2
      ? [
          [-s, i],
          [0, (t - 2 * r) / n],
          [s, i],
        ]
      : ((i = i * (t / (2 * r))),
        [
          [-s, i],
          [s, i],
        ]);
  }
  reverseMotion(t) {
    return t.map(([n, i]) => [-n, i]);
  }
}
class vr extends $o {
  constructor(n, i, s, r, o, a, l) {
    super();
    pt(this, "time");
    pt(this, "name", "BallCueImpact");
    pt(this, "ball");
    pt(this, "cue");
    ((this.speed = r),
      (this.pointOfContact = o),
      (this.travelDistance = a),
      (this.isMiscue = l),
      (this.time = n),
      (this.ball = i.clone()),
      (this.cue = s.clone()));
  }
  computeUpdatedBalls() {
    let n = new U().subVectors(this.ball.position, this.pointOfContact),
      i = this.cue.axis.angleTo(n),
      s = this.ball.radius * Math.sin(i);
    const r = this.ball.radius,
      o = s,
      a = this.cue.config.cue.endmass,
      l = this.ball.mass,
      c = Math.atan2(
        5 * r * o * a * Math.sqrt(1 - o ** 2 / r ** 2),
        2 * r * r * l + (7 * r * r - 5 * o * o) * a,
      ),
      u = ((l + a) * this.speed * Math.sin(c)) / (r * a * Math.cos(i));
    let h;
    s > 0
      ? (h = new U().crossVectors(this.cue.axis, n).normalize())
      : (h = new U());
    let f = this.ball.clone();
    const d = h.clone().multiplyScalar(u),
      p = this.cue.axis.clone().applyAxisAngle(h, c).multiplyScalar(this.speed);
    return [f.clone().changeMotion(p, d)];
  }
  getCueDisplacement(n) {
    n = Math.min(n, this.cue.config.stroke.followthrough_time);
    let i = this.speed * (1 - this.ball.mass / this.cue.config.cue.mass),
      s = -i / this.cue.config.stroke.followthrough_time;
    return i * n + 0.5 * s * n * n;
  }
}
class TD {
  constructor(t, n, i) {
    pt(this, "isSidePocket");
    ((this.name = t),
      (this.center = n),
      (this.radius = i),
      (this.isSidePocket = Sn(n.y)));
  }
  getCollision(t) {
    return t.state == An.Flying
      ? this.getLandingCollision(t)
      : this.getSurfaceCollision(t);
  }
  getSurfaceCollision(t) {
    const n = t.position.clone().add(new U(0, 0, -t.radius));
    if (!$n(n.z, this.center.z)) return;
    const i = new U().subVectors(n, this.center),
      s = t.velocity.clone(),
      r = t.acceleration.clone();
    let o;
    return (
      xu(i, s, r, this.radius).forEach((a) => {
        if (o && o.time <= a) return;
        t.stateAt(a).isMovingTowards(this.center) && (o = new qa(a, t, this));
      }),
      o
    );
  }
  getLandingCollision(t) {
    let n = t.landingTime();
    if (
      (qt(typeof n < "u"),
      t
        .stateAt(n)
        .position.clone()
        .setZ(this.center.z)
        .distanceTo(this.center) <= this.radius)
    )
      return new qa(n, t, this);
  }
}
class qa extends $o {
  constructor(n, i, s) {
    super();
    pt(this, "name", "PocketImpact");
    pt(this, "time");
    pt(this, "ball");
    pt(this, "pocket");
    ((this.time = n),
      (this.ball = i.stateAt(n)),
      (this.pocket = s),
      qt($n(this.ball.position.z, this.ball.radius), "Ball is on the surface"));
    const o = this.ball.position
      .clone()
      .sub(new U(0, 0, this.ball.radius))
      .distanceTo(this.pocket.center);
    qt(
      o < this.pocket.radius || $n(o, this.pocket.radius),
      `Point of contact should be in the pocket d=${o}, R=${this.pocket.radius}`,
    );
  }
  computeUpdatedBalls() {
    const n = this.ball.clone();
    return (
      n.changeMotion(new U(), new U()),
      (n.state = An.Pocketed),
      n.position.copy(this.pocket.center).setZ(-5 * this.ball.radius),
      [n]
    );
  }
}
class Fs {
  constructor(t, n, i, s) {
    pt(this, "dir");
    pt(this, "length");
    pt(this, "transform");
    ((this.name = t),
      (this.start = n),
      (this.end = i),
      (this.facingSide = s),
      (this.dir = new U().subVectors(i, n).normalize()),
      (this.length = new U().subVectors(i, n).length()));
    const r = new U(1, 0, 0);
    let o = new U().crossVectors(r, this.dir).normalize();
    Ar(o) && (o = Gi.clone());
    let a = this.dir.angleTo(r);
    this.transform = new pe().makeRotationAxis(o, -a);
  }
  getTargetEdge(t) {
    const n = t.radius;
    let i = this.dir.clone().applyAxisAngle(Gi, -Math.PI / 2);
    return this.facingSide == "left"
      ? this.start.clone().addScaledVector(i, n).setZ(n)
      : this.end.clone().addScaledVector(i, n).setZ(n);
  }
  getCollision(t) {
    const n = t.position
        .clone()
        .sub(this.start)
        .applyMatrix4(this.transform)
        .setX(0),
      i = t.velocity.clone().applyMatrix4(this.transform).setX(0),
      s = t.acceleration.clone().applyMatrix4(this.transform).setX(0);
    let r;
    return (
      xu(n, i, s, t.radius).forEach((a) => {
        if (r && r.time <= a) return;
        const l = t.stateAt(a),
          u = new U().subVectors(l.position, this.start).dot(this.dir);
        if (u < 0 || u > this.length) return;
        const h = this.start.clone().addScaledVector(this.dir, u);
        l.isMovingTowards(h) && (r = new ep(a, t, this, h));
      }),
      r
    );
  }
}
class Gf {
  constructor(t, n, i, s) {
    ((this.name = t), (this.center = n), (this.radius = i), (this.side = s));
  }
  getTangentPosition(t) {
    let n = this.radius + t.radius,
      i = Ge(this.center, t.position),
      s = this.center.distanceTo(t.position),
      r = Math.acos(n / s) * (this.side == "left" ? 1 : -1),
      o = i.clone().applyAxisAngle(Gi, r);
    return this.center.clone().addScaledVector(o, n).setZ(t.radius);
  }
  getCollision(t) {
    const n = new U(1, 1, Math.SQRT1_2),
      i = t.acceleration.clone().multiply(n),
      s = t.velocity.clone().multiply(n),
      r = t.position.clone().sub(this.center).multiply(n);
    let o,
      a = xu(r, s, i, this.radius + t.radius);
    return (
      (a = a.map((l) => this.refineCollisionTime(t, l))),
      a.forEach((l) => {
        if (((l = this.refineCollisionTime(t, l)), l < 0 || (o && o.time <= l)))
          return;
        const c = t.stateAt(l),
          u = Ge(c.position, this.center)
            .multiplyScalar(c.radius)
            .add(c.position),
          h = u.distanceTo(this.center);
        h > this.radius + 0.1 * We ||
          (t.isMovingTowards(this.center) &&
            (qt(
              Math.abs(h - this.radius) < 0.1 * We,
              `In contact at predicted collision d=${h}, R=${this.radius}`,
            ),
            (o = new ep(l, t, this, u))));
      }),
      o
    );
  }
  refineCollisionTime(t, n, i = 1e-15) {
    let s = this.radius + t.radius,
      r = (u) => t.stateAt(u).position.distanceTo(this.center) - s,
      o = n + 0.001,
      a = r(n),
      l = r(o),
      c = 5;
    for (; Math.abs(l) > i && c;) {
      --c;
      let u = o - (l * (o - n)) / (l - a);
      $n(a, l, i) && (u = (n + o) / 2);
      let h = r(u);
      ((n = o), (a = l), (o = u), (l = h));
    }
    return o;
  }
}
class ep extends $o {
  constructor(n, i, s, r) {
    super();
    pt(this, "name", "RailImpact");
    ((this.time = n),
      (this.ball = i),
      (this.railObject = s),
      (this.pointOfContact = r),
      (this.ball = i.stateAt(n)));
  }
  computeUpdatedBalls() {
    const n = Ge(this.ball.position, this.pointOfContact),
      [i, s] = Hf(this.ball.getPointVelocity(this.pointOfContact), n),
      r = s.clone().normalize(),
      o = i.clone().multiplyScalar(-(1 + this.ball.config.ball_rail_cor)),
      a = r
        .clone()
        .multiplyScalar(-o.length() * this.ball.config.ball_rail_friction),
      l = n
        .clone()
        .cross(a)
        .divideScalar((2 / 5) * this.ball.radius),
      c = this.ball.velocity.clone().add(o).add(a),
      u = this.ball.omega.clone().add(l);
    return [this.ball.clone().changeMotion(c, u)];
  }
}
class AD {
  constructor(t) {
    pt(this, "width");
    ((this.length = t), (this.width = t / 2));
  }
  getCollision(t) {
    let n = t.landingTime();
    if (typeof n < "u") return new xy(n, t);
  }
}
class xy extends $o {
  constructor(n, i) {
    super();
    pt(this, "name", "TableBedImpact");
    ((this.time = n),
      (this.ball = i),
      (this.ball = this.ball.stateAt(n)),
      qt(
        $n(this.ball.position.z, this.ball.radius),
        "In contact with table bed at predicted collision",
      ));
  }
  computeUpdatedBalls() {
    const n = this.ball.config,
      i = this.ball.position.clone().setZ(0),
      s = new U(0, 0, -1),
      r = new U(0, 0, this.ball.velocity.z),
      o = this.ball.getPointVelocity(i).sub(r),
      a = r.clone().multiplyScalar(-n.ball_table_cor),
      l = a.clone().sub(r),
      c = Math.min(
        a.clone().sub(r).length() * n.ball_cloth_friction,
        o.length(),
      ),
      u = o.clone().normalize().multiplyScalar(-c),
      h = this.ball.velocity.clone().add(u).add(l),
      f = s
        .clone()
        .cross(u)
        .divideScalar((2 / 5) * this.ball.radius)
        .add(this.ball.omega);
    qt(h.z >= 0, "Ball can't be moving downwards after impact with table bed");
    const d = Math.sqrt(2 * n.gravitational_acceleration * n.min_bounce_height);
    return (h.z < d && (h.z = 0), [this.ball.clone().changeMotion(h, f)]);
  }
}
function Wf(e, t, n, i) {
  const s = e / 2 - Math.sign(n.x) * Math.sign(i.x) * Math.abs(n.x),
    r = t / 2 - Math.sign(n.y) * Math.sign(i.y) * Math.abs(n.y);
  return Math.min(s / Math.abs(i.x), r / Math.abs(i.y));
}
function CD(e, t, n) {
  return new U().subVectors(n, e).projectOnVector(t).add(e);
}
class Zg extends Error {}
class np {
  constructor(t = {}) {
    pt(this, "config");
    pt(this, "tableBed");
    pt(this, "cushionElements");
    pt(this, "pockets");
    pt(this, "cue");
    pt(this, "events", []);
    pt(this, "finalBallState", new Map());
    this.config = { ...cy, ...t };
    const n = this.config.table_length / 2,
      i = n / 2,
      s = [
        ["top-left", new gt(-i, n)],
        ["top-right", new gt(i, n)],
        ["right-side", new gt(i, 0)],
        ["bottom-right", new gt(i, -n)],
        ["bottom-left", new gt(-i, -n)],
        ["left-side", new gt(-i, 0)],
      ];
    ((this.tableBed = new AD(this.config.table_length)),
      (this.cushionElements = this.computeCushionElements(s)),
      (this.pockets = this.computePockets(s)),
      (this.cue = new Qd(this.config, new U(), new U())));
  }
  computeCushionElements(t) {
    const n = [];
    return (
      t
        .map((s, r) => [s, t[(r + 1) % t.length]])
        .map((s) => {
          let r = [!1, !0].map((o) => {
            const a = o ? "left" : "right",
              [l, c] = o ? s.reverse() : s,
              u = new gt().subVectors(c[1], l[1]).normalize();
            let h;
            this.isSide(l[1])
              ? (h = this.config.side_facing_angle)
              : (h = this.config.corner_facing_angle);
            let f = this.getRailPoint(l[1], c[1]),
              d = this.getRailPointName(l[0], c[0]);
            const p = this.config.cushion_corner_radius / Math.tan(h / 2),
              g = f.clone().addScaledVector(u, p),
              _ = o ? -h : h,
              m = u.clone().rotateAround(new gt(), _),
              b = this.config.cushion_width / Math.sin(h),
              y = [
                zi(
                  f.clone().addScaledVector(m, b),
                  this.config.cushion_back_height,
                ),
                zi(
                  f.clone().addScaledVector(m, p),
                  this.config.cushion_nose_height,
                ),
              ],
              [x, D] = o ? y.reverse() : y,
              L = u.rotateAround(new gt(), _ / 2),
              N = f
                .clone()
                .addScaledVector(
                  L,
                  this.config.cushion_corner_radius / Math.sin(h / 2),
                );
            return {
              facing: new Fs(d + " facing", x, D, a),
              point: new Gf(
                d + " point",
                zi(N, this.config.cushion_nose_height),
                this.config.cushion_corner_radius,
                a,
              ),
              railEnd: zi(g, this.config.cushion_nose_height),
            };
          });
          n.push(
            r[0].facing,
            r[0].point,
            new Fs(
              this.getRailName(s[0][0], s[1][0]),
              r[0].railEnd,
              r[1].railEnd,
              void 0,
            ),
            r[1].point,
            r[1].facing,
          );
        }),
      n
    );
  }
  computePockets(t) {
    return t.map((n, i) => {
      let s = t[(i + t.length - 1) % t.length],
        r = t[(i + 1) % t.length],
        o = this.getRailPoint(n[1], s[1]),
        a = this.getRailPoint(n[1], r[1]),
        l = new gt()
          .subVectors(a, o)
          .normalize()
          .rotateAround(new gt(), Math.PI / 2),
        c = new gt().addVectors(o, a).multiplyScalar(0.5),
        u;
      this.isSide(n[1])
        ? (u = this.config.side_pocket_shelf)
        : (u = this.config.corner_pocket_shelf);
      let h = c.clone().addScaledVector(l, u + this.config.pocket_hole_radius);
      return new TD(n[0], zi(h, 0), this.config.pocket_hole_radius);
    });
  }
  getRailPoint(t, n) {
    let i;
    this.isSide(t)
      ? (i = this.config.side_pocket_size / 2)
      : (i = this.config.corner_pocket_size * Math.SQRT1_2);
    let s = new gt().subVectors(n, t).normalize();
    return t.clone().addScaledVector(s, i);
  }
  isSide(t) {
    return t.y == 0;
  }
  getRailPointName(t, n) {
    let i;
    if (t.endsWith("side")) i = n.split("-")[0];
    else {
      const s = n.split("-");
      s[1] == "side" ? (i = s[0]) : (i = s[1]);
    }
    return `${t} pocket ${i}`;
  }
  getRailName(t, n) {
    let i = t.split("-"),
      s = n.split("-");
    return i[0] == s[0]
      ? `${i[0]} rail`
      : i[1] == "side"
        ? `${t} rail: ${s[0]} half`
        : `${n} rail: ${i[0]} half`;
  }
  addBall(t, n) {
    let i = new $a(
      this.config,
      t,
      this.config.ball_radius,
      this.config.ball_mass,
      zi(n, this.config.ball_radius),
    );
    return (this.addEvent(new Kr(i, n)), i.id);
  }
  moveBall(t, n, i = !0) {
    let s = this.finalBallState.get(t);
    if (!s) throw new Zg(`moveBall: No ball with id ${t}`);
    this.addEvent(new Kr(s, n, i));
  }
  spotBall(t) {
    let n = new U(0, this.config.table_length / 4, this.config.ball_radius),
      i = new U(0, 1, 0);
    for (let r = !0; r;) {
      r = !1;
      for (let [o, a] of this.finalBallState)
        n.y > this.config.table_length / 2 - this.config.ball_radius
          ? (i.multiplyScalar(-1),
            n.addScaledVector(i, this.config.ball_radius * 2),
            (r = !0))
          : a.position.distanceTo(n) < a.radius + this.config.ball_radius &&
            (n.addScaledVector(i, this.config.ball_radius * 2), (r = !0));
    }
    let s = new $a(
      this.config,
      t,
      this.config.ball_radius,
      this.config.ball_mass,
      n,
    );
    return (this.addEvent(new Kr(s, ve(n))), s.id);
  }
  randomizeBallOrientation(t) {
    let n = this.finalBallState.get(t);
    if (!n) throw new Zg(`moveBall: No ball with id ${t}`);
    this.addEvent(new Kr(n, ve(n.position)));
  }
  placeCue(t, n) {
    let i = ve(n).normalize().multiplyScalar(-1),
      s = Wf(this.config.table_length / 2, this.config.table_length, t, i),
      r = Wf(
        this.config.table_length / 2 + this.config.cushion_width,
        this.config.table_length + this.config.cushion_width,
        t,
        i,
      ),
      o = this.cue.getRadiusAt(s),
      a = this.cue.getRadiusAt(r),
      l = o + this.config.cushion_nose_height,
      c = this.cue.getRadiusAt(r) + this.config.cushion_back_height,
      u = r,
      h = 0;
    o && l / s > c / r ? ((u = s), (h = l)) : a && (h = c);
    let f = t.clone().addScaledVector(n, -u);
    (f.z < h && (n = Ge(f.setZ(h), t)),
      this.cue.position.copy(t),
      this.cue.axis.copy(n));
  }
  shoot(t) {
    let n,
      i = new tp(t, this.config);
    for (let [o, a] of this.finalBallState) {
      let l = this.cue.getImpact(i.strokeTime, a, t);
      l && (!n || n.travelDistance > l.travelDistance) && (n = l);
    }
    let s;
    n && (this.addEvent(i), (s = this.events.length));
    let r = n;
    for (; r;)
      (this.addEvent(r), (r = this.findNextEvent(this.finalBallState)));
    return s;
  }
  addEvent(t) {
    if (t instanceof Kr)
      for (let i = this.events.length - 1; i >= 0; --i) {
        let s = this.events[i];
        if (s instanceof Kr) {
          if (s.ball.id == t.ball.id) {
            ((this.events[i] = t),
              this.finalBallState.set(t.ball.id, t.updatedBalls[0]));
            return;
          }
        } else break;
      }
    let n = t;
    (this.events.push(n),
      qt(t.time >= 0, `Time travel detected t=${t.time}`),
      (this.finalBallState = this.ballStateAt(this.events.length, 0)));
  }
  findNextEvent(t) {
    let n = new Array(),
      i = [...t.values()];
    i.forEach((r, o) => {
      n.push(r.getStateChange());
      for (let a = o + 1; a < i.length; ++a) n.push(r.getCollision(i[a]));
      (n.push(this.tableBed.getCollision(r)),
        this.cushionElements.forEach((a) => n.push(a.getCollision(r))),
        this.pockets.forEach((a) => n.push(a.getCollision(r))));
    });
    let s = n.filter((r) => !!r);
    if (s.length)
      return s.reduce((r, o) =>
        $n(r.time, o.time)
          ? o instanceof qa
            ? o
            : r
          : o.time < r.time
            ? o
            : r,
      );
  }
  findEvent(t) {
    let n = 0;
    for (; n < this.events.length && this.events[n].time <= t;)
      ((t -= this.events[n].time), ++n);
    return (n == this.events.length && (t = 0), [n - 1, t]);
  }
  ballStateAt(t, n) {
    if (typeof t > "u") return this.finalBallState;
    let i = new Map(),
      s = 0,
      r = {};
    for (let o = 0; o <= t && o < this.events.length; ++o) {
      s += this.events[o].time;
      for (let a of this.events[o].updatedBalls)
        (i.set(a.id, a), (r[a.id] = s));
    }
    s += n;
    for (let [o, a] of i) i.set(o, a.stateAt(s - r[a.id]));
    return i;
  }
  cueStateAt(t, n) {
    if (typeof t > "u" || t >= this.events.length) return this.cue.clone();
    let i = n;
    for (; !ED(this.events[t]);) {
      if (t == 0) return this.cue.clone();
      ((i += this.events[t].time), t--);
    }
    let s = this.cue.clone(),
      o = this.events[t].getCueDisplacement(i);
    return (s.position.addScaledVector(s.axis, o), s);
  }
  resetToEvent(t) {
    (this.events.splice(t + 1),
      (this.finalBallState = this.ballStateAt(this.events.length, 0)));
  }
  getPocketTarget(t, n) {
    let i = this.pockets.findIndex((u) => u.name == n.name);
    qt(i != -1);
    let s = [-2, -1, 0, 1].map((u) => {
        let h =
            (i * 5 + this.cushionElements.length + u) %
            this.cushionElements.length,
          f = this.cushionElements[h];
        return f instanceof Fs ? f.getTargetEdge(t) : f.getTangentPosition(t);
      }),
      r = t.position,
      [o, a] = [0, 2].map((u) =>
        r.distanceTo(s[u]) < r.distanceTo(s[u + 1]) ? s[u] : s[u + 1],
      ),
      l = a2(r, o, a),
      c = Math.abs(o.clone().sub(r).angleTo(l.clone().sub(r)));
    if (n.isSidePocket) {
      let u = ve(r),
        h = ve(l).sub(u).angle();
      if (ve(o).sub(u).rotateAround(new gt(), -h).y < 0) return;
    }
    return { left: o, center: l, right: a, margin: c };
  }
  findGhostBallPosition(t, n, i, s) {
    const r = this.events.length - 1,
      o = n.position.clone().setZ(t.radius),
      a = o.distanceTo(t.position),
      l = Ge(t.position, o);
    let c = this.getPocketTarget(n, i);
    if (!c) return;
    let u = Ge(n.position, c.center),
      h = Math.asin((n.radius + t.radius) / a),
      f = [-h, h],
      d = 0.01 * Je;
    for (;;) {
      let p = (f[0] + f[1]) / 2,
        g = l.clone().applyAxisAngle(Gi, p),
        _ = t.position.clone().addScaledVector(g, -(t.radius + 1 * We));
      (this.placeCue(_, g), this.shoot(s));
      for (let m = r; m < this.events.length; ++m)
        if (this.events[m] instanceof Xa) {
          let b = this.events[m];
          this.resetToEvent(r);
          let y, x;
          b.ballA.id == t.id
            ? ((y = b.updatedBalls[1].velocity), (x = b.ballA.position))
            : ((y = b.updatedBalls[0].velocity), (x = b.ballB.position));
          let D = dy(ve(y), ve(u));
          if (
            (D > Math.PI ? (f[0] = p) : (f[1] = p),
            D < d || 2 * Math.PI - D < d)
          )
            return x;
        }
    }
  }
}
class RD extends Error {
  constructor() {
    super("Object ball can't be made directly into called pocket");
  }
}
class by {
  constructor(t, n) {
    pt(this, "shotEvent");
    pt(this, "ballHit");
    pt(this, "ballPocketed");
    pt(this, "error");
    pt(this, "firstHitObject");
    pt(this, "target");
    pt(this, "targetMargin");
    pt(this, "cutSide");
    let i = t.events.findLastIndex((p) => p instanceof vr);
    if (i == -1) throw new Error("No shot to analyze");
    let s;
    for (let [p, g] of t.finalBallState) g.type == n.ball && (s = g);
    if (!s) throw new Error(`No ball of type ${n.ball}`);
    let r = s.id,
      o = t.pockets.find((p) => p.name == n.pocket);
    if (!o) throw new Error(`Invalid pocket ${n.pocket}`);
    ((this.ballPocketed = s.state == An.Pocketed),
      (this.shotEvent = t.events[i]),
      qt(this.shotEvent instanceof vr));
    let a = this.shotEvent.updatedBalls[0],
      l = t.ballStateAt(i, 0).get(r);
    qt(l);
    let c = t.getPocketTarget(l, o);
    if (!c) throw new RD();
    ((this.target = c.center),
      (this.targetMargin = c.margin),
      (this.cutSide = this.calculateCutSide(c.center, l, a)));
    let u = t.events.findIndex((p, g) => g > i && p instanceof vr),
      h = t.events
        .slice(i, u == -1 ? void 0 : u)
        .filter((p) => p.updatedBalls.some((g) => g.id == r))
        .filter((p) => !(p instanceof xy))
        .filter(
          (p) => !(p instanceof yy) || p.updatedBalls[0].state == An.Stationary,
        );
    if (((this.ballHit = h.length != 0), !this.ballHit)) return;
    qt(h.length >= 2);
    let f = h[0];
    qt(f instanceof Xa);
    let d = this.getBallStateAfterEvent(h[1], r);
    ((this.error = this.calculateError(c.center, l, d, a)),
      (this.firstHitObject = this.getHitObject(h[1], r)));
  }
  get isPocketedCleanly() {
    return (
      this.ballPocketed &&
      !(this.firstHitObject instanceof $a) &&
      !this.firstHitObject.name.includes("rail") &&
      !this.firstHitObject.name.includes("point")
    );
  }
  get isPerfect() {
    return (
      this.ballPocketed &&
      typeof this.error < "u" &&
      Math.abs(this.error / Je) < 0.1
    );
  }
  toDrillAttempt() {
    var t;
    return {
      initial_event: {
        cue_position: this.shotEvent.cue.position,
        cue_axis: this.shotEvent.cue.axis,
        speed: this.shotEvent.speed,
      },
      ball_pocketed: this.ballPocketed,
      first_hit_object: (t = this.firstHitObject) == null ? void 0 : t.name,
      error: this.error,
      timestamp: new Date().toISOString(),
    };
  }
  calculateError(t, n, i, s) {
    let r = s.velocity,
      o = Ge(n.position, t),
      a = Ge(n.position, i.position),
      l = o.angleTo(r),
      c = a.angleTo(r);
    return (a.angleTo(o) > l && (c = -c), c - l);
  }
  calculateCutSide(t, n, i) {
    let s = ve(i.velocity),
      r = ve(t.clone().sub(n.position));
    return dy(s, r) < Math.PI ? "left" : "right";
  }
  getBallStateAfterEvent(t, n) {
    return t instanceof qa ? t.ball : t.updatedBalls.find((i) => i.id == n);
  }
  getHitObject(t, n) {
    if (t instanceof qa) return t.pocket;
    if (t instanceof ep) return t.railObject;
    if (t instanceof Xa) return t.ballA.id == n ? t.ballB : t.ballA;
  }
}
function Sy(e) {
  return `Drill ${e.id.toString().padStart(3, "0")}`;
}
function ip(e, t) {
  e.resetToEvent(-1);
  for (let n of t.layout.balls)
    e.addBall(n.type, new gt(n.position.x * ge, n.position.y * ge));
}
function PD(e, t) {
  e.resetToEvent(-1);
  let n = 1;
  t.unit === "in"
    ? (n = ge)
    : t.unit === "cm"
      ? (n = xn)
      : t.unit && (n = t.unit);
  for (let i of t.balls) {
    let [s, r] = i.position;
    e.addBall(i.type, new gt(s, r).multiplyScalar(n));
  }
}
function ja(e, t) {
  return e.position.clone().addScaledVector(Ge(t, e.position), 2 * e.radius);
}
function Kg(e, t) {
  for (let [n, i] of e.finalBallState) if (i.type == t) return i;
}
function My(e) {
  let t = new np();
  ip(t, e);
  let n = t.pockets.find((u) => u.name == e.goal.pocket),
    i = Kg(t, e.goal.ball),
    s = Kg(t, Cr);
  if (!n) throw new Error(`Invalid goal pocket ${e.goal.pocket}`);
  if (!i) throw new Error(`Invalid object ball ${e.goal.ball}`);
  if (!s) throw new Error(`Drill ${e.id} missing cue ball`);
  let r = t.getPocketTarget(i, n);
  if (!r) throw new Error("Invalid target");
  let [o, a] = [r.center, r.margin],
    l = ja(i, o),
    c = [];
  for (let u of [-a, a]) {
    let f = new U()
      .subVectors(o, i.position)
      .clone()
      .applyAxisAngle(Gi, u)
      .add(i.position);
    c.push(ja(i, f));
  }
  return {
    objectBallErrorMargin: a,
    pocketDistance: i.position.distanceTo(o),
    cueBallDistance: l.distanceTo(s.position),
    cueBallErrorMargin: Hg(c[0], s.position, c[1]) / 2,
    cutAngle: Math.PI - Hg(o, l, s.position),
  };
}

// Named Exports for Modular Application Architecture
export {
  np as Simulator,
  cy as DEFAULT_CONFIG,
  lo as Ball,
  An as BallState,
  Qd as Cue,
  AD as TableBed,
  Kr as PhysicsEvent,
  ip as loadDrillBalls,
  PD as loadCustomBalls,
  My as evaluateShotDifficulty,
  Zg as PhysicsError,
  Cr as CUE_BALL_TYPE
};

export default np;
