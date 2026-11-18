import type { ReactNode } from 'react';
import { fillAccepted } from '@/lib/exam/score';
import { ExamAudio, Transcript, EXAM_PLAYS } from './ExamAudio';
import { Pictogram, PICTOGRAMS } from './pictograms';
import type { ChoiceTask, FillTask, MatchTask } from './schema';
import { examAudioBase } from '@/lib/audio/ids';

const LETTERS = 'ABCDEFGH';

/**
 * A row of letter buttons. Unlike lesson choices, an exam answer can be
 * changed until the task is handed in. After that (`result`), the right
 * letter is shown in words, not colour alone.
 */
function Pick({ name, letters, value, onChange, right, done }: { name: string; letters: string[]; value?: string; onChange: (v: string) => void; right?: string; done: boolean }) {
  return (
    <div role="group" aria-label={name} className="flex flex-wrap gap-2">
      {letters.map((l) => {
        const chosen = value === l;
        const isRight = done && right === l;
        return (
          <button
            key={l}
            type="button"
            aria-pressed={chosen}
            disabled={done}
            onClick={() => onChange(l)}
            className={`min-h-11 min-w-11 rounded-md border-2 font-mono text-lg font-bold ${
              isRight ? 'border-ink bg-paper-2 text-ink' : chosen ? (done ? 'border-ink bg-surface text-ink line-through decoration-2' : 'border-ink bg-ink text-paper') : 'border-rule-strong bg-surface text-ink hover:border-ink'
            }`}
          >
            {l}
            {isRight && <span className="sr-only"> (right answer)</span>}
            {chosen && <span className="sr-only"> (your answer)</span>}
          </button>
        );
      })}
    </div>
  );
}

function Verdict({ ok, children }: { ok: boolean; children?: ReactNode }) {
  return (
    <p className="mt-2 text-sm">
      <span className="font-semibold">{ok ? 'Správně · Right.' : 'Not quite.'}</span> {children}
    </p>
  );
}

function ItemBox({ n, children }: { n: number | string; children: ReactNode }) {
  return (
    <li className="rounded-md border-2 border-rule bg-surface p-4">
      <div className="label-board mb-2 text-ink-3">{n}</div>
      {children}
    </li>
  );
}

export interface PlayerProps<R> {
  value: R;
  onChange: (v: R) => void;
  /** Handed in: show what was right. */
  done: boolean;
  /** Exam mode: recordings play only twice. */
  exam?: boolean;
}

export function MatchPlayer({ task, value, onChange, done, exam }: { task: MatchTask } & PlayerProps<Record<string, string>>) {
  const letters = task.options.map((o) => o.id);
  const pictureOptions = task.options.every((o) => o.picture);
  return (
    <div>
      {task.question && <p lang="cs" className="mb-3 text-lg font-semibold">{task.question}</p>}
      <h3 className="label-board mb-2 text-ink-3">Options · <span lang="cs">nabídka</span></h3>
      <ul className={pictureOptions ? 'mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6' : 'mb-6 grid gap-2 sm:grid-cols-2'}>
        {task.options.map((o) => (
          <li key={o.id} className="flex items-start gap-3 rounded-md border-2 border-rule bg-paper p-3">
            <span className="font-mono text-lg font-bold">{o.id}</span>
            {o.picture ? <Pictogram id={o.picture} size={56} label={`${o.id}: ${PICTOGRAMS[o.picture]?.en}`} /> : <span lang="cs">{o.text}</span>}
          </li>
        ))}
      </ul>
      <ol className="grid gap-3">
        {task.items.map((item, i) => {
          const right = task.answers[item.id]!;
          return (
            <ItemBox key={item.id} n={i + 1}>
              {item.picture && <Pictogram id={item.picture} size={72} label={`Picture ${i + 1}: ${PICTOGRAMS[item.picture]?.en}`} className="mb-3" />}
              {item.label && <p className="mb-2 font-semibold">{item.label}</p>}
              {item.text && <p lang="cs" className="mb-3">{item.text}</p>}
              {item.audio && <div className="mb-3"><ExamAudio lines={item.audio} idBase={examAudioBase(task.id, item.id)} limit={exam ? EXAM_PLAYS : undefined} /></div>}
              <Pick name={`Answer for ${i + 1}`} letters={letters} value={value[item.id]} onChange={(v) => onChange({ ...value, [item.id]: v })} right={right} done={done} />
              {done && (
                <>
                  <Verdict ok={value[item.id] === right}>The answer is {right}{pictureOptions ? '' : `: “${task.options.find((o) => o.id === right)?.text}”`}.</Verdict>
                  {item.audio && <Transcript lines={item.audio} />}
                </>
              )}
            </ItemBox>
          );
        })}
      </ol>
    </div>
  );
}

export function ChoicePlayer({ task, value, onChange, done, exam }: { task: ChoiceTask } & PlayerProps<(number | undefined)[]>) {
  return (
    <div>
      {task.text && <div lang="cs" className="mb-6 whitespace-pre-line rounded-md border-2 border-rule bg-paper p-4 leading-relaxed">{task.text}</div>}
      <ol className="grid gap-3">
        {task.questions.map((q, i) => {
          const chosen = value[i] === undefined ? undefined : LETTERS[value[i]!];
          return (
            <ItemBox key={i} n={i + 1}>
              {q.audio && <div className="mb-3"><ExamAudio lines={q.audio} idBase={examAudioBase(task.id, i + 1)} limit={exam ? EXAM_PLAYS : undefined} /></div>}
              {q.text && <p lang="cs" className="mb-2">{q.text.replace('___', '_______')}</p>}
              {q.q && <p lang="cs" className="mb-2 font-semibold">{q.q}</p>}
              <ul className="mb-3 grid gap-1">
                {q.options.map((o, k) => <li key={k} lang="cs"><span className="font-mono font-bold">{LETTERS[k]})</span> {o}</li>)}
              </ul>
              <Pick name={`Answer for ${i + 1}`} letters={['A', 'B', 'C', 'D']} value={chosen} onChange={(l) => { const next = [...value]; next[i] = LETTERS.indexOf(l); onChange(next); }} right={LETTERS[q.answer]} done={done} />
              {done && (
                <>
                  <Verdict ok={value[i] === q.answer}>The answer is {LETTERS[q.answer]}: “{q.options[q.answer]}”.</Verdict>
                  {q.audio && <Transcript lines={q.audio} />}
                </>
              )}
            </ItemBox>
          );
        })}
      </ol>
    </div>
  );
}

export function FillPlayer({ task, value, onChange, done, exam }: { task: FillTask } & PlayerProps<string[]>) {
  return (
    <div>
      {task.text && <div lang="cs" className="mb-6 whitespace-pre-line rounded-md border-2 border-rule bg-paper p-4 leading-relaxed">{task.text}</div>}
      {task.audio && <div className="mb-6"><ExamAudio lines={task.audio} idBase={examAudioBase(task.id, 'msg')} limit={exam ? EXAM_PLAYS : undefined} /></div>}
      <ol className="grid gap-3">
        {task.questions.map((q, i) => {
          const ok = fillAccepted(value[i] ?? '', q.answers);
          return (
            <ItemBox key={i} n={i + 1}>
              <label className="block">
                <span lang="cs" className="mb-2 block font-semibold">{q.q}</span>
                <input
                  lang="cs"
                  className="min-h-11 w-full rounded-md border-2 border-rule-strong bg-surface px-3 text-lg focus:border-ink"
                  value={value[i] ?? ''}
                  disabled={done}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => { const next = [...value]; next[i] = e.target.value; onChange(next); }}
                />
              </label>
              {done && <Verdict ok={ok}>{ok ? '' : `Accepted: ${q.answers.slice(0, 3).join(' · ')}.`}</Verdict>}
            </ItemBox>
          );
        })}
      </ol>
      {done && task.audio && (
        <details className="mt-4">
          <summary className="min-h-11 cursor-pointer py-2 text-vltava underline">The voicemail, written out</summary>
          <Transcript lines={task.audio} />
        </details>
      )}
    </div>
  );
}
