import { voronoi } from 'd3-voronoi';

/** Normalized (0-1) point inside the anatomical heart shape check. */
function isInsideAnatomicalHeart(nx: number, ny: number): boolean {
  // Main body — large ellipse covering ventricles
  const bx = (nx - 0.49) / 0.41;
  const by = (ny - 0.60) / 0.38;
  const inBody = bx * bx + by * by < 1;

  // Left bump — right atrium area (top-left)
  const lx = (nx - 0.31) / 0.13;
  const ly = (ny - 0.16) / 0.13;
  const inLeftBump = lx * lx + ly * ly < 1;

  // Right bump — pulmonary/aortic area (top-right)
  const rx = (nx - 0.63) / 0.12;
  const ry = (ny - 0.13) / 0.12;
  const inRightBump = rx * rx + ry * ry < 1;

  // Connector strip between the two bumps (top center)
  const inConnector =
    ny >= 0.06 && ny <= 0.20 && nx >= 0.38 && nx <= 0.54;

  // Exclude very top gap between bumps
  const inTopGap = ny < 0.06 && nx > 0.43 && nx < 0.54;

  // Exclude bottom below apex
  const belowApex = ny > 0.98;

  return (inBody || inLeftBump || inRightBump || inConnector) && !inTopGap && !belowApex;
}

/** SVG path tracing an anatomical (human) heart — frontal view.
 *  Two atrial bumps at top, right ventricle bulges right, apex points down-left. */
export function heartOutlinePath(w: number, h: number): string {
  const p = (nx: number, ny: number) =>
    `${(nx * w).toFixed(2)},${(ny * h).toFixed(2)}`;

  return [
    `M ${p(0.38, 0.07)}`,
    // Left bump (right atrium / aorta area)
    `C ${p(0.34, 0.02)} ${p(0.24, 0.02)} ${p(0.21, 0.08)}`,
    `C ${p(0.18, 0.13)} ${p(0.18, 0.21)} ${p(0.23, 0.26)}`,
    `C ${p(0.27, 0.29)} ${p(0.33, 0.30)} ${p(0.38, 0.28)}`,
    // Down left side (right ventricle outer wall)
    `C ${p(0.28, 0.33)} ${p(0.17, 0.40)} ${p(0.11, 0.50)}`,
    `C ${p(0.06, 0.58)} ${p(0.06, 0.67)} ${p(0.10, 0.75)}`,
    `C ${p(0.13, 0.82)} ${p(0.20, 0.88)} ${p(0.28, 0.91)}`,
    // Toward apex
    `C ${p(0.33, 0.94)} ${p(0.38, 0.97)} ${p(0.42, 0.985)}`,
    // Apex (bottom point, slightly left of center)
    `C ${p(0.45, 0.998)} ${p(0.48, 0.997)} ${p(0.51, 0.985)}`,
    // Right side going up from apex (left ventricle outer wall)
    `C ${p(0.57, 0.96)} ${p(0.65, 0.90)} ${p(0.72, 0.82)}`,
    `C ${p(0.80, 0.74)} ${p(0.87, 0.64)} ${p(0.89, 0.53)}`,
    `C ${p(0.91, 0.42)} ${p(0.88, 0.31)} ${p(0.81, 0.26)}`,
    // Right bump base (left atrium / pulmonary trunk)
    `C ${p(0.76, 0.22)} ${p(0.70, 0.22)} ${p(0.67, 0.25)}`,
    // Up to right bump peak
    `C ${p(0.72, 0.17)} ${p(0.74, 0.08)} ${p(0.69, 0.04)}`,
    `C ${p(0.64, 0.00)} ${p(0.55, 0.01)} ${p(0.52, 0.07)}`,
    // Cross the inter-ventricular groove back to left bump
    `C ${p(0.50, 0.09)} ${p(0.47, 0.09)} ${p(0.44, 0.08)}`,
    `C ${p(0.42, 0.07)} ${p(0.40, 0.07)} ${p(0.38, 0.07)}`,
    'Z',
  ].join(' ');
}

/** 114 Voronoi sites distributed inside the anatomical heart.
 *  Sites are sorted top→bottom so surah 1 maps to the top and 114 to the apex. */
export function generateSurahSites(w: number, h: number): [number, number][] {
  const COLS = 30;
  const ROWS = 38;
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

  // Fallback: add extra points in a coarser grid if somehow < 114
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
