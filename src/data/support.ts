/**
 * "Qo'llab-quvvatlash" sahifasining sozlamalari.
 *
 * Hisob ochilgach shu yerga faqat havolani yozish kifoya — sahifa tugmani
 * o'zi faollashtiradi. Havola `null` bo'lsa, "Tez orada" ko'rsatiladi.
 * Karta raqami yoki boshqa shaxsiy rekvizitlar bu yerga YOZILMAYDI —
 * faqat to'lov xizmatining rasmiy sahifasi havolasi (https://...).
 */

export type SupportMethodId = 'payme' | 'click' | 'boosty';

export interface SupportMethod {
  id: SupportMethodId;
  /** Ko'rsatiladigan nom (xizmat brendi — tarjima qilinmaydi). */
  name: string;
  /** To'lov sahifasi havolasi; hisob hali ochilmagan bo'lsa — null. */
  url: string | null;
}

export const supportMethods: SupportMethod[] = [
  { id: 'payme', name: 'Payme', url: null },
  { id: 'click', name: 'Click', url: null },
  { id: 'boosty', name: 'Boosty', url: null },
];

/** Tashkilotlar (grant, homiylik, tijoriy litsenziya) uchun aloqa manzili; hali yo'q bo'lsa — null. */
export const partnershipEmail: string | null = null;

for (const m of supportMethods) {
  if (m.url !== null && !m.url.startsWith('https://')) {
    throw new Error(`support.ts: "${m.id}" havolasi https:// bilan boshlanishi kerak — ${m.url}`);
  }
}
