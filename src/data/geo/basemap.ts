import { readFileSync } from 'node:fs';
import path from 'node:path';
import { feature } from 'topojson-client';
import * as turf from '@turf/turf';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import type { Topology } from 'topojson-specification';

/**
 * Davlat hududi xaritasini build vaqtida statik SVG sifatida chizish uchun
 * yordamchi funksiyalar (JavaScript'siz, "islands" tamoyiliga mos).
 *
 * Asos xarita: Natural Earth 1:50m quruqlik konturlari (jamoat mulki),
 * `world-atlas` paketi orqali. Bu zamonaviy qirg'oq chizig'i — tarixiy
 * qirg'oq/ko'l o'zgarishlari (masalan Orol dengizi) ko'rsatilmaydi.
 *
 * Proyeksiya: markaziy kenglik bo'yicha masshtablangan teng oraliqli
 * (equirectangular) — mintaqaviy xarita uchun oddiy va yetarli.
 */

const VIEW_WIDTH = 1000;
const MIN_ASPECT = 1.35;
const MAX_ASPECT = 2.1;
/** Kichik davlatlar xaritasida ham dengiz/qirg'oq ko'rinib, mo'ljal olish oson bo'lishi uchun. */
const MIN_LON_SPAN = 40;

type LandGeometry = Feature<Polygon | MultiPolygon>;

let landCache: LandGeometry | undefined;

function getLand(): LandGeometry {
  if (!landCache) {
    const file = path.join(process.cwd(), 'node_modules/world-atlas/land-50m.json');
    const topology = JSON.parse(readFileSync(file, 'utf-8')) as Topology;
    const land = feature(topology, topology.objects.land) as unknown as FeatureCollection<Polygon | MultiPolygon>;
    landCache = unwrapAntimeridian(land.features[0]);
  }
  return landCache;
}

/**
 * 180° meridianni kesib o'tuvchi halqalarni (Yevroosiyo — Chukotka) "ochadi":
 * qo'shni nuqtalar orasidagi ±360° sakrash olib tashlanadi, shunda halqa
 * uzluksiz bo'ladi (Chukotka 180° dan katta uzunlikka o'tadi). Aks holda
 * kesish paytida xarita bo'ylab gorizontal soxta chiziqlar paydo bo'ladi.
 */
function unwrapAntimeridian(f: LandGeometry): LandGeometry {
  const unwrapRing = (ring: Position[]): Position[] => {
    let offset = 0;
    const out = ring.map((p, i) => {
      if (i > 0) {
        const d = p[0] - ring[i - 1][0];
        if (d > 180) offset -= 360;
        else if (d < -180) offset += 360;
      }
      return [p[0] + offset, p[1]];
    });
    const minLon = Math.min(...out.map((p) => p[0]));
    return minLon < -180 ? out.map((p) => [p[0] + 360, p[1]]) : out;
  };
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  // Antarktida (qutbni o'rab oluvchi halqa) o'zgartirilmaydi — u bu xaritalarga tushmaydi.
  const fixed = polys.map((poly) =>
    poly.map((ring) => (Math.min(...ring.map((p) => p[1])) < -60 ? ring : unwrapRing(ring)))
  );
  return turf.multiPolygon(fixed) as LandGeometry;
}

export interface Projection {
  width: number;
  height: number;
  /** [lon, lat] -> SVG koordinatasi */
  project: (p: Position) => [number, number];
  bbox: [number, number, number, number];
}

/** Hudud chegaralari atrofida chekka (padding) qo'shib, nisbatni me'yorlab proyeksiya quradi. */
export function createProjection(fc: FeatureCollection, pad = { lon: 0.1, lat: 0.12 }): Projection {
  let [minLon, minLat, maxLon, maxLat] = turf.bbox(fc);
  const padLon = (maxLon - minLon) * pad.lon + 1.5;
  const padLat = (maxLat - minLat) * pad.lat + 1.5;
  minLon -= padLon;
  maxLon += padLon;
  minLat -= padLat;
  maxLat += padLat;
  if (maxLon - minLon < MIN_LON_SPAN) {
    const extra = (MIN_LON_SPAN - (maxLon - minLon)) / 2;
    minLon -= extra;
    maxLon += extra;
  }

  const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  let spanX = (maxLon - minLon) * k;
  let spanY = maxLat - minLat;

  // Juda cho'ziq yoki juda baland xaritalarni me'yoriy nisbatga keltirish.
  if (spanX / spanY > MAX_ASPECT) {
    const extra = (spanX / MAX_ASPECT - spanY) / 2;
    minLat -= extra;
    maxLat += extra;
  } else if (spanX / spanY < MIN_ASPECT) {
    const extra = (spanY * MIN_ASPECT - spanX) / k / 2;
    minLon -= extra;
    maxLon += extra;
  }
  spanX = (maxLon - minLon) * k;
  spanY = maxLat - minLat;

  const scale = VIEW_WIDTH / spanX;
  const height = Math.round(spanY * scale);

  return {
    width: VIEW_WIDTH,
    height,
    bbox: [minLon, minLat, maxLon, maxLat],
    project: ([lon, lat]) => [(lon - minLon) * k * scale, (maxLat - lat) * scale],
  };
}

function ringToPath(ring: Position[], proj: Projection): string {
  let d = '';
  let prev = '';
  for (const p of ring) {
    const [x, y] = proj.project(p);
    const pt = `${x.toFixed(1)} ${y.toFixed(1)}`;
    if (pt === prev) continue;
    d += (d ? 'L' : 'M') + pt;
    prev = pt;
  }
  return d ? d + 'Z' : '';
}

/** Polygon/MultiPolygon geometriyasini SVG `d` atributiga aylantiradi. */
export function geometryToPath(geom: Polygon | MultiPolygon, proj: Projection): string {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  return polys.map((poly) => poly.map((ring) => ringToPath(ring, proj)).join('')).join('');
}

/** Proyeksiya chegarasiga kesilgan quruqlik konturi (SVG path). */
export function landPath(proj: Projection): string {
  const [minLon, minLat, maxLon, maxLat] = proj.bbox;
  // Chekkada chiziq ko'rinmasligi uchun biroz kengroq kesiladi.
  const box: [number, number, number, number] = [minLon - 1, minLat - 1, maxLon + 1, maxLat + 1];
  const land = getLand().geometry;
  const polys = land.type === 'Polygon' ? [land.coordinates] : land.coordinates;
  // Har bir poligon alohida kesiladi: turf.bboxClip MultiPolygon'da qit'a
  // poligonini (masalan Afro-Yevroosiyo) yo'qotib qo'yadi.
  return polys
    .filter((poly) => {
      const [a, b, c, d] = turf.bbox(turf.polygon(poly));
      return a <= box[2] && c >= box[0] && b <= box[3] && d >= box[1];
    })
    .map((poly) => geometryToPath(turf.bboxClip(turf.polygon(poly), box).geometry as Polygon, proj))
    .join('');
}

/** Har 10° da meridian va parallel chiziqlari. */
export function graticulePath(proj: Projection): string {
  const [minLon, minLat, maxLon, maxLat] = proj.bbox;
  const step = 10;
  let d = '';
  for (let lon = Math.ceil(minLon / step) * step; lon <= maxLon; lon += step) {
    const [x1, y1] = proj.project([lon, maxLat]);
    const [, y2] = proj.project([lon, minLat]);
    d += `M${x1.toFixed(1)} ${y1.toFixed(1)}V${y2.toFixed(1)}`;
  }
  for (let lat = Math.ceil(minLat / step) * step; lat <= maxLat; lat += step) {
    const [x1, y1] = proj.project([minLon, lat]);
    const [x2] = proj.project([maxLon, lat]);
    d += `M${x1.toFixed(1)} ${y1.toFixed(1)}H${x2.toFixed(1)}`;
  }
  return d;
}
