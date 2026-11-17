import { useState } from 'react';
import { SELF_ASSESSED } from '@/lib/answers/check';

/** Think of the meaning, show it, then say honestly whether you knew it. */
export function SelfCheckInput({ reveal, disabled, onAssess }: { reveal?: string; disabled: boolean; onAssess: (v: string) => void }) {
  const [shown, setShown] = useState(false);
  if (!shown) {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => setShown(true)}>
        Show what you saved
      </button>
    );
  }
  return (
    <div className="space-y-4">
      <p className="whitespace-pre-line border-l-4 border-ink bg-paper-2 px-4 py-3 text-ink">{reveal || 'No meaning saved. Did you remember what it means?'}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={disabled} onClick={() => onAssess(SELF_ASSESSED.good)}>
          <span lang="cs">Vím</span> · I knew it
        </button>
        <button type="button" className="btn btn-quiet" disabled={disabled} onClick={() => onAssess(SELF_ASSESSED.again)}>
          <span lang="cs">Ještě ne</span> · not yet
        </button>
      </div>
    </div>
  );
}
