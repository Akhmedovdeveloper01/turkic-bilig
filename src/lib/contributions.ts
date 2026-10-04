/**
 * Ilmiy meros (contributions) kolleksiyasini yuklash. Hissa "kim tomonidan"
 * qilingani qo'lda yozilmaydi — bog'langan alloma toifasi yoki turkiy davlat
 * homiyligidan aniqlanadi (src/content.config.ts dagi izohga qarang).
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type ActorType = 'turkiy-alloma' | 'turkiy-davlat' | 'mintaqa' | 'munozarali';

export const ACTOR_ORDER: ActorType[] = ['turkiy-alloma', 'turkiy-davlat', 'mintaqa', 'munozarali'];

export const DOMAINS = [
  'matematika', 'astronomiya', 'tibbiyot', 'geografiya', 'tilshunoslik', 'islom-ilmlari',
  'falsafa', 'tarix', 'adabiyot', 'memorchilik', 'talim',
] as const;

export interface LinkedEntry {
  slug: string;
  title: string;
}

export interface Contribution {
  id: string;
  facts: CollectionEntry<'contributionFacts'>['data'];
  entry: CollectionEntry<'contributions'>;
  isFallback: boolean;
  actor: ActorType;
  scholars: LinkedEntry[];
  states: LinkedEntry[];
  rulers: LinkedEntry[];
  sources: CollectionEntry<'sources'>[];
}

/** Hissa belgisi asosiy muallif — `scholars[0]` toifasidan olinadi (qolganlari hamkor yoki
 * davomchilar); alloma ko'rsatilmagan bo'lsa — turkiy davlat homiyligi. */
function actorFor(categories: CollectionEntry<'scholarFacts'>['data']['category'][], hasStates: boolean): ActorType {
  const lead = categories[0];
  if (lead === undefined) return hasStates ? 'turkiy-davlat' : 'mintaqa';
  return lead === 'turkiy' ? 'turkiy-alloma' : lead === 'munozarali' ? 'munozarali' : 'mintaqa';
}

async function localizedTitle(collection: 'scholars' | 'states' | 'rulers', lang: string, slug: string): Promise<string> {
  const entry = (await getEntry(collection, `${lang}/${slug}`)) ?? (await getEntry(collection, `uz/${slug}`));
  return entry?.data.title ?? slug;
}

// Har bir til uchun bir marta yuklanadi — alloma va davlat sahifalaridagi bloklar ham shu natijadan foydalanadi.
const cache = new Map<string, Promise<Contribution[]>>();

export function loadContributions(lang: string): Promise<Contribution[]> {
  if (!cache.has(lang)) cache.set(lang, load(lang));
  return cache.get(lang)!;
}

async function load(lang: string): Promise<Contribution[]> {
  const all = await getCollection('contributionFacts');
  const items = await Promise.all(
    all.map(async (f) => {
      const localized = await getEntry('contributions', `${lang}/${f.id}`);
      const entry = localized ?? (await getEntry('contributions', `uz/${f.id}`));
      if (!entry) return null;
      const scholarFacts = (await Promise.all(f.data.scholars.map((r) => getEntry(r)))).filter((s) => s !== undefined);
      const sources = (await Promise.all(f.data.sources.map((r) => getEntry(r)))).filter((s) => s !== undefined);
      return {
        id: f.id,
        facts: f.data,
        entry,
        isFallback: !localized,
        actor: actorFor(scholarFacts.map((s) => s.data.category), f.data.states.length > 0),
        scholars: await Promise.all(f.data.scholars.map(async (r) => ({ slug: r.id, title: await localizedTitle('scholars', lang, r.id) }))),
        states: await Promise.all(f.data.states.map(async (r) => ({ slug: r.id, title: await localizedTitle('states', lang, r.id) }))),
        rulers: await Promise.all(f.data.rulers.map(async (r) => ({ slug: r.id, title: await localizedTitle('rulers', lang, r.id) }))),
        sources,
      } satisfies Contribution;
    })
  );
  return items
    .filter((i) => i !== null)
    .sort((a, b) => (a.facts.era === 'm.av' ? -a.facts.year : a.facts.year) - (b.facts.era === 'm.av' ? -b.facts.year : b.facts.year));
}
