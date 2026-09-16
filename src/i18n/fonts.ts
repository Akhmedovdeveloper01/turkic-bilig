import type { Script } from './locales';

/**
 * Har bir yozuv tizimi uchun faqat kerakli Noto Sans paketi yuklanadi
 * (BaseLayout.astro da dinamik import orqali) — barcha shriftlarni
 * har sahifada yuklamaslik uchun.
 */
export const SCRIPT_FONT_IMPORTS: Record<Script, () => Promise<unknown>> = {
  latin: () => import('@fontsource/noto-sans/400.css'),
  cyrillic: () => import('@fontsource/noto-sans/cyrillic-400.css'),
  arabic: () => import('@fontsource/noto-sans-arabic/400.css'),
  hans: () => import('@fontsource/noto-sans-sc/400.css'),
  jp: () => import('@fontsource/noto-sans-jp/400.css'),
  kr: () => import('@fontsource/noto-sans-kr/400.css'),
  devanagari: () => import('@fontsource/noto-sans-devanagari/400.css'),
};

export const SCRIPT_FONT_WEIGHT_IMPORTS: Record<Script, () => Promise<unknown>> = {
  latin: () => import('@fontsource/noto-sans/700.css'),
  cyrillic: () => import('@fontsource/noto-sans/cyrillic-700.css'),
  arabic: () => import('@fontsource/noto-sans-arabic/700.css'),
  hans: () => import('@fontsource/noto-sans-sc/700.css'),
  jp: () => import('@fontsource/noto-sans-jp/700.css'),
  kr: () => import('@fontsource/noto-sans-kr/700.css'),
  devanagari: () => import('@fontsource/noto-sans-devanagari/700.css'),
};
