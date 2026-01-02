// @ts-check
import { defineConfig } from 'astro/config';
import sharp from 'sharp';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

function lqip() {
  return {
    name: 'lqip',
    enforce: 'pre',
    async load(id) {
      if (id.includes('lqip')) {
        const filePath = id.split('?')[0];
        const buffer = await sharp(filePath)
          .resize(20)
          .webp({ quality: 20 })
          .toBuffer();
        return `export default "data:image/webp;base64,${buffer.toString('base64')}";`;
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://spill.purduehackers.com',
  output: 'server',
  adapter: vercel(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), lqip()],
    server: {
      watch: {
        usePolling: true
      }
    }
  }
});
