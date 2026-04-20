import { voronoi } from 'd3-voronoi';
import { HEART_PATH_NORMALIZED, HEART_PATH_POLYGON } from './anatomicalHeartPath';

/** Point-in-polygon test using the sampled outline of the real SVG silhouette. */
function pointInPolygon(nx: number, ny: number, poly: readonly [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect =
      yi > ny !== yj > ny &&
      nx < ((xj - xi) * (ny - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Normalized (0-1) point inside the anatomical heart shape check. */
function isInsideAnatomicalHeart(nx: number, ny: number): boolean {
  return pointInPolygon(nx, ny, HEART_PATH_POLYGON);
}

/** SVG path tracing the anatomical heart silhouette (extracted from reference SVG).
 *  Scales the normalized 0..1 path to the canvas (w, h). Cached per (w, h). */
let cachedKey = '';
let cachedPath = '';
export function heartOutlinePath(w: number, h: number): string {
  const key = `${w}x${h}`;
  if (key === cachedKey) return cachedPath;

  const parts = HEART_PATH_NORMALIZED.split(' ');
  const out: string[] = [];
  let coordIdx = 0;
  for (const tok of parts) {
    if (tok === '') continue;
    if (/^[A-Za-z]$/.test(tok)) {
      out.push(tok);
      coordIdx = 0;
      continue;
    }
    const n = parseFloat(tok);
    if (Number.isNaN(n)) {
      out.push(tok);
      continue;
    }
    const scaled = coordIdx % 2 === 0 ? n * w : n * h;
    out.push(scaled.toFixed(2));
    coordIdx++;
  }
  cachedKey = key;
  cachedPath = out.join(' ');
  return cachedPath;
}

/** 114 Voronoi sites distributed inside the anatomical heart silhouette.
 *  Sites are sorted top→bottom so surah 1 maps to the top and 114 to the apex. */
export function generateSurahSites(w: number, h: number): [number, number][] {
  const COLS = 30;
  const ROWS = 40;
  const candidates: [number, number][] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const nx = (col + 0.5) / COLS;
      const ny = (row + 0.5) / ROWS;
      if (isInsideAnatomicalHeart(nx, ny)) {
        candidates.push([nx * w, ny * h]);
      }
    }
  }

  // Sort top → bottom, left → right to match Quran order
  candidates.sort(([ax, ay], [bx, by]) => (ay !== by ? ay - by : ax - bx));

  const pickEvenly = (pts: [number, number][]): [number, number][] => {
    if (pts.length === 0) {
      const cx = w * 0.5;
      const cy = h * 0.5;
      return Array.from({ length: 114 }, () => [cx, cy]);
    }
    if (pts.length === 1) {
      const p = pts[0]!;
      return Array.from({ length: 114 }, () => [...p] as [number, number]);
    }
    return Array.from({ length: 114 }, (_, i) => {
      const idx = Math.min(Math.round((i * (pts.length - 1)) / 113), pts.length - 1);
      const q = pts[idx];
      if (!q || !Number.isFinite(q[0]) || !Number.isFinite(q[1])) {
        return [w * 0.5, h * 0.5];
      }
      return q;
    });
  };

  if (candidates.length >= 114) {
    return pickEvenly(candidates);
  }

  // Fallback: denser grid if somehow < 114 candidates.
  const extra: [number, number][] = [];
  for (let row = 0; row < ROWS * 2; row++) {
    for (let col = 0; col < COLS * 2; col++) {
      const nx = (col + 0.5) / (COLS * 2);
      const ny = (row + 0.5) / (ROWS * 2);
      if (isInsideAnatomicalHeart(nx, ny)) extra.push([nx * w, ny * h]);
    }
  }
  extra.sort(([ax, ay], [bx, by]) => (ay !== by ? ay - by : ax - bx));
  return pickEvenly(extra);
}

export function polygonToPathD(poly: [number, number][] | null): string {
  if (!poly || poly.length === 0) return '';
  return (
    poly.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(
      ' '
    ) + ' Z'
  );
}

export function polygonCentroid(poly: [number, number][]): [number, number] {
  let sx = 0;
  let sy = 0;
  for (const p of poly) {
    sx += p[0];
    sy += p[1];
  }
  return [sx / poly.length, sy / poly.length];
}

export function polygonArea(poly: [number, number][]): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  }
  return Math.abs(a / 2);
}

export function computeVoronoiPolygons(
  width: number,
  height: number,
  sites: [number, number][]
): ([number, number][] | null)[] {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 8 || height < 8) {
    return Array.from({ length: 114 }, () => null);
  }
  const safeSites: [number, number][] = sites.map(([x, y]) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return [width * 0.5, height * 0.5];
    return [x, y];
  });
  const pad = Math.max(width, height) * 0.6;
  const diagram = voronoi<[number, number]>()
    .x((d) => d[0])
    .y((d) => d[1])
    .extent([
      [-pad, -pad],
      [width + pad, height + pad],
    ]);
  return diagram.polygons(safeSites);
}
