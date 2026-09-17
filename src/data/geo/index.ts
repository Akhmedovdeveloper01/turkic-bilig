import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { FeatureCollection } from 'geojson';

const STATES_DIR = path.join(process.cwd(), 'src/data/geo/states');

/**
 * `scripts/geo/build-state.ts` tomonidan generatsiya qilingan GeoJSON faylni
 * o'qiydi. `.geojson` kengaytmasi Vite/Astro'ning standart JSON yuklovchisi
 * tomonidan avtomatik tan olinmagani uchun Node `fs` orqali to'g'ridan-to'g'ri
 * o'qiladi (build/render vaqtida, Astro frontmatter Node muhitida ishlaydi).
 */
export function getStateGeoJSON(stateId: string, year: number): FeatureCollection | undefined {
  const filePath = path.join(STATES_DIR, stateId, `${year}.geojson`);
  if (!existsSync(filePath)) return undefined;
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}
