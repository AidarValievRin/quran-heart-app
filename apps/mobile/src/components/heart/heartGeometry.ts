import { voronoi } from 'd3-voronoi';

/** Classic parametric heart curve (site layout + outline). */
export function heartPointParam(
  t: number,
  scale: number,
  cx: number,
  cy: number
): [number, number] {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return [cx + x * scale, cy + y * scale];
}

/** Closed SVG path for the outer heart (stroke + clip). Slightly larger than cell sites so the rim clears the mosaic. */
export function heartOutlinePath(width: number, height: number): string {
  const cx = width / 2;
  const cy = height * 0.52;
  const outlineScale = Math.min(width, height) * 0.0415;
  const verticalStretch = 1.06;
  const steps = 128;
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const [x, y] = heartPointParam(t, outlineScale, cx, cy);
    const yy = (y - cy) * verticalStretch + cy;
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${yy.toFixed(2)}`);
  }
  return `${parts.join(' ')} Z`;
}

/** 114 generator points — same ring distribution as the previous circle heart (surah id = index + 1). */
export function generateSurahSites(width: number, height: number): [number, number][] {
  const cx = width / 2;
  const cy = height / 2 + height * 0.04;
  const scale = Math.min(width, height) * 0.034;
  const sites: [number, number][] = [];

  const rings = [
    { count: 44, radiusScale: 1.0 },
    { count: 36, radiusScale: 0.65 },
    { count: 22, radiusScale: 0.34 },
    { count: 12, radiusScale: 0.13 },
  ];

  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      const t = (i / ring.count) * 2 * Math.PI;
      sites.push(heartPointParam(t, scale * ring.radiusScale, cx, cy));
    }
  }

  return sites.slice(0, 114);
}

export function polygonToPathD(poly: [number, number][] | null): string {
  if (!poly || poly.length === 0) return '';
  return (
    poly
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
      .join(' ') + ' Z'
  );
}

export function polygonCentroid(poly: [number, number][]): [number, number] {
  let sx = 0;
  let sy = 0;
  for (const p of poly) {
    sx += p[0];
    sy += p[1];
  }
  const n = poly.length;
  return [sx / n, sy / n];
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
  const pad = Math.max(width, height) * 0.5;
  const diagram = voronoi<[number, number]>()
    .x((d) => d[0])
    .y((d) => d[1])
    .extent([
      [-pad, -pad],
      [width + pad, height + pad],
    ]);
  return diagram.polygons(sites);
}
