import { useEffect, useState } from 'react';
import { applyUpdate, onUpdateReady } from '@/lib/sw';

/** Shown when a new version is downloaded and waiting. Nothing reloads until the learner says so. */
export function UpdateNotice() {
  const [ready, setReady] = useState(false);
  useEffect(() => onUpdateReady((w) => setReady(!!w)), []);
  if (!ready) return null;
  return (
    <div role="status" className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-md border-2 border-ink bg-surface p-3 shadow-offset-sm">
      <span className="text-sm">
        <span lang="cs" className="font-semibold">Nová verze.</span> A newer Pražák is ready.
      </span>
      <button type="button" onClick={applyUpdate} className="btn btn-secondary shrink-0">Reload</button>
    </div>
  );
}
