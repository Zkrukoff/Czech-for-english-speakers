import type { Plugin } from 'vite';
import { createHash } from 'node:crypto';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Emits `sw.js`: precaches the built app (JS, CSS, fonts, icons, the page) so
 * the whole app, emergency cards included, works offline. Real recordings in
 * public/audio are left out to keep the install small.
 *
 * The cache name hashes the file list, so every deploy ships a new worker. It
 * waits until the learner accepts the update notice (no surprise reloads
 * mid-lesson).
 */
export function serviceWorker(): Plugin {
  const publicFiles = (dir: string): string[] => {
    const out: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else out.push(relative(dir, p).split('\\').join('/'));
      }
    };
    walk(dir);
    return out.filter((f) => !f.startsWith('audio/'));
  };
  let publicDir = '';
  return {
    name: 'prazak-service-worker',
    apply: 'build',
    configResolved(c) {
      publicDir = c.publicDir;
    },
    generateBundle(_opts, bundle) {
      const files = [
        './',
        ...Object.keys(bundle).filter((f) => !f.endsWith('.map')),
        ...(publicDir ? publicFiles(publicDir) : []),
      ].sort();
      const version = createHash('sha256').update(files.join('\n')).digest('hex').slice(0, 12);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: swSource(version, files) });
    },
  };
}

function swSource(version: string, files: string[]): string {
  return `// Generated at build time by build/serviceWorker.ts.
const CACHE = 'prazak-${version}';
const FILES = ${JSON.stringify(files)};
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('prazak-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // Single-page app: every route is the same page.
    e.respondWith(caches.open(CACHE).then((c) => c.match('./', { ignoreVary: true }).then((hit) => hit || fetch(req))));
    return;
  }
  e.respondWith(caches.open(CACHE).then((c) => c.match(req, { ignoreVary: true }).then((hit) => hit || fetch(req))));
});
`;
}
