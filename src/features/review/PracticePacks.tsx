import { useSearchParams } from 'react-router-dom';
import { PhraseSituations } from '@/features/phrases/PhraseSituations';
import { WordDecks } from '@/features/words/WordDecks';

const TABS = [
  { id: 'words', cs: 'Slovíčka', en: 'words by topic' },
  { id: 'phrases', cs: 'Fráze', en: 'phrases by situation' },
] as const;

/** Things to add to review on purpose: vocabulary decks and the phrase deck. */
export function PracticePacks() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('pack') === 'phrases' ? 'phrases' : 'words';
  return (
    <section id="packs" aria-labelledby="packs-h" className="mt-12">
      <h2 id="packs-h" className="label-board mb-3 text-ink-3">Add to your reviews</h2>
      <div role="tablist" aria-label="Packs" className="mb-5 flex gap-1 border-b border-rule">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setParams(t.id === 'words' ? {} : { pack: t.id }, { replace: true })}
            className={`-mb-px min-h-11 min-w-0 flex-1 border-b-2 px-3 py-2 text-left text-sm font-medium sm:flex-none sm:px-4 ${tab === t.id ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink'}`}
          >
            <span lang="cs">{t.cs}</span>
            <span className="block text-xs font-normal sm:inline"><span className="hidden sm:inline"> · </span>{t.en}</span>
          </button>
        ))}
      </div>
      {tab === 'words' ? <WordDecks /> : <PhraseSituations />}
    </section>
  );
}
