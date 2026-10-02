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
