import { useState } from 'react';
import { IconUp } from '@/components/icons';

const LETTERS = ['á', 'č', 'ď', 'é', 'ě', 'í', 'ň', 'ó', 'ř', 'š', 'ť', 'ú', 'ů', 'ý', 'ž'];

/** On-screen row of Czech letters for keyboards without a Czech layout. */
export function DiacriticKeyboard({ onInsert, disabled }: { onInsert: (ch: string) => void; disabled?: boolean }) {
  const [upper, setUpper] = useState(false);
  return (
    <div className="flex flex-wrap gap-1" aria-label="Czech letters">
      {LETTERS.map((l) => {
        const ch = upper ? l.toUpperCase() : l;
        return (
          <button
            key={l}
            type="button"
            disabled={disabled}
            // Keep focus in the text field.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onInsert(ch)}
            lang="cs"
            className="h-10 w-10 rounded-md border border-rule-strong bg-surface text-lg hover:bg-paper-2 disabled:opacity-40"
          >
            {ch}
          </button>
        );
      })}
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setUpper((u) => !u)}
        aria-pressed={upper}
        className={`h-10 rounded-md border px-3 text-sm ${upper ? 'border-ink bg-ink text-on-fill-light' : 'border-rule-strong bg-surface hover:bg-paper-2'}`}
      >
        <IconUp size={18} title="Capital letters" />
      </button>
    </div>
  );
}
