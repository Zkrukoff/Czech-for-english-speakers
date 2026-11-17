import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { SectionNumber } from '@/components/ui';
import { course } from '@/content';
import { db, type Profile } from '@/db/db';
import { useProfile } from '@/db/hooks';
import { updateSettings, useSettings } from '@/db/settings';
import { exportData, importData, resetProgress } from '@/db/backup';
import { czechVoices, speech } from '@/lib/audio/speech';
import { getTheme, setTheme, type ThemeChoice } from '@/lib/theme';

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
  const [theme, setThemeState] = useState<ThemeChoice>(() => getTheme());
  const profile = useProfile();

  async function download() {
    const data = await exportData();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `prazak-progress-${new Date().toISOString().slice(0, 10)}.json`;
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

  const toggle = (label: string, cs: string, note: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-ink" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="font-semibold">{label}</span> <span lang="cs" className="text-ink-3">· {cs}</span>
        <span className="block text-sm text-ink-2">{note}</span>
      </span>
    </label>
  );
  const stations = course.lines.flatMap((l) => l.stops.map((st) => ({ key: `${l.id}/${st.slug}`, label: `${st.stationInfo.name} (${l.id})` })));

  return (
    <>
      <PageHeader title="Settings" cs="Nastavení" />
      <div className="max-w-2xl space-y-12">
        <section aria-labelledby="s-look">
          <SectionNumber n={1} id="s-look">Appearance</SectionNumber>
          <div role="radiogroup" aria-label="Theme" className="mt-4 grid gap-3 sm:grid-cols-3">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={theme === t}
                onClick={() => { setTheme(t); setThemeState(t); }}
                className={`flex min-h-20 flex-col items-start justify-between border-2 p-3 text-left ${theme === t ? 'border-ink shadow-offset-sm' : 'border-rule-strong hover:border-ink'} ${t === 'dark' ? 'bg-board text-on-fill-light' : t === 'light' ? 'bg-ticket text-on-fill-dark' : 'bg-surface'}`}
              >
                <span className="label-board" lang="cs">{{ system: 'Podle zařízení', light: 'Den', dark: 'Noční tramvaj' }[t]}</span>
                <span className="font-semibold">{{ system: 'Match my device', light: 'Day', dark: 'Night tram (dark)' }[t]}</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="s-cz" className="space-y-4">
          <SectionNumber n={2} id="s-cz">Czech as it's spoken</SectionNumber>
          {toggle('Show how Pražáci actually say it', 'jak to říkají Pražáci', 'Spoken-Czech notes next to the textbook form: dobrej for dobrý, mlíko for mléko, dropped jsem.', s.showSpokenForms, (v) => updateSettings({ showSpokenForms: v }))}
          {toggle('Require exact diacritics', 'přesná diakritika', '"kavu" for "kávu" is accepted and flagged when this is off; with it on, it counts as wrong.', s.strictDiacritics, (v) => updateSettings({ strictDiacritics: v }))}
        </section>

        <section aria-labelledby="s-audio" className="space-y-4">
          <SectionNumber n={3} id="s-audio">Audio</SectionNumber>
          <p className="text-sm text-ink-2">
            Core sounds are taught only with real Czech speakers. {course.audio.size === 0 ? 'No recordings are in yet, so listening exercises are switched off for now.' : `${course.audio.size} recordings so far.`}{' '}
            Other phrases use your browser's Czech voice, which is marked "synthetic voice" where it matters.
          </p>
          {voices.length === 0 ? (
            <p className="text-sm text-ink-2">
              Your browser has no Czech (cs-CZ) voice, so listen buttons are hidden. Most systems can add one in their language or speech settings.
            </p>
          ) : (
            <label className="block">
              <span className="font-semibold">Czech voice</span>
              <select value={s.voiceURI ?? ''} onChange={(e) => updateSettings({ voiceURI: e.target.value || undefined })} className="mt-1 block min-h-11 w-full rounded-sm border-2 border-ink bg-surface px-3">
                <option value="">Default</option>
                {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
              </select>
            </label>
          )}
          <label className="block">
            <span className="font-semibold">Speech rate: <span className="font-mono">{s.speechRate.toFixed(1)}×</span></span>
            <input type="range" min={0.5} max={1.5} step={0.1} value={s.speechRate} onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })} className="mt-2 block w-full accent-ink" />
          </label>
          {voices.length > 0 && (
            <button type="button" onClick={() => speech.speak('Dobrý den, jak se máte?', { rate: s.speechRate, voiceURI: s.voiceURI })} className="btn btn-secondary">
              Test: <span lang="cs">"Dobrý den, jak se máte?"</span>
            </button>
          )}
        </section>

        <section aria-labelledby="s-me" className="space-y-4">
          <SectionNumber n={4} id="s-me">About you</SectionNumber>
          {profile ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-semibold">Home station</span>
                <select
                  value={profile.homeStation ?? ''}
                  onChange={(e) => db.profile.update('me', { homeStation: e.target.value || undefined })}
                  className="mt-1 block min-h-11 w-full rounded-sm border-2 border-ink bg-surface px-3"
                  lang="cs"
                >
                  <option value="">None</option>
                  {stations.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="font-semibold">Your Czech</span>
                <select
                  value={profile.level ?? ''}
                  onChange={(e) => db.profile.update('me', { level: (e.target.value || undefined) as Profile['level'] })}
                  className="mt-1 block min-h-11 w-full rounded-sm border-2 border-ink bg-surface px-3"
                >
                  <option value="">Not set</option>
                  <option value="new">New to Czech</option>
                  <option value="A1">A few words</option>
                  <option value="A2">Getting by</option>
                  <option value="B1">Conversational</option>
                </select>
              </label>
            </div>
          ) : (
            <p className="text-sm text-ink-2">No profile yet. <Link to="/welcome" className="text-vltava underline">Set one up</Link>.</p>
          )}
        </section>

        <section aria-labelledby="s-data" className="space-y-3">
          <SectionNumber n={5} id="s-data">Your data</SectionNumber>
          <p className="text-sm text-ink-2">Everything is stored only in this browser. Download a copy to keep it safe or move it to another device.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={download} className="btn btn-secondary">Download my data</button>
            <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-secondary">Restore from file…</button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ''; }} />
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Delete all your progress, reviews, answers, missions and stamps? Your settings and profile stay. This cannot be undone.')) {
                  await resetProgress();
                  setMessage('All progress was deleted.');
                }
              }}
              className="btn btn-quiet"
            >
              Reset progress…
            </button>
          </div>
          {message && <p role="status" className="text-sm text-ink">{message}</p>}
        </section>
      </div>
    </>
  );
}
