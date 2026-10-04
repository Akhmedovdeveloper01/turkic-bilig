/**
 * Karusel fotosuratlari repozitoriyda saqlanadi (src/assets/gallery/) va build vaqtida
 * mahalliy fayldan siqiladi — build Wikimedia serveriga bog'liq emas (CI'da 429 xatosi
 * bo'lmaydi). Muallif, litsenziya va manba havolasi src/data/gallery.json da.
 */
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/gallery/*.jpg', { eager: true });

/** gallery.json dagi `src` ("gallery/{fayl}.jpg") → rasm metama'lumoti. */
export function galleryImage(src: string): ImageMetadata {
  const file = files[`../assets/${src}`];
  if (!file) throw new Error(`Karusel rasmi topilmadi: ${src} (scripts/commons/fetch-gallery.py ni ishga tushiring)`);
  return file.default;
}
