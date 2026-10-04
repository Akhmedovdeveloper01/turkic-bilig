/**
 * Shaxs qaysi silsila(lar)ga kirishini topadi — hukmdor yoki alloma sahifasida
 * silsilani shu shaxs ajratilgan holda ko'rsatish uchun.
 */
import { getCollection, getEntry } from 'astro:content';

export interface Membership {
  dynasty: string;
  member: string;
}

let all: Promise<{ dynasty: string; member: string; ruler?: string; scholar?: string }[]> | undefined;

async function load() {
  const out: { dynasty: string; member: string; ruler?: string; scholar?: string }[] = [];
  for (const d of await getCollection('dynastyFacts')) {
    for (const m of d.data.members) {
      // Allomalar ro'yxatidagi hukmdor (rulerFacts.scholar) alloma sahifasida ham topiladi.
      const viaScholar = m.ruler ? (await getEntry(m.ruler))?.data.scholar?.id : undefined;
      out.push({ dynasty: d.id, member: m.id, ruler: m.ruler?.id, scholar: m.scholar?.id ?? viaScholar });
    }
  }
  return out;
}

export async function membershipsOf(who: { ruler?: string; scholar?: string }): Promise<Membership[]> {
  all ??= load();
  return (await all)
    .filter((x) => (who.ruler && x.ruler === who.ruler) || (who.scholar && x.scholar === who.scholar))
    .map(({ dynasty, member }) => ({ dynasty, member }));
}
