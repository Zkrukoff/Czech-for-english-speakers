import { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { updateSettings, useSettings } from '@/db/settings';
import { exportData, importData, resetProgress } from '@/db/backup';
import { czechVoices, speech } from '@/lib/audio/speech';

function useCzechVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => czechVoices());
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return;
    const update = () => setVoices(czechVoices());
    speechSynthesis.addEventListener('voiceschanged', update);
    update();
    return () => speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);
  return voices;
}

export function SettingsPage() {
  const s = useSettings();
  const voices = useCzechVoices();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function download() {
    const data = await exportData();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `czech-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function upload(file: File) {
    try {
      await importData(JSON.parse(await file.text()));
      setMessage('Your progress was restored from the file.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'That file could not be read.');
    }
  }

  return (
    <>
      <PageHeader title="Settings" />
      <div className="max-w-xl space-y-8">
        <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">Answers</h2>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" checked={s.strictDiacritics} onChange={(e) => updateSettings({ strictDiacritics: e.target.checked })} />
            <span>
              <span className="font-medium">Require exact diacritics</span>
              <span className="block text-sm text-stone-600">When off, "kavu" is accepted for "kávu" but flagged so you see the correct spelling. When on, it counts as wrong.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" checked={s.showSpokenForms} onChange={(e) => updateSettings({ showSpokenForms: e.target.checked })} />
            <span>
              <span className="font-medium">Show spoken (colloquial) forms</span>
              <span className="block text-sm text-stone-600">Notes like "you'll often hear dobrej for dobrý".</span>
            </span>
          </label>
        </section>

        <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">Audio</h2>
          {voices.length === 0 ? (
            <p className="text-sm text-stone-600">
              Your browser has no Czech (cs-CZ) voice, so listen buttons are hidden. Most systems can add one in their language or speech settings.
            </p>
          ) : (
            <label className="block">
              <span className="font-medium">Czech voice</span>
              <select value={s.voiceURI ?? ''} onChange={(e) => updateSettings({ voiceURI: e.target.value || undefined })} className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2">
                <option value="">Default</option>
                {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
              </select>
            </label>
          )}
          <label className="block">
            <span className="font-medium">Speech rate: {s.speechRate.toFixed(1)}×</span>
            <input type="range" min={0.5} max={1.5} step={0.1} value={s.speechRate} onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })} className="mt-2 block w-full" />
          </label>
          {voices.length > 0 && (
            <button type="button" onClick={() => speech.speak('Dobrý den, jak se máte?', { rate: s.speechRate, voiceURI: s.voiceURI })} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100">
              Test: "Dobrý den, jak se máte?"
            </button>
          )}
        </section>

        <section className="space-y-3 rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">Your data</h2>
          <p className="text-sm text-stone-600">Everything is stored only in this browser. Download a copy to keep it safe or move it to another device.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={download} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100">Download my data</button>
            <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100">Restore from file…</button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ''; }} />
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Delete all your progress, reviews and answers? This cannot be undone.')) {
                  await resetProgress();
                  setMessage('All progress was deleted.');
                }
              }}
              className="rounded-md border border-rose-300 px-3 py-1.5 text-sm text-rose-800 hover:bg-rose-50"
            >
              Reset progress…
            </button>
          </div>
          {message && <p role="status" className="text-sm text-stone-800">{message}</p>}
        </section>
      </div>
    </>
  );
}
