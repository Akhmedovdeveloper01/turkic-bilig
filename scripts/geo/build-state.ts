/**
 * Tayanch nuqtalar (scripts/geo/anchors/{slug}.json) asosida davlat hududi
 * GeoJSON faylini generatsiya qiladi (src/data/geo/states/{slug}/{yil}.geojson).
 *
 * MUHIM: bu yerda hosil bo'lgan poligonlar aniq tarixiy CHEGARA emas — faqat
 * inson tomonidan berilgan tayanch nuqtalardan hosil qilingan, silliqlangan
 * sxematik shakl (ILMIY QOIDA 6). Har bir Feature `verified: false` va
 * `confidence` bilan belgilanadi — ekspert tekshiruvini kutadi.
 *
 * Har bir zona Natural Earth quruqlik konturiga kesiladi (dengizga chiqmaydi).
 *
 * Qayta ishga tushirish: npx tsx scripts/geo/build-state.ts
 * Ekspert anchor faylni tahrirlab, shu skriptni qayta ishga tushirishi mumkin.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import * as turf from '@turf/turf';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import type { Topology } from 'topojson-specification';

interface ZoneSpec {
  zone: 'markaz' | 'vassal' | "ta'sir-doirasi";
  confidence: 'baland' | 'ortacha' | 'past';
  notes?: string;
  sourceIds?: string[];
  ring?: [number, number][];
  point?: [number, number];
  radiusKm?: number;
}

interface PointSpec {
  kind: 'capital' | 'city' | 'campaign' | 'region';
  name: string;
  lon: number;
  lat: number;
  notes?: string;
}

interface AnchorFile {
  stateId: string;
  year: number;
  sourceIds: string[];
  zones: ZoneSpec[];
  points: PointSpec[];
}

const ROOT = process.cwd();
const ANCHORS_DIR = path.join(ROOT, 'scripts/geo/anchors');
const OUT_DIR = path.join(ROOT, 'src/data/geo/states');

// Natural Earth 1:50m quruqlik poligonlari — zonalar shu bilan kesiladi, shunda
// sxematik halqa dengizga chiqib ketmaydi va qirg'oq real chiziq bo'ylab o'tadi.
const LAND_POLYGONS: Feature<Polygon>[] = (() => {
  const topology = JSON.parse(
    readFileSync(path.join(ROOT, 'node_modules/world-atlas/land-50m.json'), 'utf-8')
  ) as Topology;
  const land = (feature(topology, topology.objects.land) as unknown as FeatureCollection<MultiPolygon>).features[0];
  return land.geometry.coordinates.map((c) => turf.polygon(c));
})();

function clipToLand(zone: Feature<Polygon | MultiPolygon>): Feature<Polygon | MultiPolygon> {
  const [a, b, c, d] = turf.bbox(zone);
  const parts: Feature<Polygon | MultiPolygon>[] = [];
  for (const landPoly of LAND_POLYGONS) {
    const [la, lb, lc, ld] = turf.bbox(landPoly);
    if (la > c || lc < a || lb > d || ld < b) continue;
    const part = turf.intersect(turf.featureCollection([zone, landPoly]));
    if (part) parts.push(part);
  }
  if (parts.length === 0) return zone;
  if (parts.length === 1) return parts[0];
  const coords = parts.flatMap((p) =>
    p.geometry.type === 'Polygon' ? [p.geometry.coordinates] : p.geometry.coordinates
  );
  return turf.multiPolygon(coords);
}

function closeRing(ring: [number, number][]): [number, number][] {
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  if (fx !== lx || fy !== ly) return [...ring, ring[0]];
  return ring;
}

function smooth(poly: Feature<Polygon | MultiPolygon>): Feature<Polygon | MultiPolygon> {
  const result = turf.polygonSmooth(poly as Feature<Polygon | MultiPolygon>, { iterations: 1 });
  return result.features[0];
}

function buildRingZone(z: ZoneSpec, stateId: string): Feature<Polygon | MultiPolygon> {
  const closed = closeRing(z.ring!);
  let poly: Feature<Polygon | MultiPolygon> = turf.polygon([closed]);

  const kinksResult = turf.kinks(poly as Feature<Polygon>);
  if (kinksResult.features.length > 0) {
    console.warn(
      `  [ogohlantirish] ${stateId} / ${z.zone}: halqa o'z-o'zini kesib o'tadi, convex hull bilan almashtirildi`
    );
    const pts = turf.featureCollection(closed.map((c) => turf.point(c)));
    const hull = turf.convex(pts);
    if (hull) poly = hull as Feature<Polygon>;
  }

  return smooth(poly);
}

function buildCircleZone(z: ZoneSpec): Feature<Polygon> {
  return turf.circle(z.point!, z.radiusKm ?? 100, { units: 'kilometers', steps: 48 });
}

function buildZoneFeature(z: ZoneSpec, stateId: string, year: number, defaultSourceIds: string[]) {
  const shape = z.ring ? buildRingZone(z, stateId) : buildCircleZone(z);
  const geometry = clipToLand(shape).geometry;
  return {
    type: 'Feature' as const,
    geometry,
    properties: {
      stateId,
      year,
      zone: z.zone,
      confidence: z.confidence,
      sourceIds: z.sourceIds ?? defaultSourceIds,
      notes: z.notes ?? null,
      verified: false,
    },
  };
}

function buildPointFeature(p: PointSpec, stateId: string, year: number) {
  return {
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
    properties: {
      stateId,
      year,
      kind: p.kind,
      name: p.name,
      notes: p.notes ?? null,
    },
  };
}

function buildState(anchorPath: string) {
  const anchor: AnchorFile = JSON.parse(readFileSync(anchorPath, 'utf-8'));

  for (const z of anchor.zones) {
    if (!z.ring && !z.point) {
      throw new Error(`${anchor.stateId}: zona na "ring" na "point" bilan berilmagan`);
    }
    if (!(z.sourceIds ?? anchor.sourceIds)?.length) {
      throw new Error(`${anchor.stateId} / ${z.zone}: sourceIds yo'q (ILMIY QOIDA: manbasiz fakt yo'q)`);
    }
  }

  const zoneFeatures = anchor.zones.map((z) => buildZoneFeature(z, anchor.stateId, anchor.year, anchor.sourceIds));
  const pointFeatures = anchor.points.map((p) => buildPointFeature(p, anchor.stateId, anchor.year));

  const fc = {
    type: 'FeatureCollection' as const,
    features: [...zoneFeatures, ...pointFeatures],
  };

  const outDir = path.join(OUT_DIR, anchor.stateId);
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${anchor.year}.geojson`);
  writeFileSync(outPath, JSON.stringify(fc, null, 2));
  console.log(`✓ ${outPath} (${zoneFeatures.length} zona, ${pointFeatures.length} nuqta)`);
}

function main() {
  const files = readdirSync(ANCHORS_DIR).filter((f) => f.endsWith('.json'));
  console.log(`${files.length} ta anchor fayl topildi.\n`);
  for (const f of files) {
    buildState(path.join(ANCHORS_DIR, f));
  }
}

main();
