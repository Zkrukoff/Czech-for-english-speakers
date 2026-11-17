import { useSettings } from '@/db/settings';

/** "You'll hear: dobrej" note for obecná čeština; hidden if the learner turned these off. */
export function SpokenFormNote({ spoken }: { spoken: { form: string; note?: string } }) {
  const { showSpokenForms } = useSettings();
  if (!showSpokenForms) return null;
  return (
    <div className="inline-flex max-w-2xl gap-2 rounded-lg border border-champagne bg-champagne-tint px-3 py-2 text-sm text-ink">
      <span className="font-medium">Spoken:</span>
      <span>
        <b>{spoken.form}</b>
        {spoken.note && <> · {spoken.note}</>}
      </span>
    </div>
  );
}
