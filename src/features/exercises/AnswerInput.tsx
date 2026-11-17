import { useEffect, useRef } from 'react';
import { DiacriticKeyboard } from './DiacriticKeyboard';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
  lang: 'cs' | 'en';
  short?: boolean;
}

export function AnswerInput({ value, onChange, onSubmit, disabled, placeholder, lang, short }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  function insert(ch: string) {
    const el = ref.current;
    if (!el) return onChange(value + ch);
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + ch + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + ch.length, start + ch.length);
    });
  }

  return (
    <div className="space-y-2">
      <input
        ref={ref}
        type="text"
        value={value}
        disabled={disabled}
        lang={lang}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={placeholder}
        aria-label="Your answer"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        className={`${short ? 'w-48' : 'w-full'} rounded-lg border border-rule-strong bg-surface px-4 py-3 text-lg shadow-offset-sm focus:border-vltava focus:outline-none disabled:bg-paper`}
      />
      {lang === 'cs' && <DiacriticKeyboard onInsert={insert} disabled={disabled} />}
    </div>
  );
}
