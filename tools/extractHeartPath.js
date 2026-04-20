/**
 * Extracts the main outline path from the uploaded anatomical heart SVG,
 * applies its transform (translate 0,1040; scale 0.1,-0.1), and writes
 * `apps/mobile/src/components/heart/anatomicalHeartPath.ts` with:
 *   - RAW_D: transformed SVG path 'd' string in viewBox 0 0 736 1040
 *   - NATURAL_W, NATURAL_H: viewBox size
 *   - POLYGON: sampled polygon (array of [x,y] in viewBox coords) for point-in-polygon tests
 */
const fs = require('fs');
const path = require('path');

const SVG_PATH = 'C:\\Users\\Айдар\\Downloads\\Telegram Desktop\\4691cb24d769258c18c2b021e5acaf2c.svg';
const OUT = path.resolve(__dirname, '../apps/mobile/src/components/heart/anatomicalHeartPath.ts');

const svg = fs.readFileSync(SVG_PATH, 'utf8');

// Grab first <path d="..."/> — the main outline in this traced SVG.
// This SVG contains many subpaths (outer silhouette + internal anatomical
// detail). We'll split them below and keep only the largest by bbox area.
const m = svg.match(/<path d="([\s\S]*?)"\s*\/>/);
if (!m) throw new Error('No <path> found.');
const rawD = m[1];

// Parse SVG path. Commands: M/m L/l H/h V/v C/c S/s Q/q T/t A/a Z/z.
// This SVG uses M and c (relative cubic) primarily.
function* tokenize(d) {
  const re = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:[eE][+-]?\d+)?)/g;
  let match;
  while ((match = re.exec(d)) !== null) {
    if (match[1]) yield { type: 'cmd', value: match[1] };
    else yield { type: 'num', value: parseFloat(match[2]) };
  }
}

// Sample cubic bezier at t
function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const x = u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0];
  const y = u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1];
  return [x, y];
}

// Transform: translate(0,1040) scale(0.1,-0.1) → (x,y) ↦ (0.1x, 1040 - 0.1y)
const tx = ([x, y]) => [x * 0.1, 1040 - y * 0.1];

// Walk the path, sample curves, collect per-subpath polygons + transformed
// command strings so we can pick the largest subpath afterwards.
const tokens = [...tokenize(rawD)];
let i = 0;
let cur = [0, 0];   // current point (raw coords)
let start = [0, 0]; // subpath start
let lastCmd = '';
let lastCtrl = null; // for S/s continuation

function readNums(n) {
  const arr = [];
  while (arr.length < n && i < tokens.length && tokens[i].type === 'num') {
    arr.push(tokens[i++].value);
  }
  return arr;
}

const subpaths = []; // [{ poly: [[x,y]...], parts: ['M ...', 'C ...', 'Z'] }]
let curSub = null;

function startSubpath(raw) {
  curSub = { poly: [], parts: [] };
  subpaths.push(curSub);
  const p = tx(raw);
  curSub.parts.push(`M ${p[0].toFixed(2)} ${p[1].toFixed(2)}`);
  curSub.poly.push(p);
}
function emitL(p) { curSub.parts.push(`L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`); }
function emitC(c1, c2, p) {
  curSub.parts.push(`C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`);
}
function emitZ() { curSub.parts.push('Z'); }
function pushPolyPoint(raw) { curSub.poly.push(tx(raw)); }

while (i < tokens.length) {
  const tok = tokens[i];
  let cmd;
  if (tok.type === 'cmd') {
    cmd = tok.value;
    i++;
    lastCmd = cmd;
  } else {
    cmd = lastCmd === 'M' ? 'L' : lastCmd === 'm' ? 'l' : lastCmd;
  }

  const abs = cmd === cmd.toUpperCase();
  const c = cmd.toLowerCase();

  if (c === 'm') {
    const [x, y] = readNums(2);
    cur = abs ? [x, y] : [cur[0] + x, cur[1] + y];
    start = [...cur];
    startSubpath(cur);
    lastCtrl = null;
  } else if (c === 'l') {
    if (!curSub) startSubpath(cur);
    const [x, y] = readNums(2);
    cur = abs ? [x, y] : [cur[0] + x, cur[1] + y];
    emitL(tx(cur));
    pushPolyPoint(cur);
    lastCtrl = null;
  } else if (c === 'h') {
    if (!curSub) startSubpath(cur);
    const [x] = readNums(1);
    cur = abs ? [x, cur[1]] : [cur[0] + x, cur[1]];
    emitL(tx(cur));
    pushPolyPoint(cur);
    lastCtrl = null;
  } else if (c === 'v') {
    if (!curSub) startSubpath(cur);
    const [y] = readNums(1);
    cur = abs ? [cur[0], y] : [cur[0], cur[1] + y];
    emitL(tx(cur));
    pushPolyPoint(cur);
    lastCtrl = null;
  } else if (c === 'c') {
    if (!curSub) startSubpath(cur);
    const [x1, y1, x2, y2, x, y] = readNums(6);
    const p0 = [...cur];
    const p1 = abs ? [x1, y1] : [cur[0] + x1, cur[1] + y1];
    const p2 = abs ? [x2, y2] : [cur[0] + x2, cur[1] + y2];
    const p3 = abs ? [x, y]   : [cur[0] + x,  cur[1] + y];
    for (let t = 0.1; t <= 1.0001; t += 0.1) {
      const pt = bez(p0, p1, p2, p3, t);
      pushPolyPoint(pt);
    }
    emitC(tx(p1), tx(p2), tx(p3));
    cur = p3;
    lastCtrl = p2;
  } else if (c === 's') {
    if (!curSub) startSubpath(cur);
    const [x2, y2, x, y] = readNums(4);
    const p0 = [...cur];
    const p1 = lastCtrl ? [2*cur[0] - lastCtrl[0], 2*cur[1] - lastCtrl[1]] : [...cur];
    const p2 = abs ? [x2, y2] : [cur[0] + x2, cur[1] + y2];
    const p3 = abs ? [x, y]   : [cur[0] + x,  cur[1] + y];
    for (let t = 0.1; t <= 1.0001; t += 0.1) {
      const pt = bez(p0, p1, p2, p3, t);
      pushPolyPoint(pt);
    }
    emitC(tx(p1), tx(p2), tx(p3));
    cur = p3;
    lastCtrl = p2;
  } else if (c === 'z') {
    if (curSub) emitZ();
    cur = [...start];
    lastCtrl = null;
  } else {
    console.warn('Unsupported command:', cmd);
    readNums(2);
  }
}

// Pick the subpath with the largest bbox area → the outer silhouette.
function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x; if (y < y0) y0 = y;
    if (x > x1) x1 = x; if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1, area: (x1 - x0) * (y1 - y0) };
}
console.log('Subpaths:', subpaths.length);
subpaths.forEach((sp, idx) => {
  const b = bbox(sp.poly);
  console.log(`  [${idx}] pts=${sp.poly.length} bbox=(${b.x0.toFixed(1)},${b.y0.toFixed(1)})-(${b.x1.toFixed(1)},${b.y1.toFixed(1)}) area=${b.area.toFixed(0)}`);
});

const outer = subpaths.reduce((best, sp) =>
  bbox(sp.poly).area > bbox(best.poly).area ? sp : best
, subpaths[0]);
console.log('Chose subpath with', outer.poly.length, 'points as outer silhouette.');

const poly = outer.poly;
const outParts = outer.parts;

// Compute bounding box of polygon in transformed (viewBox) coords.
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const [x, y] of poly) {
  if (x < minX) minX = x; if (y < minY) minY = y;
  if (x > maxX) maxX = x; if (y > maxY) maxY = y;
}

console.log('Path points:', poly.length);
console.log('BBox (viewBox coords):', minX.toFixed(1), minY.toFixed(1), maxX.toFixed(1), maxY.toFixed(1));

// Normalize polygon to 0..1 using the actual bounding box with a small margin.
const pad = 4;
const bx = Math.max(0, minX - pad);
const by = Math.max(0, minY - pad);
const bw = Math.min(736, maxX + pad) - bx;
const bh = Math.min(1040, maxY + pad) - by;

const normPolyFull = poly.map(([x, y]) => [(x - bx) / bw, (y - by) / bh]);

// Downsample the polygon for fast point-in-polygon tests (~320 pts is ample).
const TARGET_PTS = 320;
const step = Math.max(1, Math.floor(normPolyFull.length / TARGET_PTS));
const normPoly = normPolyFull.filter((_, idx) => idx % step === 0);

// Re-emit path with bbox-normalized 0..1 coords for flexible rendering.
// Parse our absolute transformed outParts back into numeric form, then normalize.
const normParts = outParts.map((seg) => {
  const [cmdLetter, ...rest] = seg.split(' ');
  const nums = rest.filter(Boolean).map(parseFloat);
  const normNums = nums.map((n, idx) => {
    if (idx % 2 === 0) return ((n - bx) / bw).toFixed(4);
    return ((n - by) / bh).toFixed(4);
  });
  return `${cmdLetter} ${normNums.join(' ')}`.trim();
});

const out = `/* Auto-generated from 4691cb24d769258c18c2b021e5acaf2c.svg — do not edit by hand.
 * Outer silhouette of the anatomical heart. Path coords are normalized to [0,1]
 * over the path's own bounding box (aspect preserved by the consumer). */

/** Normalized-0..1 path string (replace NX/NY placeholders by runtime scale). */
export const HEART_PATH_NORMALIZED = ${JSON.stringify(normParts.join(' '))};

/** Natural aspect ratio of the extracted path (width / height). */
export const HEART_PATH_ASPECT = ${(bw / bh).toFixed(6)};

/** Sampled polygon (normalized 0..1) for point-in-polygon tests. */
export const HEART_PATH_POLYGON: [number, number][] = ${JSON.stringify(
  normPoly.map(([x, y]) => [parseFloat(x.toFixed(5)), parseFloat(y.toFixed(5))])
)};
`;

fs.writeFileSync(OUT, out);
console.log('Wrote', OUT, '-', (out.length / 1024).toFixed(1), 'KB');
