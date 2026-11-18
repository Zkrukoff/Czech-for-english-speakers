import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { CzechText } from '@/components/CzechText';
import { IconArrowLeft, IconSpeaker } from '@/components/icons';
import { ExerciseRunner } from '@/features/exercises/ExerciseRunner';
import { useLessonAnswerHandler } from '@/features/lessons/useLessonAnswerHandler';
import { useSettings } from '@/db/settings';
import { speech } from '@/lib/audio/speech';
import { isRecorded, playLine } from './playback';

/** One "Overheard in Prague" scene: listen, read (standard or spoken), translate, answer. */
export function ScenePage() {
  const { sceneId = '' } = useParams();
  const scene = course.overheard.find((s) => s.id === sceneId);
  const settings = useSettings();
  const [spoken, setSpoken] = useState(settings.showSpokenForms);
  const [showEn, setShowEn] = useState(true);
  const [playing, setPlaying] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<'idle' | 'running' | 'done'>('idle');
  const [score, setScore] = useState<string>('');
  const onAnswer = useLessonAnswerHandler();
  if (!scene) return <NotFound what="scene" />;
  const placeholder = !scene.lines.every(isRecorded);
  const hasSpoken = scene.lines.some((l) => l.spoken);

  async function playAll() {
    for (let i = 0; i < scene!.lines.length; i++) {
      setPlaying(i);
      await playLine(scene!.lines[i]!, spoken, settings.speechRate);
    }
    setPlaying(null);
  }

  return (
    <>
      <Link to="/sounds/overheard" className="inline-flex min-h-11 items-center gap-1 text-sm text-vltava hover:underline"><IconArrowLeft size={16} /> Overheard in Prague</Link>
      <PageHeader title={scene.title} cs={scene.titleCs} subtitle={scene.setting} />

      {placeholder && (
        <p role="note" className="mb-6 border-2 border-dashed border-ink bg-champagne-tint px-4 py-3 text-sm text-ink">
          <b>Placeholder voice.</b> These lines are read by your browser's synthetic Czech voice until native-speaker recordings are in. It reads
          spoken Czech in a textbook accent, so trust the transcript over the voice.
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={playing === null ? playAll : () => { speech.stop(); setPlaying(null); }}>
          <IconSpeaker size={18} /> {playing === null ? 'Play the scene' : 'Stop'}
        </button>
        {hasSpoken && (
          <div role="radiogroup" aria-label="Which Czech" className="inline-flex border-2 border-ink">
            {([false, true] as const).map((v) => (
              <button
                key={String(v)}
                type="button"
                role="radio"
                aria-checked={spoken === v}
                onClick={() => setSpoken(v)}
                className={`min-h-11 px-3 text-sm font-semibold ${spoken === v ? 'bg-ink text-paper' : 'bg-surface text-ink-2'}`}
              >
                {v ? <>Spoken · <span lang="cs">jak se mluví</span></> : <>Standard · <span lang="cs">spisovně</span></>}
              </button>
            ))}
          </div>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-5 w-5 accent-ink" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} /> English
        </label>
      </div>

      <ol className="space-y-3">
        {scene.lines.map((l, i) => (
          <li key={i} className={`border-2 bg-surface px-4 py-3 ${playing === i ? 'border-ink shadow-offset-sm' : 'border-rule-strong'}`}>
            <div className="flex items-start gap-3">
              <button
                type="button"
                aria-label={`Play: ${l.speaker}`}
                onClick={() => void playLine(l, spoken, settings.speechRate)}
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink hover:bg-paper-2"
              >
                <IconSpeaker size={16} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="label-board text-ink-3" lang="cs">{l.speaker}</p>
                <p lang="cs" className="text-lg text-ink">
                  {spoken && l.spoken ? l.spoken : <CzechText text={l.cs} />}
                </p>
                {showEn && <p className="text-sm text-ink-2">{l.en}</p>}
                {l.verified && (
                  <p className="mt-1 text-xs text-ink-3">
                    Official wording · <a href={l.verified.url} target="_blank" rel="noreferrer" className="underline">{new URL(l.verified.url).hostname}</a>, checked {l.verified.date}
                  </p>
                )}
                {l.unverifiedNote && <p className="mt-1 text-xs text-ink-3">{l.unverifiedNote}</p>}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {scene.note && (
        <p className="mt-6 max-w-2xl border-l-4 border-vltava bg-vltava-tint px-4 py-3 text-sm text-ink">
          <span className="label-board mr-2 text-ink-2">Dobré vědět</span>
          {scene.note}
        </p>
      )}

      <section aria-labelledby="q-h" className="mt-10">
        <h2 id="q-h" className="text-2xl font-extrabold">What did you catch?</h2>
        {quiz === 'running' ? (
          <div className="mt-4">
            <ExerciseRunner
              exercises={scene.questions}
              context="overheard"
              retryMissed={false}
              onAnswer={onAnswer}
              onFinish={(o) => {
                setScore(`${o.filter((x) => x.result.accepted).length} of ${o.length}`);
                setQuiz('done');
              }}
            />
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {quiz === 'done' && <p className="font-semibold">{score} right. <span lang="cs">Dobrý poslech.</span></p>}
            <button type="button" className="btn btn-secondary" onClick={() => setQuiz('running')}>{quiz === 'done' ? 'Again' : `${scene.questions.length} questions`}</button>
          </div>
        )}
      </section>
    </>
  );
}
