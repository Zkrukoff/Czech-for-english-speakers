interface Props {
  options: readonly string[];
  /** The learner's choice, once made. */
  chosen?: string;
  correct?: readonly string[];
  onChoose: (value: string) => void;
  lang?: 'cs' | 'en';
  render?: (option: string) => React.ReactNode;
}

/** A row of choices. Right answers are marked in words, not colour alone. */
export function ChoiceInput({ options, chosen, correct, onChoose, lang = 'cs', render }: Props) {
  const done = chosen !== undefined;
  return (
    <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Choose one">
      {options.map((o) => {
        const isRight = done && correct?.includes(o);
        const isChosen = done && chosen === o;
        return (
          <button
            key={o}
            type="button"
            lang={lang}
            disabled={done}
            onClick={() => onChoose(o)}
            className={`min-h-11 rounded-md border-2 px-4 py-3 text-left text-lg ${
              isRight ? 'border-ink bg-paper-2 font-semibold' : isChosen ? 'border-ink bg-surface line-through decoration-2' : 'border-rule-strong bg-surface hover:border-ink'
            }`}
          >
            {render ? render(o) : o}
            {isRight && <span className="sr-only"> (right answer)</span>}
            {isChosen && !isRight && <span className="sr-only"> (your choice)</span>}
          </button>
        );
      })}
    </div>
  );
}
