/**
 * Hukmdor va sarkardalar ro'yxatini yuklash. Allomalar ro'yxatida bor shaxs
 * (`scholar` maydoni) uchun nom va qisqacha matn alloma yozuvidan olinadi va
 * kartochka alloma sahifasiga olib boradi — matn takrorlanmaydi.
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { sortableYear } from '../i18n/years';

export type RulerFacts = CollectionEntry<'rulerFacts'>['data'];

export interface Ruler {
  slug: string;
  facts: RulerFacts;
  title: string;
  summary: string;
  href: string;
  isFallback: boolean;
  /** O'z sahifasi bor yozuv (scholar orqali emas). */
  entry: CollectionEntry<'rulers'> | null;
}

/** Tartib uchun yil: tug'ilgan yil → birinchi hukmronlik → vafot − 60 → asr. */
export function orderYear(f: RulerFacts): number {
  if (f.birthYear !== undefined) return sortableYear(f.birthYear, f.birthEra);
  const r = f.reigns[0];
  if (r) return sortableYear(r.from, r.fromEra) - 30;
  if (f.deathYear !== undefined) return sortableYear(f.deathYear, f.deathEra) - 60;
  if (f.century !== undefined) return f.century > 0 ? (f.century - 1) * 100 + 30 : f.century * 100 + 30;
  return 9999;
}

const cache = new Map<string, Promise<Ruler[]>>();

export function loadRulers(lang: string): Promise<Ruler[]> {
  if (!cache.has(lang)) cache.set(lang, load(lang));
  return cache.get(lang)!;
}

async function load(lang: string): Promise<Ruler[]> {
  const all = await getCollection('rulerFacts');
  const items = await Promise.all(
    all.map(async (f): Promise<Ruler | null> => {
      if (f.data.scholar) {
        const sid = f.data.scholar.id;
        const localized = await getEntry('scholars', `${lang}/${sid}`);
        const s = localized ?? (await getEntry('scholars', `uz/${sid}`));
        if (!s) return null;
        return { slug: f.id, facts: f.data, title: s.data.title, summary: s.data.summary, href: `/${lang}/allomalar/${sid}`, isFallback: !localized, entry: null };
      }
      const localized = await getEntry('rulers', `${lang}/${f.id}`);
      const entry = localized ?? (await getEntry('rulers', `uz/${f.id}`));
      if (!entry) return null;
      return { slug: f.id, facts: f.data, title: entry.data.title, summary: entry.data.summary, href: `/${lang}/hukmdorlar/${f.id}`, isFallback: !localized, entry };
    })
  );
  return items.filter((i) => i !== null).sort((a, b) => orderYear(a.facts) - orderYear(b.facts));
}
