import { defaultLocale } from './locales';

type UiDict = Record<string, unknown>;

// Barcha src/i18n/ui/{til}.json fayllari build vaqtida bitta joyga yig'iladi.
// Fayli bo'lmagan til uchun modul topilmaydi va shunchaki bo'sh {} deb olinadi —
// bu holda pastdagi fallback zanjiri (til -> en -> uz) ishlaydi.
const modules = import.meta.glob<{ default: UiDict }>('./ui/*.json', { eager: true });

const dictionaries: Record<string, UiDict> = {};
for (const path in modules) {
  const code = path.replace('./ui/', '').replace('.json', '');
  dictionaries[code] = modules[path].default;
}

function deepMerge(base: UiDict, override: UiDict): UiDict {
  const result: UiDict = { ...base };
  for (const key in override) {
    const baseValue = result[key];
    const overrideValue = override[key];
    if (
      baseValue &&
      overrideValue &&
      typeof baseValue === 'object' &&
      typeof overrideValue === 'object' &&
      !Array.isArray(baseValue) &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = deepMerge(baseValue as UiDict, overrideValue as UiDict);
    } else {
      result[key] = overrideValue;
    }
  }
  return result;
}

/**
 * Berilgan til uchun interfeys lug'atini qaytaradi.
 * Fallback zanjiri: {til} -> en -> uz (loyiha konstitutsiyasidagi qoida).
 */
export function getUiDictionary(code: string): UiDict {
  const uz = dictionaries[defaultLocale] ?? {};
  const en = dictionaries['en'] ?? {};
  const own = dictionaries[code] ?? {};
  return deepMerge(deepMerge(uz, en), own);
}

function getPath(dict: UiDict, keyPath: string): unknown {
  return keyPath.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as UiDict)[part];
    }
    return undefined;
  }, dict);
}

/**
 * `t('nav.home')` kabi nuqta bilan ajratilgan kalitni matnga aylantiradi.
 * `params` berilsa, matndagi `{param}` o'rniga qo'yiladi.
 */
export function createTranslator(code: string) {
  const dict = getUiDictionary(code);
  return function t(keyPath: string, params?: Record<string, string | number>): string {
    const value = getPath(dict, keyPath);
    let text = typeof value === 'string' ? value : keyPath;
    if (params) {
      for (const [param, paramValue] of Object.entries(params)) {
        text = text.replaceAll(`{${param}}`, String(paramValue));
      }
    }
    return text;
  };
}
