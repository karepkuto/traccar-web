import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Build bisa berjalan di dalam container yang tidak punya biner git,
// jadi baca langsung dari folder .git kalau perintah git gagal.
const readHashFromGitDir = () => {
  const gitDir = resolve(import.meta.dirname ?? process.cwd(), '.git');
  const head = readFileSync(resolve(gitDir, 'HEAD'), 'utf8').trim();
  if (!head.startsWith('ref:')) {
    return head;
  }
  const ref = head.slice(4).trim();
  try {
    return readFileSync(resolve(gitDir, ref), 'utf8').trim();
  } catch {
    const packed = readFileSync(resolve(gitDir, 'packed-refs'), 'utf8');
    const line = packed.split(/\r?\n/).find((item) => item.endsWith(` ${ref}`));
    if (!line) {
      throw new Error(`ref not found: ${ref}`);
    }
    return line.split(' ')[0];
  }
};

const gitHash = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    try {
      return readHashFromGitDir().slice(0, 8);
    } catch {
      return 'unknown';
    }
  }
})();

// Selalu WIB, tidak ikut zona waktu mesin/container yang menjalankan build.
const buildTime = (() => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .formatToParts(new Date())
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} WIB`;
})();

export default defineConfig(() => ({
  define: {
    'import.meta.env.VITE_APP_GIT_HASH': JSON.stringify(gitHash),
    'import.meta.env.VITE_APP_BUILD_TIME': JSON.stringify(buildTime),
  },
  server: {
    port: 3000,
    proxy: {
      '/api/socket': {
        target: 'wss://app.pantauku.my.id',
        ws: true,
        changeOrigin: true,
      },
      '/api': {
        target: 'https://app.pantauku.my.id',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1100,
  },
  plugins: [
    svgr(),
    react(),
    VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        globPatterns: ['**/*.{js,css,html,woff,woff2,mp3}'],
      },
      manifest: {
        short_name: '${title}',
        name: '${description}',
        theme_color: '${colorPrimary}',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    viteStaticCopy({
      targets: [
        { src: 'node_modules/@mapbox/mapbox-gl-rtl-text/dist/mapbox-gl-rtl-text.js', dest: '' },
      ],
    }),
  ],
}));
