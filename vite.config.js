import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const gitDir = resolve(import.meta.dirname ?? process.cwd(), '.git');

const runGit = (args) =>
  execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();

// Build bisa berjalan di dalam container yang tidak punya biner git,
// jadi baca langsung dari folder .git kalau perintah git gagal.
const readHeadFromGitDir = () => {
  const head = readFileSync(resolve(gitDir, 'HEAD'), 'utf8').trim();
  if (!head.startsWith('ref:')) {
    return { hash: head, branch: 'detached' };
  }
  const ref = head.slice(4).trim();
  const branch = ref.replace(/^refs\/heads\//, '');
  try {
    return { hash: readFileSync(resolve(gitDir, ref), 'utf8').trim(), branch };
  } catch {
    const packed = readFileSync(resolve(gitDir, 'packed-refs'), 'utf8');
    const line = packed.split(/\r?\n/).find((item) => item.endsWith(` ${ref}`));
    if (!line) {
      throw new Error(`ref not found: ${ref}`);
    }
    return { hash: line.split(' ')[0], branch };
  }
};

// Hanya objek "loose" (commit lokal terbaru biasanya loose). Kalau commit
// sudah dipadatkan ke packfile, tanggal/pesan dikosongkan, bukan error.
const readCommitFromGitDir = (hash) => {
  const raw = inflateSync(
    readFileSync(resolve(gitDir, 'objects', hash.slice(0, 2), hash.slice(2))),
  ).toString('utf8');
  const body = raw.slice(raw.indexOf('\0') + 1);
  const separator = body.indexOf('\n\n');
  const headers = body.slice(0, separator);
  const committer = headers.split('\n').find((line) => line.startsWith('committer '));
  const seconds = Number(committer?.match(/ (\d+) [+-]\d{4}$/)?.[1]);
  return {
    date: seconds ? new Date(seconds * 1000) : null,
    message: body.slice(separator + 2),
  };
};

// Buang trailer otomatis supaya tooltip hanya berisi pesan yang ditulis manusia.
const cleanMessage = (message) =>
  (message || '')
    .split(/\r?\n/)
    .filter((line) => !/^(Co-Authored-By|Claude-Session|Signed-off-by):/i.test(line))
    .join('\n')
    .trim();

const commit = (() => {
  try {
    const [hash, iso, ...message] = runGit('log -1 --format=%h%n%cI%n%B').split('\n');
    return {
      hash,
      branch: runGit('rev-parse --abbrev-ref HEAD'),
      date: new Date(iso),
      message: cleanMessage(message.join('\n')),
    };
  } catch {
    try {
      const { hash, branch } = readHeadFromGitDir();
      let details = { date: null, message: '' };
      try {
        details = readCommitFromGitDir(hash);
      } catch {
        // packfile: biarkan kosong
      }
      return { hash: hash.slice(0, 7), branch, ...details, message: cleanMessage(details.message) };
    } catch {
      return { hash: 'unknown', branch: 'unknown', date: null, message: '' };
    }
  }
})();

// Selalu WIB, tidak ikut zona waktu mesin/container yang menjalankan build.
const formatWib = (date) => {
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .formatToParts(date)
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} WIB`;
};

const buildDate = new Date();
const buildTime = formatWib(buildDate);
const commitTime = formatWib(commit.date);

// version.json di root situs: cek versi yang sedang live tanpa login,
// misalnya `curl https://domain/version.json`. Tidak di-precache service worker.
const versionFile = () => ({
  name: 'version-file',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: `${JSON.stringify(
        {
          version: process.env.npm_package_version || null,
          gitHash: commit.hash,
          gitBranch: commit.branch,
          commitTime,
          commitMessage: commit.message,
          buildTime,
          buildTimeIso: buildDate.toISOString(),
        },
        null,
        2,
      )}\n`,
    });
  },
});

export default defineConfig(() => ({
  define: {
    'import.meta.env.VITE_APP_GIT_HASH': JSON.stringify(commit.hash),
    'import.meta.env.VITE_APP_GIT_BRANCH': JSON.stringify(commit.branch),
    'import.meta.env.VITE_APP_COMMIT_TIME': JSON.stringify(commitTime),
    'import.meta.env.VITE_APP_COMMIT_MESSAGE': JSON.stringify(commit.message),
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
    versionFile(),
    svgr(),
    react(),
    VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        globPatterns: ['**/*.{js,css,html,woff,woff2,mp3}'],
      },
      manifest: {
        short_name: 'Pantauku',
        name: 'Pantauku',
        theme_color: '#FF6A00',
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
