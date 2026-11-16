import { PageHeader } from '@/components/PageHeader';
import { updateSettings, useSettings } from '@/db/settings';

export function SettingsPage() {
  const s = useSettings();
  return (
    <>
      <PageHeader title="Settings" />
      <div className="max-w-xl space-y-4 rounded-xl border border-stone-200 bg-white p-5">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" checked={s.strictDiacritics} onChange={(e) => updateSettings({ strictDiacritics: e.target.checked })} />
          <span>
            <span className="font-medium">Require exact diacritics</span>
            <span className="block text-sm text-stone-600">When off, "kavu" is accepted for "kávu" but flagged so you see the correct spelling.</span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1" checked={s.showSpokenForms} onChange={(e) => updateSettings({ showSpokenForms: e.target.checked })} />
          <span>
            <span className="font-medium">Show spoken (colloquial) forms</span>
            <span className="block text-sm text-stone-600">Notes like "you'll often hear dobrej for dobrý".</span>
          </span>
        </label>
        <label className="block">
          <span className="font-medium">Speech rate: {s.speechRate.toFixed(1)}×</span>
          <input type="range" min={0.5} max={1.5} step={0.1} value={s.speechRate} onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })} className="mt-2 block w-full" />
        </label>
      </div>
    </>
  );
}
