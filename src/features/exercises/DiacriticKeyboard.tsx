import { useState } from 'react';

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
            className="h-10 w-10 rounded-md border border-stone-300 bg-white text-lg hover:bg-stone-100 disabled:opacity-40"
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
        className={`h-10 rounded-md border px-3 text-sm ${upper ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white hover:bg-stone-100'}`}
      >
        ⇧
      </button>
    </div>
  );
}
