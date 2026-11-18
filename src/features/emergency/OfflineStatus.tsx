import { useEffect, useState } from 'react';

/** Says whether the app is saved for offline use (a service worker controls the page). */
export function OfflineStatus() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return setReady(false);
    navigator.serviceWorker.getRegistration().then((r) => setReady(!!r?.active)).catch(() => setReady(false));
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  if (ready === null) return null;
  return (
    <p className="label-board mt-4 text-ink-3" role="status">
      {!online ? 'Offline · this page still works' : ready ? 'Saved for offline use' : 'Open the app once online to save it for offline use'}
    </p>
  );
}
