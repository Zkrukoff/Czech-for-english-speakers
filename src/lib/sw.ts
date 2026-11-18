/** Service-worker registration and the "new version" hand-off. Production only. */

type Listener = (waiting: ServiceWorker | null) => void;
let waiting: ServiceWorker | null = null;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l(waiting));

export function onUpdateReady(l: Listener): () => void {
  listeners.add(l);
  l(waiting);
  return () => listeners.delete(l);
}

export function applyUpdate() {
  if (!waiting) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
  waiting.postMessage('SKIP_WAITING');
}

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const base = import.meta.env.BASE_URL;
  navigator.serviceWorker
    .register(`${base}sw.js`, { scope: base })
    .then((reg) => {
      const track = (w: ServiceWorker | null) => {
        if (!w) return;
        const check = () => {
          // Only an update if a worker already controls the page.
          if (w.state === 'installed' && navigator.serviceWorker.controller) {
            waiting = w;
            emit();
          }
        };
        check();
        w.addEventListener('statechange', check);
      };
      track(reg.waiting);
      reg.addEventListener('updatefound', () => track(reg.installing));
    })
    .catch((e: unknown) => console.error('Offline support could not be set up:', e));
}
