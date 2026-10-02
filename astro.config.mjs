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

  // Karusel rasmlari Wikimedia Commons'dan build vaqtida olinib, siqiladi
  // (repozitoriyda saqlanmaydi) — src/data/gallery.json.
  image: {
    domains: ['upload.wikimedia.org'],
  },
});