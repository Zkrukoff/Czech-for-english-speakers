import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { bestByTask, useExamAttempts } from '@/db/exam';
import { exam } from './examContent';
import { PART_INFO, PARTS, SPEAKING_OFFICIAL_MAX, SPEAKING_PASS, TASK_SHAPE, WRITTEN_MAX, WRITTEN_PASS, type Part } from './schema';

const OFFICIAL = {
  info: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/cs/informace-ke-zkousce/',
  mock: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/cs/priprava-na-zkousku/modelovy-test-novy-format/',
  register: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/cs/online-prihlaska/',
};

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" className="text-vltava underline">{children}<span className="sr-only"> (opens the official site in a new tab)</span></a>;
}

const pct = (score: number, max: number) => Math.round((100 * score) / max);

export function ExamHub() {
  const attempts = useExamAttempts() ?? [];
  const best = bestByTask(attempts.filter((a) => a.mode === 'practice' || a.mock));
  const typesOf = (part: Part) => Object.keys(TASK_SHAPE[part]).map(Number).filter((n) => exam.tasks.some((t) => t.part === part && t.task === n));

  return (
    <>
      <PageHeader title="The A2 exam" cs="Zkouška A2 pro trvalý pobyt" subtitle="Practice for the Czech exam for permanent residence, part by part, in the exam's own formats and timings. The tasks are ours, about Prague life; the official model test is linked below." />

      <section aria-labelledby="exam-format" className="mb-12">
        <h2 id="exam-format" className="label-board mb-3 text-ink-3">The exam, from 11 April 2026</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="py-2 pr-4">Part</th>
                <th scope="col" className="py-2 pr-4">Time</th>
                <th scope="col" className="py-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {PARTS.map((p) => (
                <tr key={p} className="border-b border-rule">
                  <th scope="row" className="py-2 pr-4 font-semibold">{PART_INFO[p].en} · <span lang="cs" className="font-normal text-ink-2">{PART_INFO[p].cs}</span></th>
                  <td className="py-2 pr-4">{p === 'listening' ? 'about 40 min' : p === 'speaking' ? 'about 15 min' : `${PART_INFO[p].minutes} min`}</td>
                  <td className="py-2">{p === 'speaking' ? SPEAKING_OFFICIAL_MAX : PART_INFO[p].points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 max-w-2xl list-disc space-y-1 pl-5 text-ink-2">
          <li><strong className="text-ink">To pass</strong> you need {WRITTEN_PASS} of {WRITTEN_MAX} in reading, writing and listening together, <strong className="text-ink">and</strong> {SPEAKING_PASS} of {SPEAKING_OFFICIAL_MAX} in speaking. Fail either and you resit the whole exam.</li>
          <li>Reading and listening are scored here automatically. Writing and speaking you score yourself, with a model answer and a checklist: the app doesn't pretend to grade free Czech.</li>
          <li>The four speaking tasks add up to 37 points. The official total is 40, and the model test doesn't say where the other 3 come from, so we practise the 37.</li>
          <li>Checked against NPI ČR's online model test and exam page on 18 November 2026.</li>
        </ul>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <Ext href={OFFICIAL.mock}>Official model test (new format)</Ext>
          <Ext href={OFFICIAL.info}>Exam information and dates</Ext>
          <Ext href={OFFICIAL.register}>Register for the exam</Ext>
        </p>
      </section>

      <section aria-labelledby="exam-close" className="mb-12">
        <h2 id="exam-close" className="label-board mb-3 text-ink-3">How close am I?</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PARTS.filter((p) => typesOf(p).length).map((p) => {
            const types = typesOf(p);
            const tried = types.filter((n) => exam.tasks.some((t) => t.part === p && t.task === n && best.has(t.id)));
            // Average over the types tried only: an untried type is unknown, not 0%.
            const scores = tried.map((n) => Math.max(...exam.tasks.filter((t) => t.part === p && t.task === n && best.has(t.id)).map((t) => pct(best.get(t.id)!.score, best.get(t.id)!.max))));
            const avg = tried.length ? Math.round(scores.reduce((a, b) => a + b, 0) / tried.length) : undefined;
            return (
              <li key={p} className="rounded-md border-2 border-rule bg-surface p-4">
                <p className="font-semibold">{PART_INFO[p].en}</p>
                <p className="text-ink-2">{tried.length} of {types.length} task types tried{avg !== undefined && <>; your best on those averages <strong className="text-ink">{avg}%</strong></>}.</p>
                {avg !== undefined && <p className="mt-1 text-sm text-ink-2">{avg >= 80 ? 'Strong. The exam needs 60% overall.' : avg >= 60 ? 'Around the pass line (60%). Keep practising.' : 'Below the pass line (60%) so far.'}{p === 'writing' || p === 'speaking' ? ' Self-assessed.' : ''}</p>}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="exam-practice" className="mb-12">
        <h2 id="exam-practice" className="label-board mb-3 text-ink-3">Practise task by task</h2>
        {PARTS.filter((p) => typesOf(p).length).map((p) => (
          <div key={p} className="mb-8">
            <h3 className="mb-3 text-2xl font-bold">{PART_INFO[p].en} · <span lang="cs" className="text-ink-3">{PART_INFO[p].cs}</span></h3>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {typesOf(p).map((n) => {
                const shape = TASK_SHAPE[p][n]!;
                const sets = exam.tasks.filter((t) => t.part === p && t.task === n && t.use.startsWith('practice'));
                return (
                  <li key={n} className="border-b-2 border-rule py-3">
                    <p className="font-semibold">{n}. {shape.en} <span className="font-normal text-ink-3">· {shape.points} points</span></p>
                    <p className="flex flex-wrap gap-2 pt-2">
                      {sets.map((t, i) => {
                        const b = best.get(t.id);
                        return (
                          <Link key={t.id} to={`/exam/practice/${t.id}`} className="btn btn-secondary text-sm">
                            Set {i + 1}{b && <span className="font-normal text-ink-2"> · {b.score}/{b.max}</span>}
                          </Link>
                        );
                      })}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
