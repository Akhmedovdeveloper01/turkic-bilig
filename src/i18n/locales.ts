/**
 * Barcha qo'llab-quvvatlanadigan tillarning yagona konfiguratsiyasi.
 * Yangi til qo'shish uchun faqat shu massivga bitta yozuv qo'shish kifoya —
 * boshqa hech qanday joyda til ro'yxati qattiq yozilmasligi kerak.
 */

export type Script = 'latin' | 'cyrillic' | 'arabic' | 'hans' | 'jp' | 'kr' | 'devanagari';
export type Direction = 'ltr' | 'rtl';
export type LocaleGroup = 'turkiy' | 'boshqa';

/**
 * "faol" — sayt til almashtirgichida ko'rinadi, kamida qisman kontent bor.
 * "tayyorlanmoqda" — interfeys tayyor (yoki en/uz fallback orqali ishlaydi),
 * lekin kontent hali tarjima qilinmagan (bosqichlar.md dagi to'lqinlarga qarang).
 */
export type LocaleStatus = 'faol' | 'tayyorlanmoqda';

export interface Locale {
  /** BCP-47 kodi */
  code: string;
  /** Tilning o'z tilidagi nomi (bayroq emas, shu ishlatiladi) */
  endonym: string;
  script: Script;
  dir: Direction;
  /** CSS font-family nomi — src/i18n/fonts.ts dagi SCRIPT_FONTS bilan mos keladi */
  font: string;
  group: LocaleGroup;
  status: LocaleStatus;
}

export const locales: Locale[] = [
  // --- Turkiy tillar — lotin yozuvi ---
  { code: 'uz', endonym: "O'zbekcha", script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'faol' },
  { code: 'tr', endonym: 'Türkçe', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'az', endonym: 'Azərbaycanca', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'tk', endonym: 'Türkmençe', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'kaa', endonym: 'Qaraqalpaqsha', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'crh', endonym: 'Qırımtatarca', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'gag', endonym: 'Gagauzça', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },

  // --- Turkiy tillar — kirill yozuvi ---
  { code: 'kk', endonym: 'Қазақша', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'ky', endonym: 'Кыргызча', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'tt', endonym: 'Татарча', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'ba', endonym: 'Башҡортса', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'sah', endonym: 'Сахалыы', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'cv', endonym: 'Чӑвашла', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'tyv', endonym: 'Тыва дыл', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'alt', endonym: 'Алтай тил', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'kjh', endonym: 'Хакас тілі', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'krc', endonym: 'Къарачай-малкъар', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'kum', endonym: 'Къумукъ тил', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },
  { code: 'nog', endonym: 'Ногай тили', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'turkiy', status: 'tayyorlanmoqda' },

  // --- Turkiy tillar — arab yozuvi (RTL) ---
  { code: 'ug', endonym: 'ئۇيغۇرچە', script: 'arabic', dir: 'rtl', font: 'Noto Sans Arabic', group: 'turkiy', status: 'tayyorlanmoqda' },

  // --- Boshqa tillar ---
  { code: 'en', endonym: 'English', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'boshqa', status: 'faol' },
  { code: 'ru', endonym: 'Русский', script: 'cyrillic', dir: 'ltr', font: 'Noto Sans', group: 'boshqa', status: 'tayyorlanmoqda' },
  { code: 'ar', endonym: 'العربية', script: 'arabic', dir: 'rtl', font: 'Noto Sans Arabic', group: 'boshqa', status: 'tayyorlanmoqda' },
  { code: 'zh', endonym: '简体中文', script: 'hans', dir: 'ltr', font: 'Noto Sans SC', group: 'boshqa', status: 'tayyorlanmoqda' },
  { code: 'ko', endonym: '한국어', script: 'kr', dir: 'ltr', font: 'Noto Sans KR', group: 'boshqa', status: 'tayyorlanmoqda' },
  { code: 'ja', endonym: '日本語', script: 'jp', dir: 'ltr', font: 'Noto Sans JP', group: 'boshqa', status: 'tayyorlanmoqda' },
  { code: 'hi', endonym: 'हिन्दी', script: 'devanagari', dir: 'ltr', font: 'Noto Sans Devanagari', group: 'boshqa', status: 'tayyorlanmoqda' },
  { code: 'es', endonym: 'Español', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'boshqa', status: 'tayyorlanmoqda' },
  { code: 'fr', endonym: 'Français', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'boshqa', status: 'tayyorlanmoqda' },
  { code: 'de', endonym: 'Deutsch', script: 'latin', dir: 'ltr', font: 'Noto Sans', group: 'boshqa', status: 'tayyorlanmoqda' },
];

export const defaultLocale = 'uz';

export const localeCodes = locales.map((l) => l.code);

export function getLocale(code: string): Locale | undefined {
  return locales.find((l) => l.code === code);
}

export function isValidLocale(code: string): boolean {
  return localeCodes.includes(code);
}

export function isRtl(code: string): boolean {
  return getLocale(code)?.dir === 'rtl';
}

export const turkicLocales = locales.filter((l) => l.group === 'turkiy');
export const otherLocales = locales.filter((l) => l.group === 'boshqa');
