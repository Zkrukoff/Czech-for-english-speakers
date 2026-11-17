import { useSettings } from '@/db/settings';

/** "You'll hear: dobrej" note for obecná čeština; hidden if the learner turned these off. */
export function SpokenFormNote({ spoken }: { spoken: { form: string; note?: string } }) {
  const { showSpokenForms } = useSettings();
  if (!showSpokenForms) return null;
  return (
    <div className="inline-flex max-w-2xl flex-wrap gap-x-2 rounded-sm border-l-4 border-champagne bg-champagne-tint px-3 py-2 text-sm text-ink">
      <span className="label-board text-ink-2" title="How Pražáci actually say it">Jak to říkají Pražáci</span>
      <span>
        <b lang="cs">{spoken.form}</b>
        {spoken.note && <> · {spoken.note}</>}
      </span>
    </div>
  );
}
