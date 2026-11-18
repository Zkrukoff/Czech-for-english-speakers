import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { saveExamAttempt } from '@/db/exam';
import { neededSentence } from '@/lib/exam/score';
import { exam } from './examContent';
import { mockTasks } from './content';
import { PART_INFO, SPEAKING_OFFICIAL_MAX, SPEAKING_PASS, TASK_SHAPE, WRITTEN_MAX, WRITTEN_PASS, type ExamTask, type Part } from './schema';
import { isAutoScored, ScoredTask } from './ScoredTask';
import { SelfAssessedTask } from './SelfAssessedTask';
import { TimerBadge, useCountdown } from './useCountdown';

const ORDER: Part[] = ['reading', 'writing', 'listening', 'speaking'];
type Scores = Record<string, { score: number; max: number; self: boolean }>;

/** A whole mock exam, in the real order and timings. Each part is handed in once, then checked. */
export function MockExamPage() {
  const { mockId = '' } = useParams();
  const [stage, setStage] = useState(-1);
  const [run] = useState(() => Date.now());
  const [scores, setScores] = useState<Scores>({});
  if (mockId !== 'mock1' && mockId !== 'mock2') return <NotFound />;
  const tasks = mockTasks(exam, mockId);
  const n = mockId === 'mock1' ? 1 : 2;

  const record = (t: ExamTask, score: number, max: number, self: boolean) => {
    setScores((s) => (s[t.id] ? s : { ...s, [t.id]: { score, max, self } }));
    void saveExamAttempt({ taskId: t.id, part: t.part, task: t.task, mode: 'exam', mock: mockId, run, score, max, selfAssessed: self, at: Date.now() });
  };
  const part = ORDER[stage];
  const next = () => { setStage((s) => s + 1); window.scrollTo(0, 0); };

  return (
    <>
      <PageHeader
        eyebrow={<Link to="/exam" className="underline">Exam · <span lang="cs">Zkouška A2</span></Link>}
        title={`Mock exam ${n}`}
        cs={`Modelová zkouška ${n}`}
        subtitle={part ? `${PART_INFO[part].en} · ${PART_INFO[part].cs}: part ${stage + 1} of 4` : stage < 0 ? 'The whole exam, in the real order and timings. Set aside about two hours.' : 'Results'}
      />
      {stage < 0 && <Intro onStart={next} />}
      {part && (
        <PartRunner
          key={part}
          part={part}
          tasks={tasks.filter((t) => t.part === part)}
          onTaskDone={record}
          onNext={next}
          last={stage === ORDER.length - 1}
        />
      )}
      {stage >= ORDER.length && <Results tasks={tasks} scores={scores} />}
    </>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-2xl space-y-3 text-lg">
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>Reading,</strong> 40 minutes. When the time's up, your answers are handed in.</li>
        <li><strong>Writing,</strong> 25 minutes, then a short break.</li>
        <li><strong>Listening,</strong> about 40 minutes. Each recording plays twice, no more.</li>
        <li><strong>Speaking,</strong> about 15 minutes, on the exam's timers: 7 seconds per answer, 90 seconds per card, a minute for the story, 15 seconds per turn.</li>
      </ul>
      <p className="text-base text-ink-2">Each part is checked when you hand it in, so you see what was right as you go. You can't go back to a part. Leaving this page ends the mock; what you've handed in is kept.</p>
      <p className="text-base text-ink-2">Speaking needs a microphone (recordings stay on this device) and works best with a Czech computer voice. Without one the questions are shown instead.</p>
      <button type="button" className="btn btn-primary mt-2" onClick={onStart}>Start the mock exam</button>
    </div>
  );
}

function PartRunner({ part, tasks, onTaskDone, onNext, last }: { part: Part; tasks: ExamTask[]; onTaskDone: (t: ExamTask, s: number, m: number, self: boolean) => void; onNext: () => void; last: boolean }) {
  const timed = part === 'reading' || part === 'writing';
  const [handedIn, setHandedIn] = useState(false);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [speakAt, setSpeakAt] = useState(0);
  const left = useCountdown(PART_INFO[part].minutes * 60, timed && !handedIn, () => setHandedIn(true));
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => { if (handedIn) top.current?.focus(); }, [handedIn]);
  const done = (t: ExamTask) => (s: number, m: number) => {
    onTaskDone(t, s, m, !isAutoScored(t));
    setDoneIds((d) => new Set(d).add(t.id));
  };
  const allDone = tasks.every((t) => doneIds.has(t.id));

  if (part === 'speaking') {
    const t = tasks[speakAt];
    return (
      <div>
        {t ? (
          <>
            <h2 className="mb-4 text-2xl font-bold">Task {t.task}: {TASK_SHAPE.speaking[t.task]!.en} <span lang="cs" className="text-ink-3">· {TASK_SHAPE.speaking[t.task]!.cs}</span></h2>
            <SelfAssessedTask key={t.id} task={t} exam onDone={(s, m) => { done(t)(s, m); }} />
            {doneIds.has(t.id) && <button type="button" className="btn btn-primary mt-6" onClick={() => (speakAt + 1 < tasks.length ? setSpeakAt(speakAt + 1) : onNext())}>{speakAt + 1 < tasks.length ? 'Next speaking task' : 'See my results'}</button>}
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div ref={top} tabIndex={-1} className="sticky top-0 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b-2 border-rule bg-paper px-4 py-2 outline-none">
        {timed && !handedIn && <TimerBadge seconds={left} label={PART_INFO[part].en} />}
        {part === 'listening' && !handedIn && <span className="text-sm text-ink-2">Each recording plays twice. In the exam you also get a minute (or 15 seconds) to read each task first.</span>}
        {handedIn && <span className="font-semibold">Handed in.{part === 'writing' && !allDone ? ' Now score both tasks yourself.' : ''}</span>}
      </div>
      {tasks.map((t) => (
        <section key={t.id} aria-labelledby={`h-${t.id}`} className="mb-12">
          <h2 id={`h-${t.id}`} className="mb-4 text-2xl font-bold">Task {t.task}: {TASK_SHAPE[part][t.task]!.en} <span className="text-base font-normal text-ink-3">· {TASK_SHAPE[part][t.task]!.points} points</span></h2>
          {isAutoScored(t)
            ? <ScoredTask task={t} exam partHandIn forceHandIn={handedIn} onHandIn={done(t)} />
            : <SelfAssessedTask task={t} exam forceHandIn={handedIn} onDone={done(t)} />}
        </section>
      ))}
      {!handedIn ? (
        <button type="button" className="btn btn-primary" onClick={() => setHandedIn(true)}>Hand in {PART_INFO[part].en.toLowerCase()}</button>
      ) : (
        <button type="button" className="btn btn-primary" disabled={!allDone} onClick={onNext}>{last ? 'See my results' : `Go on to ${PART_INFO[ORDER[ORDER.indexOf(part) + 1]!].en.toLowerCase()}`}</button>
      )}
      {handedIn && !allDone && <p className="mt-2 text-sm text-ink-2">Save your score for each writing task first.</p>}
    </div>
  );
}

function Results({ tasks, scores }: { tasks: ExamTask[]; scores: Scores }) {
  const sum = (p: Part) => tasks.filter((t) => t.part === p).reduce((a, t) => a + (scores[t.id]?.score ?? 0), 0);
  const rl = sum('reading') + sum('listening');
  const written = rl + sum('writing');
  const speaking = sum('speaking');
  return (
    <div className="max-w-2xl">
      <table className="w-full border-collapse text-left text-lg">
        <thead><tr className="border-b-2 border-ink"><th scope="col" className="py-2">Part</th><th scope="col" className="py-2">Score</th><th scope="col" className="py-2">How</th></tr></thead>
        <tbody>
          {ORDER.map((p) => (
            <tr key={p} className="border-b border-rule">
              <th scope="row" className="py-2 font-semibold">{PART_INFO[p].en}</th>
              <td className="py-2 tabular-nums">{sum(p)} / {PART_INFO[p].points}</td>
              <td className="py-2 text-ink-2">{p === 'reading' || p === 'listening' ? 'scored by the app' : 'your own score'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-8 space-y-4">
        <p><strong>Reading and listening:</strong> {neededSentence(rl)}</p>
        <p><strong>The written parts together:</strong> {written} of {WRITTEN_MAX}, counting your own writing score. The pass line is {WRITTEN_PASS}: {written >= WRITTEN_PASS ? 'that would pass, if your writing score is fair.' : 'that would be short of it.'}</p>
        <p><strong>Speaking:</strong> {speaking} of the 37 points we can practise. The real exam is out of {SPEAKING_OFFICIAL_MAX} and needs {SPEAKING_PASS}. Your score is your own judgement, so treat it as a rough guide.</p>
        <p className="text-ink-2">This is practice with our own tasks, not the official test. For the real thing, also try NPI ČR's model test, linked on the exam page.</p>
      </div>
      <p className="mt-8 flex flex-wrap gap-3">
        <Link to="/exam" className="btn btn-primary">Back to the exam page</Link>
      </p>
    </div>
  );
}
