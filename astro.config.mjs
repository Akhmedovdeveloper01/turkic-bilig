// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://turkicbilig.uz',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx()],

  // Tashqi rasm domenlari yo'q: karusel fotosuratlari ham repozitoriyda
  // (src/assets/gallery/) — build Wikimedia serveriga bog'liq emas.
});