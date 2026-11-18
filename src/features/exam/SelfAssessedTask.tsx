import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconMic } from '@/components/icons';
import { SpeakButton } from '@/components/SpeakButton';
import { ComputerVoice } from '@/components/ListenButton';
import { speech } from '@/lib/audio/speech';
import { useHasCzechVoice } from '@/lib/audio/useCzechVoice';
import { useSettings } from '@/db/settings';
import { emailMeetsMinimum, formAnswerMeetsMinimum, wordCount } from '@/lib/exam/score';
import { Pictogram, PICTOGRAMS } from './pictograms';
import { TASK_SHAPE, WORD_MIN, type AgreeTask, type EmailTask, type ExamTask, type FormTask, type InterviewTask, type RoleplayTask, type StoryTask } from './schema';
import { TimerBadge, useCountdown } from './useCountdown';
import { useRecorder } from './useRecorder';
import { PastWarmup } from './PastWarmup';

type SelfTask = FormTask | EmailTask | InterviewTask | RoleplayTask | StoryTask | AgreeTask;

export interface SelfProps {
  task: ExamTask;
  /** Exam mode: speaking runs on the exam's timers. */
  exam?: boolean;
  /** A mock exam's part timer ran out: hand in now. */
  forceHandIn?: boolean;
  onDone: (score: number, max: number) => void;
}

/** Writing and speaking: done for real, then scored by the learner against a model and a checklist. */
export function SelfAssessedTask({ task, exam = false, forceHandIn, onDone }: SelfProps) {
  const t = task as SelfTask;
  if (t.kind === 'form' || t.kind === 'email') return <WritingTask task={t} exam={exam} forceHandIn={forceHandIn} onDone={onDone} />;
  return <SpeakingTask task={t} exam={exam} onDone={onDone} />;
}

// ---------------------------------------------------------------- scoring

function SelfScore({ max, checks, fixed, onDone }: { max: number; checks: string[]; fixed?: { score: number; why: string }; onDone: (score: number) => void }) {
  const [ticked, setTicked] = useState<boolean[]>(() => checks.map(() => false));
  const suggested = Math.round((max * ticked.filter(Boolean).length) / checks.length);
  const [score, setScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const value = fixed ? fixed.score : score ?? suggested;
  return (
    <section aria-labelledby="self-score" className="mt-8 rounded-md border-2 border-ink bg-surface p-4">
      <h3 id="self-score" className="text-xl font-bold">Score it yourself</h3>
      <p className="mt-1 text-sm text-ink-2">Compare yours with the model. The app doesn't grade free Czech: an examiner would, and we can't do that reliably.</p>
      {fixed ? (
        <p className="mt-3 font-semibold">{fixed.why}</p>
      ) : (
        <>
          <fieldset className="mt-3">
            <legend className="sr-only">Checklist</legend>
            {checks.map((c, i) => (
              <label key={i} className="flex min-h-11 items-start gap-3 py-1">
                <input type="checkbox" className="mt-1 size-5 shrink-0" checked={ticked[i]} disabled={saved} onChange={(e) => setTicked((t) => t.map((x, k) => (k === i ? e.target.checked : x)))} />
                <span>{c}</span>
              </label>
            ))}
          </fieldset>
          <label className="mt-3 flex flex-wrap items-center gap-3">
            <span>Your points</span>
            <select className="min-h-11 rounded-md border-2 border-rule-strong bg-surface px-2" value={value} disabled={saved} onChange={(e) => setScore(+e.target.value)}>
              {Array.from({ length: max + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}
            </select>
            <span className="text-sm text-ink-2">of {max} (from your checklist: {suggested})</span>
          </label>
        </>
      )}
      <div className="mt-4" aria-live="polite">
        {saved ? <p className="font-semibold">Saved: {value} of {max}, self-assessed.</p> : <button type="button" className="btn btn-primary" onClick={() => { setSaved(true); onDone(value); }}>Save my score</button>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- writing

function WordCount({ text, min }: { text: string; min: number }) {
  const n = wordCount(text);
  return <span className={`text-sm ${n >= min ? 'text-ink-2' : 'font-semibold text-ink'}`} aria-live="off">{n} {n === 1 ? 'word' : 'words'} · minimum {min}</span>;
}

function WritingTask({ task, exam, forceHandIn, onDone }: { task: FormTask | EmailTask; exam: boolean; forceHandIn?: boolean; onDone: SelfProps['onDone'] }) {
  const max = TASK_SHAPE.writing[task.task]!.points;
  const [texts, setTexts] = useState<string[]>(() => (task.kind === 'form' ? task.questions.map(() => '') : ['']));
  const [handedIn, setHandedIn] = useState(false);
  const [timed, setTimed] = useState(false);
  const left = useCountdown(25 * 60, timed && !handedIn, () => setHandedIn(true));
  useEffect(() => { if (forceHandIn) setHandedIn(true); }, [forceHandIn]);
  const set = (i: number, v: string) => setTexts((t) => t.map((x, k) => (k === i ? v : x)));
  const field = 'w-full rounded-md border-2 border-rule-strong bg-surface p-3 text-lg focus:border-ink';

  return (
    <div>
      <p lang="cs" className="text-lg font-semibold">{task.situation}</p>
      <p className="mt-1 text-ink-2">{task.situationEn}</p>
      {task.kind === 'form' ? (
        <p className="mt-3 text-ink-2">Answer in full sentences, at least {WORD_MIN.formAnswer} words each. <span lang="cs">Odpovídejte celou větou!</span></p>
      ) : (
        <p className="mt-3 text-ink-2">At least {WORD_MIN.email} words, or the e-mail scores 0. Write one sentence for each picture. <span lang="cs">Musíte reagovat na každý obrázek.</span></p>
      )}
      {!exam && !handedIn && (
        <p className="mt-3">
          {timed ? <TimerBadge seconds={left} label="Writing" /> : <button type="button" className="btn btn-secondary text-sm" onClick={() => setTimed(true)}>Start the 25-minute exam timer</button>}
        </p>
      )}

      {task.kind === 'form' ? (
        <div className="mt-6 rounded-md border-2 border-rule bg-paper p-4">
          <h3 lang="cs" className="mb-4 font-bold">{task.heading}</h3>
          {task.questions.map((q, i) => (
            <label key={i} className="mb-5 block">
              <span lang="cs" className="mb-2 block font-semibold">{i + 1}. {q.q}</span>
              <textarea lang="cs" rows={2} className={field} value={texts[i]} disabled={handedIn} onChange={(e) => set(i, e.target.value)} />
              <WordCount text={texts[i]!} min={WORD_MIN.formAnswer} />
            </label>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <ol className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {task.prompts.map((p, i) => (
              <li key={i} className="flex flex-col items-center gap-2 rounded-md border-2 border-rule bg-paper p-3 text-center">
                <Pictogram id={p.picture} size={48} />
                <span lang="cs" className="text-sm font-semibold">{i + 1}. {p.cs}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-md border-2 border-rule bg-paper p-4">
            <p className="text-sm"><span className="text-ink-3">Komu · To:</span> {task.to}</p>
            <p className="mb-3 text-sm"><span className="text-ink-3">Předmět · Subject:</span> <span lang="cs">{task.subject}</span></p>
            <label className="block">
              <span className="sr-only">Your e-mail</span>
              <textarea lang="cs" rows={9} className={field} value={texts[0]} disabled={handedIn} onChange={(e) => set(0, e.target.value)} />
            </label>
            <WordCount text={texts[0]!} min={WORD_MIN.email} />
          </div>
        </div>
      )}

      {!handedIn ? (
        !exam && <button type="button" className="btn btn-primary mt-6" onClick={() => setHandedIn(true)}>Hand in and see a model answer</button>
      ) : (
        <>
          <section aria-labelledby="w-model" className="mt-8">
            <h3 id="w-model" className="text-xl font-bold">A model answer</h3>
            <p className="text-sm text-ink-2">One good answer among many. Yours doesn't need to match it.</p>
            {task.kind === 'form' ? (
              <ol className="mt-3 space-y-3">
                {task.questions.map((q, i) => (
                  <li key={i}>
                    <p lang="cs" className="font-semibold">{q.q}</p>
                    <p lang="cs" className="border-l-4 border-rule pl-3">{q.model} <span className="text-sm text-ink-3">({wordCount(q.model)} words)</span></p>
                  </li>
                ))}
              </ol>
            ) : (
              <p lang="cs" className="mt-3 whitespace-pre-line border-l-4 border-rule pl-3">{task.model}</p>
            )}
          </section>
          {task.kind === 'form' ? (
            <SelfScore
              max={max}
              checks={[
                `At least ${WORD_MIN.formAnswer} words for each question (${texts.filter(formAnswerMeetsMinimum).length} of 3 are)`,
                'Full sentences, not single words',
                'Each answer says what was asked',
                'Endings and diacritics checked',
              ]}
              onDone={(s) => onDone(s, max)}
            />
          ) : (
            <SelfScore
              max={max}
              fixed={emailMeetsMinimum(texts[0]!) ? undefined : { score: 0, why: `${wordCount(texts[0]!)} words: under ${WORD_MIN.email}, so the exam scores this e-mail 0, whatever it says.` }}
              checks={[...task.prompts.map((p) => `I answered: ${p.cs}`), 'A greeting and a sign-off (Dobrý den … S pozdravem)']}
              onDone={(s) => onDone(s, max)}
            />
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- speaking

interface Step {
  /** What's shown while answering. */
  show: ReactNode;
  /** Czech the examiner says first (spoken by the computer voice). */
  say?: string;
  /** Plain text of the step, for the review. */
  label: string;
  model: ReactNode;
}

function stepsFor(task: InterviewTask | RoleplayTask | StoryTask | AgreeTask): Step[] {
  switch (task.kind) {
    case 'interview':
      return task.topics.flatMap((tp) => tp.questions.map((q, i) => ({
        show: <p className="label-board text-ink-3">Téma · topic: <span lang="cs">{tp.topic}</span> ({tp.topicEn}) · {i + 1} of 4</p>,
        say: q.q,
        label: q.q,
        model: <span lang="cs">{q.model}</span>,
      })));
    case 'roleplay':
      return task.cards.map((c, n) => ({
        show: (
          <div>
            <p lang="cs" className="font-semibold">{c.situation}</p>
            <p className="text-ink-2">{c.situationEn}</p>
            <div className="mt-3 rounded-md border-2 border-ink bg-paper p-4">
              <p className="label-board mb-2 text-ink-3">Karta {n + 1} · Zeptejte se na 4 informace</p>
              <ul lang="cs" className="list-disc pl-5 text-lg">{c.cues.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </div>
          </div>
        ),
        label: `Card ${n + 1}: ${c.situationEn}`,
        model: (
          <div lang="cs" className="space-y-1">
            {c.model.map((m, i) => <p key={i}><span className="font-semibold">{m.who === 'you' ? 'Vy' : 'Tazatel'}:</span> {m.cs}</p>)}
          </div>
        ),
      }));
    case 'story':
      return [{
        show: (
          <div>
            <p lang="cs" className="text-lg font-semibold">{task.heading}</p>
            <p lang="cs">{task.question}</p>
            <ol className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {task.panels.map((p, i) => (
                <li key={i} className="flex flex-col items-center rounded-md border-2 border-ink bg-paper p-3">
                  <span className="label-board self-start text-ink-3">{i + 1}</span>
                  <Pictogram id={p} size={72} label={`Picture ${i + 1}: ${task.panelsAlt[i] ?? PICTOGRAMS[p]?.en}`} />
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-ink-2">Use all four pictures, in the past tense. <span lang="cs">Mluvte v minulém čase.</span></p>
          </div>
        ),
        label: task.question,
        model: <p lang="cs">{task.model}</p>,
      }];
    case 'agree':
      return task.turns.map((t, i) => ({
        show: (
          <div>
            {i === 0 && <p lang="cs" className="font-semibold">{task.situation}</p>}
            {i === 0 && <p className="text-ink-2">{task.situationEn} You're friends, so use <strong>ty</strong>. <span lang="cs">Budete si tykat.</span></p>}
            <ul className="mt-3 grid grid-cols-3 gap-3">
              {task.options.map((o) => (
                <li key={o.picture} className="flex flex-col items-center gap-1 rounded-md border-2 border-rule bg-paper p-3 text-center text-sm">
                  <Pictogram id={o.picture} size={56} />
                  {o.en}
                </li>
              ))}
            </ul>
            <p className="label-board mt-3 text-ink-3">Turn {i + 1} of {task.turns.length}</p>
          </div>
        ),
        say: t.friend,
        label: t.friend,
        model: <span lang="cs">{t.model}</span>,
      }));
  }
}

const CHECKS: Record<string, string[]> = {
  interview: ['I answered every question', 'In full sentences', 'Within 7 seconds each', 'With the right verb forms (bydlím, pracuju, mám…)'],
  roleplay: ['I asked about all 4 points on each card', 'They were real questions (Máte…? Kolik…? Kdy…?)', 'I added my own fourth question', 'I greeted and thanked (Dobrý den, děkuju)'],
  story: ['I used all four pictures', 'In the past tense', 'For about a minute', 'Joining the events (pak, potom, ale, proto)'],
  agree: ['We agreed on one thing', 'I said why', 'I used ty, not vy', 'I answered each time, in full sentences'],
};

/** One answer: hear the question, record, move on. Exam mode runs the clock. */
function SpeakStep({ step, seconds, exam, onDone }: { step: Step; seconds: number; exam: boolean; onDone: (url?: string) => void }) {
  const settings = useSettings();
  const hasVoice = useHasCzechVoice();
  const rec = useRecorder();
  const [phase, setPhase] = useState<'ready' | 'asking' | 'answering'>('ready');
  const [showText, setShowText] = useState(!hasVoice);
  const finished = useRef(false);
  const started = useRef(false);
  const left = useCountdown(seconds, phase === 'answering' && exam, () => void finish());

  async function finish() {
    if (finished.current) return;
    finished.current = true;
    onDone(await rec.stop());
  }
  async function begin() {
    if (started.current) return;
    started.current = true;
    if (step.say && hasVoice) {
      setPhase('asking');
      // Whatever the speech engine does, carry on to the answer.
      await speech.speak(step.say, { rate: settings.speechRate, voiceURI: settings.voiceURI }).catch(() => undefined);
    }
    setPhase('answering');
    await rec.start();
  }
  // Exam mode starts each step on its own, like the real recording does.
  useEffect(() => { if (exam) void begin(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="rounded-md border-2 border-ink bg-surface p-4">
      {step.show}
      {step.say && (
        <div className="mt-3">
          {(showText || !hasVoice) ? <p lang="cs" className="text-xl font-semibold">{step.say}</p> : !exam && (
            <button type="button" className="btn btn-quiet min-h-11 px-0 text-sm underline" onClick={() => setShowText(true)}>Show the question (the exam doesn't)</button>
          )}
          {hasVoice ? (!exam && phase === 'ready' && <span className="mt-1 flex flex-wrap items-center gap-2"><SpeakButton text={step.say} label="Hear the question again" /> <ComputerVoice /></span>)
            : <p className="text-sm text-ink-2">No Czech voice on this device, so the question is shown instead of spoken.</p>}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3" aria-live="polite">
        {phase === 'asking' && <span>Listen… <span lang="cs">Poslouchejte.</span></span>}
        {phase === 'ready' && (
          <button type="button" className="btn btn-primary" onClick={() => void begin()}>
            <IconMic size={18} /> {step.say && hasVoice ? 'Hear it and answer' : 'Start answering'}
          </button>
        )}
        {phase === 'answering' && (
          <>
            <span className="font-semibold">{rec.state === 'recording' ? 'Recording. Answer aloud now.' : 'Answer aloud now.'}</span>
            {exam && <TimerBadge seconds={left} label="Time" />}
            <button type="button" className="btn btn-secondary" onClick={() => void finish()}>{exam ? 'Done' : 'Stop'}</button>
          </>
        )}
      </div>
      {(rec.state === 'unsupported' || rec.state === 'denied') && (
        <p className="mt-2 text-sm text-ink-2">{rec.state === 'denied' ? 'No microphone access, so nothing is recorded.' : "This browser can't record."} Answer aloud anyway: the timing is the practice.</p>
      )}
      {phase === 'ready' && !exam && <p className="mt-2 text-sm text-ink-2">Practice mode: no time limit. The exam gives you {seconds < 60 ? `${seconds} seconds` : seconds === 60 ? '1 minute' : `${seconds} seconds`}.</p>}
    </div>
  );
}

function SpeakingTask({ task, exam, onDone }: { task: InterviewTask | RoleplayTask | StoryTask | AgreeTask; exam: boolean; onDone: SelfProps['onDone'] }) {
  const shape = TASK_SHAPE.speaking[task.task]!;
  const steps = stepsFor(task);
  const [warm, setWarm] = useState(task.kind !== 'story' || exam);
  const [at, setAt] = useState(-1);
  const [recs, setRecs] = useState<(string | undefined)[]>([]);
  const done = at >= steps.length;
  // The recordings live until the learner leaves the task.
  const recsRef = useRef(recs);
  recsRef.current = recs;
  useEffect(() => () => recsRef.current.forEach((u) => u && URL.revokeObjectURL(u)), []);

  if (!warm) {
    return (
      <div>
        <p className="mb-4">The story has to be in the past tense. A quick warm-up first, or <Link to="/verbs/past" className="text-vltava underline">read how the past tense works</Link>.</p>
        <PastWarmup onFinish={() => setWarm(true)} />
        <button type="button" className="btn btn-quiet mt-4" onClick={() => setWarm(true)}>Skip the warm-up</button>
      </div>
    );
  }

  return (
    <div>
      {at < 0 && (
        <div className="mb-6">
          <p>{task.kind === 'interview' && 'Eight questions on two topics. The questions are spoken, not shown, and you have 7 seconds for each answer.'}
            {task.kind === 'roleplay' && 'Two cards. Ask the examiner about the four points on each card; the last question is your own. 90 seconds per card.'}
            {task.kind === 'story' && 'Tell the story in the four pictures, in the past tense. You have 1 minute.'}
            {task.kind === 'agree' && 'Your friend suggests things to do; agree on one of the three pictures and say why. You have 15 seconds per answer.'}
          </p>
          <p className="mt-2 text-sm text-ink-2">Your recordings stay on this page only: they're never uploaded or saved.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => setAt(0)}>Start</button>
        </div>
      )}
      {at >= 0 && !done && (
        <SpeakStep key={at} step={steps[at]!} seconds={shape.seconds!} exam={exam} onDone={(url) => { setRecs((r) => [...r, url]); setAt((n) => n + 1); }} />
      )}
      {done && (
        <>
          <section aria-labelledby="s-review" className="mt-2">
            <h3 id="s-review" className="text-xl font-bold">Yours and a model answer</h3>
            <ol className="mt-3 space-y-4">
              {steps.map((s, i) => (
                <li key={i} className="border-b-2 border-rule pb-4">
                  <p lang={s.say ? 'cs' : undefined} className="font-semibold">{i + 1}. {s.label}</p>
                  {recs[i] ? <audio controls src={recs[i]} className="mt-2 w-full max-w-md"><track kind="captions" /></audio> : <p className="text-sm text-ink-3">(not recorded)</p>}
                  <div className="mt-2 border-l-4 border-rule pl-3">{s.model}</div>
                </li>
              ))}
            </ol>
          </section>
          <SelfScore max={shape.points} checks={CHECKS[task.kind]!} onDone={(s) => onDone(s, shape.points)} />
        </>
      )}
    </div>
  );
}
