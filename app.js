'use strict';

/* ============================================================
   Torn Travel Planner
   ¿A qué hora salgo para aterrizar justo en el restock del shop?
   ============================================================ */

/* ---------------------------- constantes ---------------------------- */

const MIN = 60_000;
const STORAGE_KEY = 'torn-travel-planner:v1';
const KEY_STORAGE_KEY = 'torn-travel-planner:apikey';
const MARKET_STORAGE_KEY = 'torn-travel-planner:market';
const YATA_URL = 'https://yata.yt/api/v1/travel/export/';
const YATA_TTL = 5 * MIN;

const HORIZON = 8 * 60;      // min: hasta dónde proyectamos ciclos
const MAX_CYCLES = 90;
const VISIBLE_CYCLES = 6;
const OLD_ANCHOR = 120;      // min: a partir de aquí avisamos de deriva

const COUNTRIES = {
  haw: 'Hawaii',
  mex: 'Mexico',
  cay: 'Cayman Islands',
  can: 'Canada',
  uni: 'United Kingdom',
  arg: 'Argentina',
  swi: 'Switzerland',
  jap: 'Japan',
  chi: 'China',
  uae: 'UAE',
  sou: 'South Africa',
};

const DEFAULTS = {
  country: 'haw',
  item: 'Shark Fin',
  travelTier: 'air',
  travelBook: false,
  flight: '1h29m',
  margin: 0,
  anchorMode: 'empty',
  anchorDate: '',
  anchorTime: '',
  restockDelay: '1h',
  stockMin: 10,
  stockMax: 20,
  capacity: 10,
  buyPrice: 20603,
  sellPrice: '',
  fee: 0,
  capBase: 28,
  capCompany: 'none',
  capTourism: false,
  alarmLead: 10,
};

const BOOL_FIELDS = ['travelBook', 'capTourism'];

const FIELDS = [
  'country', 'item', 'travelTier', 'travelBook', 'flight', 'margin', 'anchorMode', 'anchorDate', 'anchorTime',
  'restockDelay', 'stockMin', 'stockMax', 'capacity', 'buyPrice', 'sellPrice', 'fee',
  'capBase', 'capCompany', 'capTourism', 'alarmLead',
];

/* ------------------------- datos de vuelo (wiki) ------------------------- */
/* Torn wiki: Flight Information, 4 niveles de velocidad, con y sin travel book.
   haw · Airstrip · sin book = 89 min → el 1h29m de Shark Fin. */

const TIERS = [
  { id: 'std', label: 'Standard' },
  { id: 'air', label: 'Airstrip' },
  { id: 'wlt', label: 'WLT benefit' },
  { id: 'biz', label: 'Business Class' },
];

const TRAVEL_TIMES = {
  mex: { name: 'Ciudad Juárez', cost: 6500, plain: { std: 24, air: 17, wlt: 12, biz: 7 }, book: { std: 18, air: 13, wlt: 9, biz: 5 } },
  cay: { name: 'George Town', cost: 10000, plain: { std: 33, air: 23, wlt: 17, biz: 10 }, book: { std: 25, air: 17, wlt: 13, biz: 8 } },
  can: { name: 'Toronto', cost: 9000, plain: { std: 39, air: 27, wlt: 19, biz: 12 }, book: { std: 29, air: 20, wlt: 15, biz: 9 } },
  haw: { name: 'Honolulu', cost: 11000, plain: { std: 127, air: 89, wlt: 63, biz: 38 }, book: { std: 95, air: 67, wlt: 48, biz: 29 } },
  uni: { name: 'London', cost: 18000, plain: { std: 151, air: 106, wlt: 75, biz: 45 }, book: { std: 113, air: 80, wlt: 57, biz: 34 } },
  arg: { name: 'Buenos Aires', cost: 21000, plain: { std: 158, air: 111, wlt: 79, biz: 47 }, book: { std: 119, air: 83, wlt: 59, biz: 35 } },
  swi: { name: 'Zurich', cost: 27000, plain: { std: 166, air: 116, wlt: 83, biz: 50 }, book: { std: 125, air: 97, wlt: 62, biz: 38 } },
  jap: { name: 'Tokyo', cost: 32000, plain: { std: 213, air: 149, wlt: 107, biz: 64 }, book: { std: 160, air: 112, wlt: 80, biz: 48 } },
  chi: { name: 'Beijing', cost: 35000, plain: { std: 229, air: 160, wlt: 114, biz: 69 }, book: { std: 172, air: 120, wlt: 86, biz: 52 } },
  uae: { name: 'Dubai', cost: 32000, plain: { std: 257, air: 180, wlt: 128, biz: 77 }, book: { std: 193, air: 135, wlt: 97, biz: 58 } },
  sou: { name: 'Johannesburg', cost: 40000, plain: { std: 282, air: 197, wlt: 141, biz: 85 }, book: { std: 212, air: 148, wlt: 106, biz: 64 } },
};

/* --------------------- cadencia de restock por artículo ---------------------
   Referencia de la comunidad (TornW3B) para el artículo más movido de cada país.
   Es orientativa y puede quedar desfasada: tus observaciones tienen prioridad. */

const COMMUNITY_RESTOCK = {
  'haw:1485': { cadence: 60, depletion: 10, samples: 519, confidence: 0.94 },
  'uni:266': { cadence: 15, depletion: 30, samples: 875, confidence: 0.99 },
  'jap:206': { cadence: 120, depletion: 13, samples: 299, confidence: 0.59 },
  'chi:1494': { cadence: 30, depletion: 42, samples: 564, confidence: 0.98 },
  'uae:384': { cadence: 15, depletion: 26, samples: 967, confidence: 1.00 },
  'sou:358': { cadence: 180, depletion: 51, samples: 178, confidence: 0.31 },
  'swi:361': { cadence: 120, depletion: 2, samples: 187, confidence: 0.42 },
  'arg:256': { cadence: 15, depletion: 5, samples: 1614, confidence: 0.95 },
};

const OBS_KEY = 'torn-travel-planner:obs';
const ITEMDATA_KEY = 'torn-travel-planner:itemdata';
const REF_KEY = 'torn-travel-planner:refs';
const ALARM_KEY = 'torn-travel-planner:alarm';
const MARKETQTY_KEY = 'torn-travel-planner:marketqty';

/* capacidad según la tabla del wiki:
   base (vuelo + facción + maleta) + book + compañía; Tourism Day la dobla,
   salvo el bonus de Flower/Toy Shop, que cuenta una sola vez. */
const CAP = {
  base: 28,
  book: 10,
  company: {
    none: { bonus: 0, doubles: true },
    f5: { bonus: 5, doubles: false },
    c5: { bonus: 5, doubles: true },
    s2: { bonus: 2, doubles: true },
  },
};

const NIGHT_FROM = 0;    // hora local (Europa) desde la que el restock es "de madrugada"
const NIGHT_TO = 8;
const MIN_SAMPLES = 2;   // observaciones mínimas para fiarse de lo aprendido

/* ----------------------------- helpers ----------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

const addMinutes = (date, min) => new Date(date.getTime() + min * MIN);

function num(raw) {
  if (raw == null || String(raw).trim() === '') return null;
  const n = parseFloat(String(raw).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** "1h29m" | "89" | "1:29" | "1h 29" → 89 (minutos) */
function parseDuration(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().toLowerCase().replace(',', '.');
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);

  const hm = s.match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/);
  if (hm) return +hm[1] * 60 + +hm[2] + (hm[3] ? +hm[3] / 60 : 0);

  const re = /(\d+(?:\.\d+)?)\s*([a-z]*)/g;
  let m, total = 0, ok = false, loose = null;
  while ((m = re.exec(s)) !== null) {
    const value = parseFloat(m[1]);
    const unit = m[2];
    if (!unit) { loose = value; ok = true; continue; }
    if (/^(h|hs|hr|hrs|hora|horas)$/.test(unit)) { total += value * 60; ok = true; }
    else if (/^(m|min|mins|minuto|minutos)$/.test(unit)) { total += value; ok = true; }
    else if (/^(s|seg|segs|segundo|segundos)$/.test(unit)) { total += value / 60; ok = true; }
    else return null;
  }
  if (loose !== null) total += loose;
  return ok ? total : null;
}

/** 89 → "1h 29m" */function fmtDuration(minutes) {
  if (minutes == null || !Number.isFinite(minutes)) return '—';
  const neg = minutes < -1e-9;
  let h = Math.floor(Math.abs(minutes) / 60);
  let m = Math.round(Math.abs(minutes) - h * 60);
  if (m === 60) { h += 1; m = 0; }
  const out = h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  return neg ? `−${out}` : out;
}

function fmtCountdown(ms) {
  const sign = ms < 0 ? '−' : '';
  let s = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  parts.push(`${h ? String(m).padStart(2, '0') : m}m`);
  parts.push(`${String(s).padStart(2, '0')}s`);
  return sign + parts.join(' ');
}

const fmtMoney = (n) => (n == null || !Number.isFinite(n) ? '—' : `$${Math.round(n).toLocaleString('en-US')}`);

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function fmtClock(date, ref = new Date()) {
  const t = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  if (sameDay(date, ref)) return t;
  const diff = Math.round((date.getTime() - ref.getTime()) / (24 * 60 * MIN));
  if (diff === 1) return `mañana ${t}`;
  if (diff === -1) return `ayer ${t}`;
  return `${date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} ${t}`;
}

/* ------------------------------ estado ------------------------------ */

let model = null;          // último modelo calculado
let lastRender = 0;        // ts del último render completo
let itemIndex = new Map(); // nombre(minúsculas) → { id, name, quantity, cost }
let buyPriceTouched = false;
let yata = { at: 0, data: null };
let market = {};           // id de artículo → precio de venta (localStorage)
let itemData = {};         // "país:item" → { cadence, durMin, durMax } puestos a mano
let observations = [];     // historial de anclas del jugador, para aprender
let refs = {};             // "país:item" → datos importados de la comunidad
let lastItemKey = null;    // para no pisar valores al repintar
let marketQty = {};        // id de artículo → unidades del listado más barato
let capacityTouched = false;
let alarm = { enabled: false, lead: 10, firedFor: null, ctx: null, titleTimer: null };

/* -------------------------- ancla y ciclos -------------------------- */

function resolveAnchor(raw, now) {
  const m = /^(\d{1,2}):(\d{2})/.exec(raw || '');
  if (!m) return null;
  const d = new Date(now);
  d.setHours(+m[1], +m[2], 0, 0);
  // una hora un poco "en el futuro" es casi seguro un despiste: la del día anterior
  if (d.getTime() > now.getTime() + 2 * MIN) d.setDate(d.getDate() - 1);
  return d;
}

/** con fecha explícita (para anotar lo que viste ayer o anteayer) o, si no, con la heurística de arriba */
function resolveAnchorFull(dateStr, timeStr, now = new Date()) {
  if (!timeStr) return null;
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec((dateStr || '').trim());
  if (!dm) return resolveAnchor(timeStr, now);
  const m = /^(\d{1,2}):(\d{2})/.exec(timeStr);
  if (!m) return null;
  return new Date(+dm[1], +dm[2] - 1, +dm[3], +m[1], +m[2], 0, 0);
}

const toDateInput = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Modelo del ciclo del shop.
 *   modo "empty"   → primer restock = ancla + delay  (exacto, sin incertidumbre)
 *   modo "restock" → primer restock = ancla + delay + duración del stock (rango)
 *   ciclo siguiente = delay + duración del stock
 */
function buildModel(f, now) {
  const errors = [];
  const flight = parseDuration(f.flight);
  if (flight == null || flight <= 0) errors.push('duración del vuelo');

  const delay = parseDuration(f.restockDelay);
  if (delay == null || delay < 0) errors.push('tiempo hasta el restock');

  const margin = Math.max(0, num(f.margin) ?? 0);
  const durMin = Math.max(0, num(f.stockMin) ?? 0);
  const durMax = Math.max(durMin, num(f.stockMax) ?? durMin);
  const durTyp = (durMin + durMax) / 2;

  const anchor = resolveAnchorFull(f.anchorDate, f.anchorTime, now);
  if (!anchor) errors.push('hora del ancla');

  const base = {
    now, anchor, errors, flight, delay, margin, durMin, durMax, durTyp,
    firstRestock: null, cycles: [], visible: [], primary: null, runNow: null,
    capacity: num(f.capacity), buyPrice: num(f.buyPrice), sellPrice: num(f.sellPrice),
    fee: Math.max(0, num(f.fee) ?? 0),
  };
  if (errors.length) return base;

  const cycles = [];
  let lo, hi;
  if (f.anchorMode === 'empty') {
    lo = hi = addMinutes(anchor, delay);
  } else {
    lo = addMinutes(anchor, delay + durMin);
    hi = addMinutes(anchor, delay + durMax);
  }
  base.firstRestock = lo;

  const period = delay + durTyp;
  const horizon = now.getTime() + HORIZON * MIN;
  for (let i = 0; i < MAX_CYCLES && lo.getTime() <= horizon; i++) {
    cycles.push({
      n: i + 1,
      restockLo: lo,
      restockHi: hi,
      departure: addMinutes(lo, -(flight + margin)),
      stockEnd: addMinutes(hi, durMax),
      maxWait: (hi.getTime() - lo.getTime()) / MIN,
    });
    lo = addMinutes(lo, period);
    hi = addMinutes(hi, period);
  }

  base.cycles = cycles;
  base.visible = cycles.filter((c) => c.stockEnd.getTime() >= now.getTime()).slice(0, VISIBLE_CYCLES);
  base.primary = cycles.find((c) => c.departure.getTime() >= now.getTime()) || null;

  const arrival = addMinutes(now, flight);
  base.runNow = { arrival, ev: evaluateArrival(arrival, cycles, durMin, durMax) };
  return base;
}

/** ¿Qué pasa si llego a esa hora? */
function evaluateArrival(arrival, cycles, durMin, durMax) {
  const prev = [...cycles].reverse().find((c) => c.restockLo.getTime() <= arrival.getTime());
  const next = cycles.find((c) => c.restockLo.getTime() > arrival.getTime());
  if (prev) {
    const since = (arrival.getTime() - prev.restockLo.getTime()) / MIN;
    if (since <= durMin) return { kind: 'in', since, prev, next };
    if (since <= durMax) return { kind: 'maybe', since, prev, next };
  }
  if (next) return { kind: 'early', wait: (next.restockLo.getTime() - arrival.getTime()) / MIN, prev, next };
  return { kind: 'far', prev, next: null };
}

/* ------------------------------ render ------------------------------ */

function readForm() {
  const f = {};
  for (const id of FIELDS) {
    f[id] = BOOL_FIELDS.includes(id) ? $('#' + id).checked : $('#' + id).value;
  }
  return f;
}

function save(f) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
  } catch { /* modo privado: da igual */ }
}

function render() {
  const f = readForm();
  model = buildModel(f, new Date());
  lastRender = Date.now();
  renderHero(model);
  renderTable(model);
  renderTimeline(model);
  renderNumbers(model);
  renderHints(model, f);
  save(f);
}

function renderHero(m) {
  const hero = $('#hero');

  if (m.errors.length) {
    hero.innerHTML = `<div class="hero-empty">
      Completá <b>${m.errors.map(esc).join('</b>, <b>')}</b> para calcular la hora de salida.
    </div>`;
    return;
  }

  const p = m.primary;
  const run = runNowNote(m);
  const warnings = warningsFor(m);

  if (!p) {
    hero.innerHTML = `<div class="hero-empty">Sin restocks proyectados en las próximas ${HORIZON / 60} h.</div>${run}${warnings}`;
    return;
  }

  const waitNote = p.maxWait > 0.5
    ? `llegando al restock más temprano esperarías hasta <b>${esc(fmtDuration(p.maxWait))}</b> si tarda en caer`
    : 'el primer restock queda clavado';

  const nowCell = (m.runNow.ev.kind === 'in' || m.runNow.ev.kind === 'maybe')
    ? `<div><span class="k">Si salís ya</span><span class="v">${esc(fmtClock(m.runNow.arrival, m.now))}</span></div>`
    : '';

  hero.innerHTML = `
    <div class="hero-main">
      <div class="hero-label">Despegá a las</div>
      <div class="hero-time">${esc(fmtClock(p.departure, m.now))}</div>
      <div class="hero-count">
        <span class="lbl">en</span>
        <span class="js-count" data-ts="${p.departure.getTime()}">${esc(fmtCountdown(p.departure - m.now))}</span>
      </div>
    </div>
    <div class="hero-details">
      <div><span class="k">Aterrizas</span><span class="v">${esc(fmtClock(p.restockLo, m.now))}</span></div>
      <div><span class="k">Restock</span><span class="v">${esc(fmtClock(p.restockLo, m.now))}${p.restockHi.getTime() > p.restockLo.getTime() ? ' – ' + esc(fmtClock(p.restockHi, m.now)) : ''}</span></div>
      <div><span class="k">Stock hasta</span><span class="v">${esc(fmtClock(p.stockEnd, m.now))}</span></div>
      <div><span class="k">Vuelo + margen</span><span class="v">${esc(fmtDuration(m.flight + m.margin))}</span></div>
      ${nowCell}
    </div>
    <div class="note">🎯 Objetivo: ciclo <b>V${p.n}</b>, ${waitNote}.</div>
    ${run}${warnings}`;
}

function runNowNote(m) {
  const { arrival, ev } = m.runNow;
  const at = esc(fmtClock(arrival, m.now));
  switch (ev.kind) {
    case 'in':
      return `<div class="note hot">🚨 <b>Si salís ahora</b> aterrizás ${at}, ${esc(fmtDuration(ev.since))} después del restock de las ${esc(fmtClock(ev.prev.restockLo, m.now))}. Con un stock que dura ${esc(fmtDuration(m.durMin))}–${esc(fmtDuration(m.durMax))} <b>todavía lo pillás</b>.</div>`;
    case 'maybe':
      return `<div class="note maybe">⚠️ <b>Si salís ahora</b> aterrizás ${at}, ${esc(fmtDuration(ev.since))} después del restock. El stock puede estar ya agotado: empieza a ser lotería.</div>`;
    case 'early':
      return `<div class="note early">🧳 <b>Si salís ahora</b> aterrizás ${at} y el próximo restock es a las ${esc(fmtClock(ev.next.restockLo, m.now))}: esperarías ${esc(fmtDuration(ev.wait))} en el destino. La salida óptima es a las ${esc(fmtClock(ev.next.departure, m.now))}.</div>`;
    default:
      return '';
  }
}

function warningsFor(m) {
  const out = [];
  const age = (m.now.getTime() - m.anchor.getTime()) / MIN;
  if (age > OLD_ANCHOR) {
    out.push(`📌 El ancla es de hace <b>${esc(fmtDuration(age))}</b>: cada ciclo arrastra la incertidumbre del stock (±${esc(fmtDuration((m.durMax - m.durMin) / 2))} por ciclo). Reanclá el shop a 0 cuando puedas.`);
  }
  if (m.primary && m.primary.n > 1) {
    out.push(`⏳ El próximo restock ya no es alcanzable saliendo después de ahora; esta es la ventana <b>V${m.primary.n}</b>.`);
  }
  return out.map((t) => `<div class="note">${t}</div>`).join('');
}

function renderTable(m) {
  const box = $('#results');
  if (m.errors.length || !m.visible.length) {
    box.innerHTML = '<p class="hint">Sin ventanas que mostrar.</p>';
    return;
  }

  const rows = m.visible.map((c) => {
    const past = c.departure.getTime() < m.now.getTime();
    const isPrimary = m.primary && c.n === m.primary.n;
    const badge = isPrimary
      ? '<span class="badge primary">salir</span>'
      : past ? '<span class="badge past">pasada</span>' : '';
    const restock = c.restockHi.getTime() > c.restockLo.getTime()
      ? `${esc(fmtClock(c.restockLo, m.now))} – ${esc(fmtClock(c.restockHi, m.now))}`
      : esc(fmtClock(c.restockLo, m.now));

    return `<tr class="${isPrimary ? 'is-primary' : ''}">
      <td>V${c.n}</td>
      <td class="win">${restock}</td>
      <td class="${past ? 'bad' : ''}">${esc(fmtClock(c.departure, m.now))}</td>
      <td class="col-wait">${c.maxWait > 0.5 ? esc(fmtDuration(c.maxWait)) : '—'}</td>
      <td class="good">${esc(fmtClock(c.stockEnd, m.now))}</td>
      <td>${badge}</td>
    </tr>`;
  }).join('');

  box.innerHTML = `
    <div class="table-wrap">
      <table class="cycles">
        <thead><tr>
          <th>#</th><th>Restock</th><th>Salir</th><th class="col-wait">Espera máx.</th><th>Stock hasta</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="hint">
      «Stock hasta» es el peor caso (el stock aguanta ${esc(fmtDuration(m.durMax))} desde el restock).
      Anclando el shop a 0 la primera fila queda exacta; las siguientes arrastran la horquilla.
    </p>`;
}

function renderTimeline(m) {
  const box = $('#timeline');
  const cs = m.visible.slice(0, 5);
  if (m.errors.length || !cs.length) {
    box.innerHTML = '';
    return;
  }

  const t0 = Math.min(m.now.getTime(), ...cs.map((c) => c.departure.getTime())) - 5 * MIN;
  const t1 = Math.max(m.now.getTime() + 60 * MIN, ...cs.map((c) => c.stockEnd.getTime())) + 10 * MIN;
  const span = t1 - t0;
  const pct = (t) => ((t - t0) / span) * 100;

  const bar = (from, to, cls, tag, minPct = 8) => {
    const l = Math.max(0, pct(from.getTime()));
    const r = Math.min(100, pct(to.getTime()));
    const width = r - l;
    if (width <= 0.05) return '';
    const label = width >= minPct ? tag : '';
    return `<div class="tl-bar ${cls}" style="left:${l.toFixed(3)}%;width:${width.toFixed(3)}%">${esc(label)}</div>`;
  };

  // pocas etiquetas: como mucho 7 en todo el ancho
  const steps = [30, 60, 120, 180, 240, 360];
  const spanMin = span / MIN;
  const tick = (steps.find((s) => spanMin / s <= 7) ?? 360) * MIN;
  const ticks = [];
  for (let t = Math.ceil(t0 / tick) * tick; t <= t1; t += tick) {
    ticks.push(`<div class="tl-tick" style="left:${pct(t).toFixed(3)}%">${esc(fmtClock(new Date(t), m.now))}</div>`);
  }

  const nowPct = pct(m.now.getTime()).toFixed(3);
  const rows = cs.map((c) => `<div class="tl-row">
      <div class="tl-name">V${c.n}</div>
      <div class="tl-track">
        <div class="tl-now" style="left:${nowPct}%"></div>
        ${bar(c.departure, c.restockLo, 'flight', '✈ ' + fmtDuration((c.restockLo - c.departure) / MIN))}
        ${bar(c.restockLo, c.stockEnd, 'stock', 'restock')}
      </div>
    </div>`).join('');

  box.innerHTML = `
    <div class="tl-title">Línea de tiempo</div>
    <div class="tl-row tl-axis"><div class="tl-name"></div><div class="tl-track">
      <div class="tl-now" style="left:${nowPct}%"></div>${ticks.join('')}
    </div></div>
    ${rows}
    <p class="hint">Azul = vuelo · Ámbar = stock disponible estimado · Rojo = ahora.</p>`;
}

function renderNumbers(m) {
  const box = $('#numbers');
  if (m.errors.length) {
    box.innerHTML = '<p class="hint">Completá los parámetros.</p>';
    return;
  }

  const cap = m.capacity;
  const invest = cap != null && m.buyPrice != null ? cap * m.buyPrice : null;
  const hasSell = cap != null && m.sellPrice != null && m.sellPrice > 0;
  const net = hasSell ? cap * m.sellPrice * (1 - m.fee / 100) : null;
  const profit = hasSell && invest != null ? net - invest : null;
  const trip = (m.flight * 2) / 60;
  const perHour = profit != null && trip > 0 ? profit / trip : null;

  const cell = (label, value, cls = '') =>
    `<div><dt>${esc(label)}</dt><dd class="${cls}">${esc(value)}</dd></div>`;

  box.innerHTML = `<dl class="stats">
      ${cell('Capacidad', cap == null ? '—' : `${cap} items`, cap == null ? 'na' : '')}
      ${cell('Inversión', invest == null ? '—' : fmtMoney(invest), invest == null ? 'na' : '')}
      ${cell('Ingreso', net == null ? '—' : fmtMoney(net), net == null ? 'na' : '')}
      ${cell('Beneficio / viaje', profit == null ? '—' : fmtMoney(profit), profit == null ? 'na' : profit >= 0 ? 'good' : 'bad')}
      ${cell('Beneficio / hora', perHour == null ? '—' : fmtMoney(perHour), perHour == null ? 'na' : perHour >= 0 ? 'good' : 'bad')}
      ${cell('Ida y vuelta', fmtDuration(m.flight * 2))}
    </dl>
    <p class="numbers-note">
      ${hasSell
        ? `${m.fee ? `Con un ${m.fee}% de comisión` : 'Sin comisión'}, cada viaje cuesta ${fmtMoney(invest)} y rinde ${fmtMoney(profit)}. «Beneficio/hora» cuenta solo el vuelo de ida y vuelta.`
        : 'Poné el <b>precio de venta en Torn</b> (item market o bazaar) para ver el beneficio. El coste abroad lo rellena el stock de YATA.'}
    </p>`;
}

/** tiempo de vuelo del wiki según destino, nivel y travel book */
function autoFlight() {
  const times = TRAVEL_TIMES[$('#country').value];
  if (!times) return null;
  const tier = $('#travelTier').value || 'air';
  const table = $('#travelBook').checked ? times.book : times.plain;
  const minutes = table[tier];
  if (minutes == null) return null;
  return { minutes, tier, withBook: $('#travelBook').checked, cost: times.cost };
}

function applyAutoFlight() {
  const auto = autoFlight();
  if (auto) $('#flight').value = fmtDuration(auto.minutes);
}

function renderHints(m, f) {
  const flight = parseDuration(f.flight);
  const code = $('#country').value;
  const times = TRAVEL_TIMES[code];
  const tier = $('#travelTier').value;
  const tierLabel = (TIERS.find((t) => t.id === tier) || {}).label || tier;
  const auto = autoFlight();

  if (flight == null) {
    $('#flightHint').textContent = 'Formatos: 89 · 1h29m · 1:29';
  } else if (!times || !auto) {
    $('#flightHint').textContent = `= ${fmtDuration(flight)} (${Math.round(flight)} min)`;
  } else {
    const matches = Math.abs(auto.minutes - flight) < 0.5;
    $('#flightHint').innerHTML = `= <b>${esc(fmtDuration(flight))}</b> (${Math.round(flight)} min) ·
      ${esc(COUNTRIES[code])} · ${esc(tierLabel)}${$('#travelBook').checked ? ' + book' : ''} ·
      wiki: <b>${esc(fmtDuration(auto.minutes))}</b>${matches ? '' : ' (lo has cambiado a mano)'} ·
      vuelo ${esc(fmtMoney(times.cost))}`;
  }

  $('#anchorHint').innerHTML = (m.anchor && m.firstRestock)
    ? `Ancla <b>${esc(fmtClock(m.anchor, m.now))}</b> (hace ${esc(fmtDuration((m.now.getTime() - m.anchor.getTime()) / MIN))}) ·
       primer restock <b>${esc(fmtClock(m.firstRestock, m.now))}</b>`
    : 'Elegí cuándo lo viste (vacío o recién restockeado) para anclar el cálculo.';

  $('#cycleHint').innerHTML = m.errors.length
    ? ''
    : `Ciclo completo: <b>${esc(fmtDuration(m.delay + m.durTyp))}</b>
       (restock ${esc(fmtDuration(m.delay))} + stock ~${esc(fmtDuration(m.durTyp))})`;

  renderTimingsHint();
  renderObservations();
  renderCapacity();
  renderProjectedButton();
}

/* ---------------------------- tick (1 Hz) ---------------------------- */

function tick() {
  const now = Date.now();
  checkAlarm(now);                 // la alarma también debe saltar con la pestaña de fondo
  if (document.hidden) return;

  for (const node of $$('.js-count')) {
    const ts = Number(node.dataset.ts);
    if (!Number.isFinite(ts)) continue;
    const diff = ts - now;
    node.textContent = fmtCountdown(diff);
    node.classList.toggle('overdue', diff < 0);
  }

  if (model && model.primary && model.primary.departure.getTime() < now) render();
  else if (now - lastRender > 15_000) render();
}

/* ------------------------------- YATA ------------------------------- */

async function fetchYata(force = false) {
  if (!force && yata.data && Date.now() - yata.at < YATA_TTL) return yata.data;
  const res = await fetch(YATA_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  yata = { at: Date.now(), data: await res.json() };
  return yata.data;
}

function applyItemFromIndex() {
  const hit = itemIndex.get($('#item').value.trim().toLowerCase());
  if (!hit) return null;
  if (!buyPriceTouched) $('#buyPrice').value = hit.cost;
  return hit;
}

async function refreshYata(force = false) {
  const status = $('#yataStatus');
  const code = $('#country').value;
  status.textContent = 'Cargando stock de la comunidad…';
  try {
    const data = await fetchYata(force);
    const country = data?.stocks?.[code];
    if (!country) {
      status.textContent = 'YATA no tiene datos de este país.';
      return;
    }
    itemIndex = new Map(country.stocks.map((it) => [String(it.name).toLowerCase(), it]));
    $('#itemList').innerHTML = country.stocks
      .map((it) => `<option value="${esc(it.name)}">${esc(fmtMoney(it.cost))}</option>`)
      .join('');

    const age = Math.max(0, Math.round((Date.now() - country.update * 1000) / MIN));
    const hit = applyItemFromIndex();
    status.innerHTML = `Stock de <b>${esc(COUNTRIES[code] || code)}</b> vía YATA ·
      última lectura de la comunidad hace <b>${age} min</b> · ${country.stocks.length} artículos.` +
      (hit ? `<br>${esc(hit.name)}: <b>${hit.quantity}</b> uds a ${esc(fmtMoney(hit.cost))}.` : '');

    // con los ids ya cargados podemos unificar datos guardados por id y aplicar lo que sepamos
    migrateItemKeys();
    lastItemKey = null;
    applyItemTimings({ force: true });
    render();
    renderComparator();
  } catch (e) {
    status.innerHTML = `No pude leer YATA (<code>${esc(e.message)}</code>). Podés poner el coste a mano.`;
  }
}

/* ------------- artículo: cadencia de restock y duración del stock ------------- */

function loadItemState() {
  try { itemData = JSON.parse(localStorage.getItem(ITEMDATA_KEY) || '{}') || {}; } catch { itemData = {}; }
  try { observations = JSON.parse(localStorage.getItem(OBS_KEY) || '[]') || []; } catch { observations = []; }
  try { refs = JSON.parse(localStorage.getItem(REF_KEY) || '{}') || {}; } catch { refs = {}; }
}

function saveItemState(key, store) {
  try { localStorage.setItem(key, JSON.stringify(store)); } catch { /* ignorar */ }
}

function countryCode() { return $('#country').value; }

function resolvedItem() { return itemIndex.get($('#item').value.trim().toLowerCase()) || null; }

/** la clave guarda cadencia y duración por artículo y país.
    Se basa en el nombre (no en el id) para que no dependa de que YATA haya cargado. */
function currentItemKey() {
  const item = $('#item').value.trim();
  if (!item) return null;
  return `${countryCode()}:${item.toLowerCase()}`;
}

/** id → nombre de todos los países, para poder migrar claves antiguas por id */
function idToNameMap() {
  const map = new Map();
  for (const [code, country] of Object.entries(yata.data?.stocks || {})) {
    for (const it of country.stocks || []) map.set(`${code}:${it.id}`, it.name);
  }
  return map;
}

/** si algún dato quedó guardado con el id del artículo (por ejemplo, sin YATA cargado), lo pasa a nombre */
function migrateItemKeys() {
  const map = idToNameMap();
  if (!map.size) return;
  let changed = false;

  for (const [key, value] of Object.entries(itemData)) {
    const name = map.get(key);
    if (!name) continue;
    const target = `${key.split(':')[0]}:${name.toLowerCase()}`;
    itemData[target] = { ...(itemData[target] || {}), ...value };
    delete itemData[key];
    changed = true;
  }

  observations = observations.map((o) => {
    const name = map.get(o.key);
    if (!name) return o;
    changed = true;
    return { ...o, key: `${o.key.split(':')[0]}:${name.toLowerCase()}` };
  });

  const seen = new Set();
  observations = observations
    .sort((a, b) => a.at - b.at)
    .filter((o) => {
      const sig = `${o.key}|${o.mode}|${o.at}`;
      if (seen.has(sig)) { changed = true; return false; }
      seen.add(sig);
      return true;
    });

  if (changed) {
    saveItemState(ITEMDATA_KEY, itemData);
    saveItemState(OBS_KEY, observations);
  }
}

/** la referencia (importada o de la semilla) está indexada por país y id de artículo */
function refFor() {
  const hit = resolvedItem();
  if (!hit) return null;
  const key = `${countryCode()}:${hit.id}`;
  return refs[key] || COMMUNITY_RESTOCK[key] || null;
}

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const quantile = (arr, q) => {
  const s = [...arr].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
};

const bandOf = (hour) => (hour >= NIGHT_FROM && hour < NIGHT_TO ? 'noche' : 'dia');
const BAND_LABEL = { noche: 'madrugada', dia: 'día' };

/** a qué franja cae el restock que estamos calculando (para usar tus datos de madrugada) */
function bandFromForm() {
  const anchor = resolveAnchorFull($('#anchorDate').value, $('#anchorTime').value, new Date());
  const delay = parseDuration($('#restockDelay').value);
  if (!anchor || delay == null) return 'dia';
  return bandOf(new Date(anchor.getTime() + delay * MIN).getHours());
}

/**
 * Aprende de tus anclas: vacía→restock da la cadencia, restock→vacía da lo que aguanta el stock.
 * La duración se guarda además por franja horaria, porque de madrugada tarda más en vaciarse.
 */
function learnStats(key) {
  const list = observations.filter((o) => o.key === key).sort((a, b) => a.at - b.at);
  const cadences = [];
  const depletions = [];
  const byBand = { noche: [], dia: [] };

  for (let i = 1; i < list.length; i++) {
    const a = list[i - 1];
    const b = list[i];
    const minutes = (b.at - a.at) / MIN;
    if (a.mode === 'empty' && b.mode === 'restock' && minutes >= 1 && minutes <= 600) {
      cadences.push(minutes);
    } else if (a.mode === 'restock' && b.mode === 'empty' && minutes >= 0.5 && minutes <= 600) {
      depletions.push(minutes);
      byBand[bandOf(new Date(a.at).getHours())].push(minutes);
    }
  }

  const stat = (arr) => (arr.length ? {
    n: arr.length, median: median(arr), p25: quantile(arr, 0.25), p75: quantile(arr, 0.75),
  } : { n: 0, median: null, p25: null, p75: null });

  return { cadence: stat(cadences), depletion: stat(depletions), byBand: { noche: stat(byBand.noche), dia: stat(byBand.dia) } };
}

/** lo que sabemos de este artículo, con prioridad: manual > tus datos > referencia > defecto */
function deriveTimings(key) {
  const manual = itemData[key] || {};
  const learned = learnStats(key);
  const ref = refFor();
  const band = bandFromForm();
  const bandStat = learned.byBand[band];

  const pick = (manualValue, learnedValue, samples, refValue, fallback) => {
    if (manualValue != null) return { value: manualValue, source: 'manual' };
    if (learnedValue != null && samples >= MIN_SAMPLES) return { value: learnedValue, source: 'mine' };
    if (refValue != null) return { value: refValue, source: 'comm' };
    return { value: fallback, source: 'default' };
  };

  const fallbackCadence = parseDuration(DEFAULTS.restockDelay);
  const cadence = pick(manual.cadence, learned.cadence.median, learned.cadence.n, ref?.cadence, fallbackCadence);

  // la duración solo sale de tus medidas (con su dispersión) o de tu rango por defecto:
  // la referencia de la comunidad da un promedio, así que se muestra como pista pero no manda
  const durLearned = (bandStat.median != null && bandStat.n >= MIN_SAMPLES) ? bandStat : learned.depletion;
  const durMin = pick(manual.durMin, durLearned.p25 ?? durLearned.median, durLearned.n, null, DEFAULTS.stockMin);
  const durMax = pick(manual.durMax, durLearned.p75 ?? durLearned.median, durLearned.n, null, DEFAULTS.stockMax);

  return { cadence, durMin, durMax, learned, ref, band, bandStat };
}

/** vuelca lo que sabemos en el formulario.
    La cadencia solo se reescribe al cambiar de artículo; la duración también cuando cambia
    la franja horaria, porque de madrugada el stock aguanta más. */
function applyItemTimings({ force = false } = {}) {
  const key = currentItemKey();
  if (!key) return;
  const keyChanged = key !== lastItemKey;
  lastItemKey = key;

  const d = deriveTimings(key);
  if (keyChanged || force) $('#restockDelay').value = fmtDuration(Math.round(d.cadence.value));
  $('#stockMin').value = Math.round(d.durMin.value);
  $('#stockMax').value = Math.round(d.durMax.value);
}

function clearItemTimings() {
  const key = currentItemKey();
  if (!key) return;
  delete itemData[key];
  saveItemState(ITEMDATA_KEY, itemData);
  lastItemKey = null;
  applyItemTimings({ force: true });
  render();
}

/** guarda en itemData solo lo que el jugador escriba a mano */
function rememberManual(id, value) {
  const key = currentItemKey();
  if (!key) return;
  itemData[key] = itemData[key] || {};
  if (id === 'restockDelay') itemData[key].cadence = value;
  else if (id === 'stockMin') itemData[key].durMin = value;
  else if (id === 'stockMax') itemData[key].durMax = Math.max(value, num($('#stockMin').value) ?? value);
  saveItemState(ITEMDATA_KEY, itemData);
}

const SOURCE_BADGE = {
  manual: '<span class="src manual">manual</span>',
  mine: '<span class="src mine">tus datos</span>',
  comm: '<span class="src comm">referencia</span>',
  default: '<span class="src">defecto</span>',
};

function renderTimingsHint() {
  const box = $('#itemDataHint');
  const key = currentItemKey();
  const name = $('#item').value.trim();
  if (!key || !name) {
    box.innerHTML = 'Elegí un artículo para ver su cadencia de restock.';
    return;
  }

  const d = deriveTimings(key);
  const pieces = [
    `<b>${esc(name)}</b>`,
    `cadencia <b>${esc(fmtDuration(Math.round(d.cadence.value)))}</b> ${SOURCE_BADGE[d.cadence.source]}`,
    `stock <b>${esc(fmtDuration(Math.round(d.durMin.value)))}</b>${Math.round(d.durMax.value) !== Math.round(d.durMin.value) ? `–<b>${esc(fmtDuration(Math.round(d.durMax.value)))}</b>` : ''} ${SOURCE_BADGE[d.durMin.source]}`,
  ];

  const notes = [];
  const cad = d.learned.cadence.n;
  const dep = d.learned.depletion.n;
  if (cad) notes.push(`${cad} ${cad === 1 ? 'medida tuya' : 'medidas tuyas'} de cadencia`);
  if (dep) notes.push(`${dep} de duración`);
  const usedMine = d.cadence.source === 'mine' || d.durMin.source === 'mine';
  if (!usedMine && (cad || dep)) notes.push(`con ${MIN_SAMPLES} ya las uso yo`);
  if (d.ref) {
    const bits = [];
    if (d.ref.cadence) bits.push(`restock ${fmtDuration(d.ref.cadence)}`);
    if (d.ref.depletion) bits.push(`stock ~${fmtDuration(d.ref.depletion)}`);
    notes.push(`comunidad: ${bits.join(', ')} (${d.ref.samples} muestras, ${Math.round((d.ref.confidence ?? 0) * 100)}% fiabilidad)`);
  }
  const night = d.learned.byBand.noche;
  const day = d.learned.byBand.dia;
  if (night.n && day.n) {
    notes.push(`de <b>madrugada</b> aguanta ${esc(fmtDuration(Math.round(night.median)))} y de día ${esc(fmtDuration(Math.round(day.median)))} (tus datos)`);
  }
  const bandNote = d.bandStat.n >= MIN_SAMPLES ? ` · usando tu media de ${BAND_LABEL[d.band]}` : '';

  box.innerHTML = `${pieces.join(' · ')}${bandNote}` + (notes.length ? `<br>${notes.join(' · ')}` : '');
}

function renderObservations() {
  const summary = $('#obsSummary');
  const body = $('#obsBody');
  const key = currentItemKey();
  const mine = key ? observations.filter((o) => o.key === key) : [];
  const stat = key ? learnStats(key) : null;

  summary.innerHTML = observations.length
    ? `Tienes <b>${observations.length}</b> observaciones guardadas` +
      (mine.length ? `, <b>${mine.length}</b> de este artículo.` : ' (ninguna de este artículo).')
    : 'Anota lo que ves en el shop y la app aprende la cadencia y lo que aguanta el stock. Con dos anclas del mismo artículo ya saca datos.';

  if (!observations.length) { body.innerHTML = ''; return; }

  const statCell = (label, s, unit = '') => `<div>
      <span class="k">${esc(label)}</span>
      <span class="v">${s.n ? esc(fmtDuration(Math.round(s.median))) : '—'}${s.n && unit ? ` <small>${esc(unit)}</small>` : ''}</span>
    </div>`;

  const stats = stat && (stat.cadence.n || stat.depletion.n)
    ? `<div class="obs-stats">
        ${statCell('Cadencia medida', stat.cadence, stat.cadence.n ? `(${stat.cadence.n})` : '')}
        ${statCell('Aguanta el stock', stat.depletion, stat.depletion.n ? `(${stat.depletion.n})` : '')}
        ${statCell('Madrugada', stat.byBand.noche, stat.byBand.noche.n ? `(${stat.byBand.noche.n})` : '')}
        ${statCell('Día', stat.byBand.dia, stat.byBand.dia.n ? `(${stat.byBand.dia.n})` : '')}
      </div>`
    : '<p class="hint">Con dos anclas alternas del mismo artículo (vacía → restock) ya se calcula la cadencia.</p>';

  const shown = (key && mine.length ? mine : observations);
  const rows = [...shown].sort((a, b) => b.at - a.at).slice(0, 12).map((o) => `
    <tr>
      <td>${esc(fmtClock(new Date(o.at)))}</td>
      <td class="cmp-name">${esc(o.item)}</td>
      <td>${o.mode === 'empty' ? 'vacío' : 'restock'}</td>
    </tr>`).join('');

  body.innerHTML = `${stats}
    <div class="obs-list"><table class="cycles cmp">
      <thead><tr><th>Hora</th><th>Artículo</th><th>Estado</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
}

function saveObservation() {
  const key = currentItemKey();
  const anchor = resolveAnchorFull($('#anchorDate').value, $('#anchorTime').value, new Date());
  if (!key || !anchor) {
    $('#obsSummary').innerHTML = 'Necesito un artículo y una hora de ancla para guardar la observación.';
    return;
  }
  const mode = $('#anchorMode').value;
  const at = anchor.getTime();
  const exists = observations.some((o) => o.key === key && o.mode === mode && o.at === at);
  if (!exists) {
    observations.push({ key, item: $('#item').value.trim(), mode, at });
    saveItemState(OBS_KEY, observations);
  }
  lastItemKey = null;               // deja que lo aprendido se aplique
  applyItemTimings({ force: true });
  render();
  $('#obsBox').open = true;
  $('#obsSummary').innerHTML = exists
    ? 'Esa observación ya estaba guardada.'
    : `Guardada: <b>${esc($('#item').value.trim())}</b> ${mode === 'empty' ? 'vacío' : 'restockeado'} a las ${esc(fmtClock(anchor))}.`;
}

function clearObservations() {
  observations = [];
  saveItemState(OBS_KEY, observations);
  lastItemKey = null;
  applyItemTimings({ force: true });
  render();
}

function importCommunityRefs(text) {
  const status = $('#importStatus');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    status.textContent = 'No pude leerlo como JSON: copia la respuesta completa de la petición.';
    return;
  }
  const analyses = data?.analyses || data;
  if (!analyses || typeof analyses !== 'object') {
    status.textContent = 'No encuentro el bloque "analyses" en ese JSON.';
    return;
  }

  let count = 0;
  for (const [rawKey, entry] of Object.entries(analyses)) {
    // weav3r usa "haw-1485"; normalizamos a "haw:1485"
    const m = /^([a-z]{3})[-:](\d+)$/.exec(String(rawKey).trim());
    if (!m || !entry || typeof entry !== 'object') continue;
    const key = `${m[1]}:${m[2]}`;
    const cadence = num(entry.restockCadenceMinutes);
    const depletion = num(entry.avgTimeToDeplete);
    if (cadence == null && depletion == null) continue;
    refs[key] = {
      cadence: cadence ?? undefined,
      depletion: depletion ?? undefined,
      samples: num(entry.restockCadenceSamples) ?? 0,
      confidence: num(entry.restockConfidence) ?? 0,
      projectedRestockAt: entry.projectedRestockAt || undefined,
      projectedDepletionAt: entry.projectedDepletionAt || undefined,
      currentQuantity: num(entry.currentQuantity) ?? undefined,
      currentCost: num(entry.currentCost) ?? undefined,
    };
    count++;
  }

  if (!count) {
    status.textContent = 'El JSON no traía artículos reconocibles (formato "país-itemId").';
    return;
  }
  saveItemState(REF_KEY, refs);
  lastItemKey = null;
  applyItemTimings({ force: true });
  render();
  status.innerHTML = `Importados <b>${count}</b> artículos. Ahora la cadencia y el stock salen de esos datos si no tienes medidas propias.`;
}

/* ------------------ capacidad, alarma, listados ------------------ */

/** total de carga según los componentes del wiki (reproduce las 7 combinaciones exactas) */
function capacityTotal() {
  const base = num($('#capBase').value) ?? CAP.base;
  const company = CAP.company[$('#capCompany').value] || CAP.company.none;
  const book = $('#travelBook').checked ? CAP.book : 0;
  const total = base + book + company.bonus;
  const tourism = $('#capTourism').checked;
  const grand = tourism
    ? 2 * (base + book) + company.bonus * (company.doubles ? 2 : 1)
    : total;
  return { base, book, company, total, tourism, grand };
}

function renderCapacity() {
  const c = capacityTotal();
  const parts = [`${c.base} base`];
  if (c.book) parts.push(`${c.book} book`);
  if (c.company.bonus) parts.push(`${c.company.bonus} compañía`);
  $('#capHint').innerHTML =
    `${parts.join(' + ')} = <b>${c.total}</b>` +
    (c.tourism ? ` · Tourism Day = <b>${c.grand}</b>${c.company.bonus && !c.company.doubles ? ' (el bonus de Flower/Toy no se dobla)' : ''}` : '') +
    ` · Ahora llevas <b>${esc($('#capacity').value)}</b>.`;
}

function applyCapacity() {
  if (capacityTouched) return;
  $('#capacity').value = capacityTotal().grand;
}

/* ------------------------------- alarma ------------------------------- */

function loadAlarmState() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(ALARM_KEY) || '{}') || {}; } catch { saved = {}; }
  alarm.enabled = !!saved.enabled;
  alarm.lead = num(saved.lead) ?? 10;
  if (!num($('#alarmLead').value)) $('#alarmLead').value = alarm.lead;
  renderAlarm();
}

function saveAlarmState() {
  try {
    localStorage.setItem(ALARM_KEY, JSON.stringify({ enabled: alarm.enabled, lead: alarm.lead }));
  } catch { /* ignorar */ }
}

function renderAlarm() {
  const btn = $('#alarmToggle');
  btn.classList.toggle('on', alarm.enabled);
  btn.textContent = alarm.enabled ? '🔔 Aviso activado' : '🔔 Avisarme antes de la salida';
  $('#alarmHint').innerHTML = alarm.enabled
    ? `Te aviso <b>${alarm.lead} min</b> antes de la hora de salida. Deja la pestaña abierta.`
    : '';
}

function ensureAudio() {
  try {
    if (!alarm.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) alarm.ctx = new Ctx();
    }
    if (alarm.ctx && alarm.ctx.state === 'suspended') alarm.ctx.resume();
  } catch { /* sin audio, seguimos con el aviso visual */ }
}

function beep(times = 3) {
  if (!alarm.ctx) return;
  for (let i = 0; i < times; i++) {
    const at = alarm.ctx.currentTime + i * 0.45;
    const osc = alarm.ctx.createOscillator();
    const gain = alarm.ctx.createGain();
    osc.connect(gain);
    gain.connect(alarm.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(i % 2 ? 660 : 990, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
    osc.start(at);
    osc.stop(at + 0.37);
  }
}

function showToast(html, late = false) {
  const toast = $('#toast');
  toast.innerHTML = html;
  toast.classList.toggle('late', late);
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 20000);
}

function flashTitle() {
  const original = document.title;
  let on = false;
  clearInterval(alarm.titleTimer);
  alarm.titleTimer = setInterval(() => {
    on = !on;
    document.title = on ? '⏰ ¡Hora de salir!' : original;
  }, 1500);
  setTimeout(() => {
    clearInterval(alarm.titleTimer);
    document.title = original;
  }, 30000);
}

function fireAlarm(departureTs) {
  const p = model?.primary;
  const item = esc($('#item').value.trim() || 'tu artículo');
  const country = esc(COUNTRIES[$('#country').value] || '');
  const late = Date.now() > departureTs;
  const left = fmtDuration((departureTs - Date.now()) / MIN);
  const msg = late
    ? `¡Se te pasa! La salida para ${item}${country ? ` en ${country}` : ''} ya venció.`
    : `Salida para ${item}${country ? ` en ${country}` : ''} en <b>${left}</b>${p ? ` · restock ${esc(fmtClock(p.restockLo))}` : ''}.`;

  beep(3);
  flashTitle();
  showToast(`⏰ ${msg}`, late);

  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Torn Travel Planner', { body: msg.replace(/<[^>]+>/g, ''), tag: 'torn-travel' });
    }
  } catch { /* sin notificaciones */ }
}

function checkAlarm(now) {
  if (!alarm.enabled) return;
  const p = model?.primary;
  if (!p) return;
  const dep = p.departure.getTime();
  if (alarm.firedFor === dep) return;
  if (now < dep - alarm.lead * MIN) return;
  // si ya pasó hace mucho (la pestaña estaba cerrada), no damos la lata
  if (now - dep > 5 * MIN) { alarm.firedFor = dep; return; }
  alarm.firedFor = dep;
  fireAlarm(dep);
}

function toggleAlarm() {
  alarm.enabled = !alarm.enabled;
  if (alarm.enabled) {
    alarm.lead = num($('#alarmLead').value) ?? 10;
    ensureAudio();
    beep(1);                      // gesto del usuario: desbloquea el audio y confirma que suena
    try {
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    } catch { /* ignorar */ }
    alarm.firedFor = null;
  } else {
    alarm.firedFor = null;
  }
  saveAlarmState();
  renderAlarm();
}

/* --------------------- precios reales del item market --------------------- */

async function fetchItemMarket(id) {
  const data = await tornJson([
    (k) => `https://api.torn.com/v2/market/?selections=itemmarket&id=${id}&key=${encodeURIComponent(k)}`,
    (k) => `https://api.torn.com/v2/market/${id}/itemmarket?key=${encodeURIComponent(k)}`,
    (k) => `https://api.torn.com/market/${id}?selections=itemmarket&key=${encodeURIComponent(k)}`,
  ]);
  const block = data?.itemmarket;
  const listings = (block && (Array.isArray(block) ? block : block.listings)) || data?.listings || [];
  const prices = listings.map((l) => num(l.price)).filter((v) => v != null && v > 0);
  if (!prices.length) return null;
  const lowest = Math.min(...prices);
  const cheapest = listings.find((l) => num(l.price) === lowest);
  return { lowest, qty: num(cheapest?.quantity), count: listings.length };
}

async function loadListings() {
  const summary = $('#cmpSummary');
  const rows = comparatorRows();
  if (!rows.length) {
    summary.textContent = 'Cargá el stock de un país primero.';
    return;
  }
  let ok = 0, fail = 0, firstError = null;
  for (let i = 0; i < rows.length; i++) {
    const id = String(rows[i].item.id);
    summary.innerHTML = `Consultando listados… ${i + 1}/${rows.length}`;
    try {
      const res = await fetchItemMarket(id);
      if (res) {
        market[id] = res.lowest;
        marketQty[id] = res.qty;
        ok++;
      } else {
        fail++;
      }
    } catch (e) {
      fail++;
      firstError = firstError || e;
      if (ok === 0 && fail >= 2) break;     // el endpoint no está disponible: no insistimos
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  saveMarket();
  saveItemState(MARKETQTY_KEY, marketQty);
  renderComparator();
  render();
  summary.innerHTML = ok
    ? `Listados actualizados en <b>${ok}</b> artículos${fail ? `, ${fail} sin datos` : ''}.`
    : `No pude leer los listados: <code>${esc(firstError ? firstError.message : 'sin datos')}</code>.
       Necesitás una API key (nivel Public basta).`;
}

/* --------------------- restock proyectado (importado) --------------------- */

function projectedRestockForCurrent() {
  const ref = refFor();
  if (!ref || !ref.projectedRestockAt) return null;
  const d = new Date(ref.projectedRestockAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

function renderProjectedButton() {
  const btn = $('#useProjected');
  const projected = projectedRestockForCurrent();
  if (!projected || projected.getTime() < Date.now() - 60 * MIN) {
    btn.hidden = true;
    return;
  }
  btn.hidden = false;
  btn.textContent = `⚡ Usar restock proyectado (${fmtClock(projected)})`;
}

function useProjectedRestock() {
  const projected = projectedRestockForCurrent();
  if (!projected) return;
  $('#anchorMode').value = 'restock';
  $('#anchorDate').value = toDateInput(projected);
  $('#anchorTime').value =
    `${String(projected.getHours()).padStart(2, '0')}:${String(projected.getMinutes()).padStart(2, '0')}`;
  render();
}

/* --------------------------- comparador --------------------------- */

function loadMarket() {
  try {
    market = JSON.parse(localStorage.getItem(MARKET_STORAGE_KEY) || '{}') || {};
  } catch { market = {}; }
  try {
    marketQty = JSON.parse(localStorage.getItem(MARKETQTY_KEY) || '{}') || {};
  } catch { marketQty = {}; }
}

function saveMarket() {
  try {
    localStorage.setItem(MARKET_STORAGE_KEY, JSON.stringify(market));
  } catch { /* ignorar */ }
}

function currentItemId() {
  const hit = itemIndex.get($('#item').value.trim().toLowerCase());
  return hit ? String(hit.id) : null;
}

/** el precio de venta del formulario es siempre el del artículo seleccionado */
function applyMarketPriceToForm() {
  const id = currentItemId();
  if (id) $('#sellPrice').value = market[id] == null ? '' : market[id];
}

function syncSellPriceToMarket() {
  const id = currentItemId();
  const value = num($('#sellPrice').value);
  if (id && value != null && value > 0) {
    market[id] = value;
    saveMarket();
  }
}

function comparatorRows() {
  const country = yata.data?.stocks?.[$('#country').value];
  if (!country) return [];

  const capacity = num($('#capacity').value) ?? 0;
  const fee = Math.max(0, num($('#fee').value) ?? 0);

  return country.stocks
    .map((item) => {
      const price = num(market[String(item.id)]);
      const net = price == null ? null : price * (1 - fee / 100);
      const perSlot = net == null ? null : net - item.cost;
      return { item, price, perSlot, perTrip: perSlot == null ? null : perSlot * capacity };
    })
    .sort((a, b) => {
      if (a.perSlot == null && b.perSlot == null) return a.item.name.localeCompare(b.item.name);
      if (a.perSlot == null) return 1;
      if (b.perSlot == null) return -1;
      return b.perSlot - a.perSlot;
    });
}

function renderComparator() {
  const box = $('#cmpBody');
  const summary = $('#cmpSummary');
  const rows = comparatorRows();

  if (!rows.length) {
    box.innerHTML = '<p class="hint">Sin stock cargado para este país: usá «Recargar stock del país».</p>';
    summary.textContent = '';
    return;
  }

  const country = COUNTRIES[$('#country').value] || $('#country').value;
  const capacity = num($('#capacity').value) ?? 0;
  const best = rows.find((r) => r.perSlot != null);
  const missing = rows.filter((r) => r.perSlot == null).length;

  summary.innerHTML = best
    ? `<b>${esc(best.item.name)}</b> en ${esc(country)}: ${esc(fmtMoney(best.perSlot))} por hueco,
       ${esc(fmtMoney(best.perTrip))} llenando ${capacity} huecos.` +
      (missing ? ` Faltan ${missing} precios de venta.` : '')
    : `Poné un precio de venta (o cargá los valores de mercado con tu API key) para ver el ranking de ${esc(country)}.`;

  const body = rows.map((r) => {
    const cls = r.perSlot == null ? '' : r.perSlot >= 0 ? 'good' : 'bad';
    const qty = marketQty[String(r.item.id)];
    const capacity = num($('#capacity').value) ?? 0;
    const low = qty != null && capacity > 0 && qty < capacity;
    const qtyCell = qty == null
      ? '<span class="cmp-small">—</span>'
      : `<span class="cmp-small${low ? ' low' : ''}">${qty} uds</span>`;
    return `<tr class="${r === best ? 'is-best' : ''}" data-id="${esc(r.item.id)}" data-cost="${esc(r.item.cost)}">
      <td class="cmp-name">${esc(r.item.name)}</td>
      <td>${esc(fmtMoney(r.item.cost))}</td>
      <td><input class="cmp-price" type="number" min="0" step="1" data-id="${esc(r.item.id)}"
                 value="${r.price == null ? '' : esc(r.price)}" placeholder="—"></td>
      <td data-cell="slot" class="${cls}">${r.perSlot == null ? '—' : esc(fmtMoney(r.perSlot))}</td>
      <td data-cell="trip" class="${cls}">${r.perTrip == null ? '—' : esc(fmtMoney(r.perTrip))}</td>
      <td>${qtyCell}</td>
      <td class="${r.item.quantity ? 'cmp-stock' : 'cmp-stock none'}">${esc(r.item.quantity)} uds</td>
      <td><button type="button" class="cmp-use" data-id="${esc(r.item.id)}">usar</button></td>
    </tr>`;
  }).join('');

  box.innerHTML = `<div class="cmp-wrap"><table class="cycles cmp">
      <thead><tr>
        <th>Artículo</th><th>Coste</th><th>Venta</th><th>Beneficio/hueco</th>
        <th>Beneficio/viaje</th><th>En venta</th><th>Stock leído</th><th></th>
      </tr></thead>
      <tbody>${body}</tbody>
    </table></div>`;
}

/** mientras se teclea no reordenamos (perdería el foco): solo recalculamos esa fila */
function updateCmpRow(input) {
  const row = input.closest('tr');
  const id = input.dataset.id;
  const price = num(input.value);
  if (price == null) delete market[id];
  else market[id] = price;

  const cost = num(row.dataset.cost) ?? 0;
  const capacity = num($('#capacity').value) ?? 0;
  const fee = Math.max(0, num($('#fee').value) ?? 0);
  const perSlot = price == null ? null : price * (1 - fee / 100) - cost;
  const cls = perSlot == null ? '' : perSlot >= 0 ? 'good' : 'bad';

  const values = { slot: perSlot, trip: perSlot == null ? null : perSlot * capacity };
  for (const [name, value] of Object.entries(values)) {
    const cell = row.querySelector(`[data-cell="${name}"]`);
    if (!cell) continue;
    cell.textContent = value == null ? '—' : fmtMoney(value);
    cell.className = cls;
  }
}

function useItem(id) {
  const row = comparatorRows().find((r) => String(r.item.id) === String(id));
  if (!row) return;
  $('#item').value = row.item.name;
  buyPriceTouched = true;
  $('#buyPrice').value = row.item.cost;
  if (row.price != null) $('#sellPrice').value = row.price;
  $('#cmpSummary').innerHTML = `${esc(row.item.name)} cargado en el cálculo de arriba.`;
  render();
}

async function loadMarketPrices() {
  const data = await tornJson([
    (k) => `https://api.torn.com/v2/torn/items?key=${encodeURIComponent(k)}`,
    (k) => `https://api.torn.com/torn/?selections=items&key=${encodeURIComponent(k)}`,
  ]);

  // v2 devuelve una lista, v1 un objeto indexado por id
  const entries = Array.isArray(data.items)
    ? data.items.map((item) => [String(item.id), item])
    : Object.entries(data.items || {});

  let count = 0;
  for (const [key, item] of entries) {
    const value = item && (item.market_value ?? item.marketValue);
    if (!value) continue;
    market[String((item && item.id) ?? key)] = value;
    count++;
  }
  if (!count) throw new Error('la API no devolvió market_value');
  saveMarket();
  return count;
}

async function cmpLoadPrices() {
  const summary = $('#cmpSummary');
  summary.textContent = 'Buscando valores de mercado…';
  try {
    const count = await loadMarketPrices();
    renderComparator();
    $('#cmpSummary').innerHTML = `Actualizados <b>${count}</b> precios de mercado desde la API de Torn.`;
  } catch (e) {
    summary.innerHTML = `No pude cargar los precios: <code>${esc(e.message)}</code>.
      Necesitás una API key en «Opcional · conectar con la API de Torn».`;
  }
}

/* ---------------------------- Torn API ---------------------------- */

async function tornJson(paths) {
  const key = $('#apiKey').value.trim();
  if (!key) throw new Error('Falta la API key');
  let lastErr = new Error('respuesta inesperada');
  for (const build of paths) {
    try {
      const res = await fetch(build(key));
      const data = await res.json();
      if (data && data.error) {
        lastErr = new Error(`${data.error.error} (${data.error.code})`);
        continue;
      }
      return data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function queryTravel() {
  const setStatus = (html) => { $('#apiStatus').innerHTML = html; };
  setStatus('Consultando…');
  try {
    const data = await tornJson([
      (k) => `https://api.torn.com/v2/user/travel?key=${encodeURIComponent(k)}`,
      (k) => `https://api.torn.com/user/?selections=travel&key=${encodeURIComponent(k)}`,
    ]);
    const t = data.travel;

    if (!t || (!t.time_left && !t.timestamp)) {
      setStatus('No estás volando ahora mismo.');
      return;
    }
    const arrival = t.timestamp ? new Date(t.timestamp * 1000) : addMinutes(new Date(), t.time_left / 60);
    const rest = `Vuelo a <b>${esc(t.destination || '—')}</b> · ${t.time_left ? `quedan <b>${esc(fmtDuration(t.time_left / 60))}</b>` : ''} · aterrizás <b>${esc(fmtClock(arrival))}</b>`;

    if (!model || model.errors.length) {
      setStatus(`${rest}.`);
      return;
    }

    const ev = evaluateArrival(arrival, model.cycles, model.durMin, model.durMax);
    let verdict;
    if (ev.kind === 'in') {
      verdict = `✅ Llegás <b>${esc(fmtDuration(ev.since))}</b> después del restock: estás dentro de la ventana de stock.`;
    } else if (ev.kind === 'maybe') {
      verdict = `⚠️ Llegás <b>${esc(fmtDuration(ev.since))}</b> después del restock: puede que ya esté agotado.`;
    } else if (ev.kind === 'early') {
      verdict = `🧳 Aterrizás antes: el próximo restock es a las <b>${esc(fmtClock(ev.next.restockLo))}</b>, esperarías ${esc(fmtDuration(ev.wait))}.`;
    } else {
      verdict = 'No hay restocks proyectados en ese tramo.';
    }
    setStatus(`${rest}.<br>${verdict}`);
  } catch (e) {
    setStatus(`Error: <code>${esc(e.message)}</code>`);
  }
}

async function suggestPrice() {
  const setStatus = (html) => { $('#apiStatus').innerHTML = html; };
  setStatus('Buscando valores de mercado…');
  try {
    const count = await loadMarketPrices();
    applyMarketPriceToForm();
    renderComparator();
    render();
    setStatus(`Actualizados <b>${count}</b> precios de mercado. Mirá el comparador de artículos.`);
  } catch (e) {
    setStatus(`Error: <code>${esc(e.message)}</code>`);
  }
}

/* ------------------------------- init ------------------------------- */

function initAnchor() {
  const now = new Date();
  now.setSeconds(0, 0);
  $('#anchorDate').value = toDateInput(now);
  $('#anchorTime').value =
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function loadSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
  } catch { saved = {}; }
  const settings = { ...DEFAULTS, ...saved };
  for (const id of FIELDS) {
    if (BOOL_FIELDS.includes(id)) continue;
    if (id === 'anchorTime' && !settings.anchorTime) continue;
    $('#' + id).value = settings[id];
  }
  for (const id of BOOL_FIELDS) $('#' + id).checked = !!settings[id];
  if (!$('#alarmLead').value) $('#alarmLead').value = DEFAULTS.alarmLead;
  if (!settings.anchorTime) initAnchor();
  try {
    const key = localStorage.getItem(KEY_STORAGE_KEY);
    if (key) {
      $('#apiKey').value = key;
      $('#apiRemember').checked = true;
    }
  } catch { /* ignorar */ }
}

function bindEvents() {
  for (const id of FIELDS) {
    const input = $('#' + id);
    const handler = (evt) => {
      if (id === 'buyPrice') buyPriceTouched = true;
      if (id === 'item') {
        buyPriceTouched = false;
        applyItemFromIndex();
        applyMarketPriceToForm();
        applyItemTimings();
      }
      if (id === 'country') {
        applyAutoFlight();
        applyItemTimings();
        refreshYata(false);
      }
      if (id === 'travelTier' || id === 'travelBook') applyAutoFlight();
      if (id === 'anchorDate' || id === 'anchorTime') applyItemTimings();   // la franja horaria cambia la duración
      if (id === 'sellPrice') syncSellPriceToMarket();
      if (id === 'capacity' && evt === 'input') capacityTouched = true;
      if (['capBase', 'capCompany', 'capTourism', 'travelBook'].includes(id)) applyCapacity();
      if (evt === 'change' && (id === 'restockDelay' || id === 'stockMin' || id === 'stockMax')) {
        const raw = id === 'restockDelay' ? parseDuration(input.value) : num(input.value);
        if (raw != null) rememberManual(id, raw);
      }
      render();
      if (id === 'capacity' || id === 'fee' || id === 'sellPrice') renderComparator();
    };
    input.addEventListener('input', () => handler('input'));
    input.addEventListener('change', () => handler('change'));
  }

  $('#anchorChips').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-ago]');
    if (!btn) return;
    const d = addMinutes(new Date(), -Number(btn.dataset.ago));
    d.setSeconds(0, 0);
    $('#anchorDate').value = toDateInput(d);
    $('#anchorTime').value =
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    render();
  });

  $('#yataRefresh').addEventListener('click', () => refreshYata(true));

  $('#apiTravel').addEventListener('click', queryTravel);
  $('#apiPrice').addEventListener('click', suggestPrice);
  const rememberKey = () => {
    const remember = $('#apiRemember').checked;
    const key = $('#apiKey').value.trim();
    try {
      if (remember && key) localStorage.setItem(KEY_STORAGE_KEY, key);
      else localStorage.removeItem(KEY_STORAGE_KEY);
    } catch { /* ignorar */ }
  };
  $('#apiRemember').addEventListener('change', rememberKey);
  $('#apiKey').addEventListener('change', rememberKey);

  $('#cmpApi').addEventListener('click', cmpLoadPrices);
  $('#cmpListings').addEventListener('click', () => {
    loadListings().catch((e) => {
      $('#cmpSummary').innerHTML = `Error: <code>${esc(e.message)}</code>`;
    });
  });
  $('#cmpClear').addEventListener('click', () => {
    market = {};
    marketQty = {};
    saveMarket();
    saveItemState(MARKETQTY_KEY, marketQty);
    renderComparator();
    $('#cmpSummary').innerHTML = 'Precios de venta guardados borrados.';
  });

  $('#capUse').addEventListener('click', () => {
    capacityTouched = false;
    applyCapacity();
    render();
    renderComparator();
  });

  $('#alarmToggle').addEventListener('click', toggleAlarm);
  $('#alarmLead').addEventListener('change', () => {
    alarm.lead = Math.max(0, num($('#alarmLead').value) ?? 10);
    $('#alarmLead').value = alarm.lead;
    saveAlarmState();
    renderAlarm();
  });

  $('#toast').addEventListener('click', () => { $('#toast').hidden = true; });
  $('#useProjected').addEventListener('click', useProjectedRestock);

  $('#obsSave').addEventListener('click', saveObservation);
  $('#obsClear').addEventListener('click', clearObservations);
  $('#timingsReset').addEventListener('click', clearItemTimings);
  $('#importGo').addEventListener('click', () => importCommunityRefs($('#importText').value));
  $('#importClear').addEventListener('click', () => {
    refs = {};
    saveItemState(REF_KEY, refs);
    lastItemKey = null;
    applyItemTimings({ force: true });
    render();
    $('#importStatus').textContent = 'Datos importados borrados.';
  });

  $('#cmpBody').addEventListener('input', (e) => {
    const input = e.target.closest('.cmp-price');
    if (input) updateCmpRow(input);
  });

  $('#cmpBody').addEventListener('change', (e) => {
    const input = e.target.closest('.cmp-price');
    if (!input) return;
    updateCmpRow(input);
    saveMarket();
    renderComparator();   // ahora sí reordenamos
  });

  $('#cmpBody').addEventListener('click', (e) => {
    const btn = e.target.closest('.cmp-use');
    if (btn) useItem(btn.dataset.id);
  });
}

function init() {
  $('#country').innerHTML = Object.entries(COUNTRIES)
    .map(([code, name]) => `<option value="${esc(code)}">${esc(name)}</option>`)
    .join('');

  $('#travelTier').innerHTML = TIERS
    .map((t) => `<option value="${esc(t.id)}">${esc(t.label)}</option>`)
    .join('');

  loadSettings();
  loadMarket();
  loadItemState();
  loadAlarmState();
  bindEvents();
  render();
  refreshYata(false);
  setInterval(tick, 1000);
}

document.addEventListener('DOMContentLoaded', init);
