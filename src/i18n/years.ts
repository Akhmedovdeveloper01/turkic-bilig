/**
 * Tarixiy sanalarni formatlash. "mil. av." / "BC" / "до н. э." kabi belgilar
 * tarjima faylida (`common.yearBC`) — CLAUDE.md, ko'p tillilik 8-band.
 */
type Era = 'm.av' | 'milodiy';
type Translate = (key: string, params?: Record<string, string>) => string;

export function formatYear(t: Translate, year: number, era: Era): string {
  return era === 'm.av' ? t('common.yearBC', { year: String(year) }) : String(year);
}

export function formatPeriod(
  t: Translate,
  period: { startYear: number; startEra: Era; endYear: number; endEra: Era }
): string {
  const end =
    period.startEra === 'm.av' && period.endEra === 'milodiy'
      ? t('common.yearAD', { year: String(period.endYear) }) // eradan eraga o'tganda aniqlik uchun
      : formatYear(t, period.endYear, period.endEra);
  return `${formatYear(t, period.startYear, period.startEra)} – ${end}`;
}

/** Saralash uchun: miloddan avvalgi yillar manfiy son bo'ladi. */
export function sortableYear(year: number, era: Era): number {
  return era === 'm.av' ? -year : year;
}

type Period = { startYear: number; startEra: Era; endYear: number; endEra: Era };

/** Davlat necha yil mavjud bo'lgan (0-yil yo'qligi hisobga olingan). */
export function lifespan(p: Period): number {
  const s = sortableYear(p.startYear, p.startEra);
  const e = sortableYear(p.endYear, p.endEra);
  return e - s - (s < 0 && e > 0 ? 1 : 0);
}

/** Asrning [boshi, oxiri] — sortableYear shkalasida. c > 0 milodiy, c < 0 miloddan avvalgi. */
export function centuryRange(c: number): [number, number] {
  return c > 0 ? [(c - 1) * 100 + 1, c * 100] : [c * 100, (c + 1) * 100 - 1];
}

export function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

/** "XV asr" / "mil. av. III asr" kabi asr nomi. */
export function formatCentury(t: Translate, c: number): string {
  const roman = toRoman(Math.abs(c));
  const label = t('states.centuryLabel', { c: roman });
  return c > 0 ? label : t('common.yearBC', { year: label });
}
