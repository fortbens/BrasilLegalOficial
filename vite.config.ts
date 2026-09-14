import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const buildTimestamp = Date.now().toString();
  const buildDate = new Date().toISOString();

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'vite-plugin-cache-buster',
        buildStart() {
          // Garante que version.json seja gerado com timestamp atual
          const versionPayload = JSON.stringify({
            version: buildTimestamp,
            buildDate: buildDate,
            buildTime: Date.now()
          }, null, 2);

          try {
            const publicDir = path.resolve(__dirname, 'public');
            if (fs.existsSync(publicDir)) {
              fs.writeFileSync(path.join(publicDir, 'version.json'), versionPayload, 'utf-8');
            }
          } catch (e) {
            console.warn('[CacheBuster] Não foi possível gravar public/version.json:', e);
          }
        },
        transformIndexHtml(html) {
          // Insere meta tags de versão e cache buster no index.html transformado
          return html
            .replace(
              /src="\/src\/main\.tsx"/g,
              `src="/src/main.tsx?v=${buildTimestamp}"`
            );
        }
      }
    ],
    define: {
      'import.meta.env.VITE_APP_BUILD_TIME': JSON.stringify(buildDate),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(buildTimestamp),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Estratégia de cache-busting nos artefatos compilados
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
