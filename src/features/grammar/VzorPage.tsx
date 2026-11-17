import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { course } from '@/content';
import type { Gender } from '@/content/schema';
import { NotFound } from '@/components/NotFound';
import { PageHeader } from '@/components/PageHeader';
import { FormTableView } from '@/components/FormTableView';
import { GenderMark } from '@/components/GenderMark';
import { SectionNumber } from '@/components/ui';
import { ExerciseRunner } from '@/features/exercises/ExerciseRunner';
import { scheduleAnswer } from '@/db/srs';
import { vzorSession } from '@/lib/drills/vzor';
import { compareCs } from '@/lib/text';
import { IconArrowLeft } from '@/components/icons';

const GENDER_OF: Record<string, Gender> = {
  'noun-pan': 'm-anim', 'noun-muz': 'm-anim', 'noun-predseda': 'm-anim', 'noun-soudce': 'm-anim',
  'noun-hrad': 'm-inan', 'noun-stroj': 'm-inan',
  'noun-zena': 'f', 'noun-ruze': 'f', 'noun-pisen': 'f', 'noun-kost': 'f',
  'noun-mesto': 'n', 'noun-more': 'n', 'noun-kure': 'n', 'noun-staveni': 'n',
};
export const VZORY = Object.keys(GENDER_OF);
export const vzorGender = (id: string) => GENDER_OF[id];

/** One model noun: its table, the course nouns that follow it, and a drill across the cases. */
export function VzorPage() {
  const { vzorId = '' } = useParams();
  const table = course.tables.get(vzorId);
  const [run, setRun] = useState<number | null>(null);
  const [done, setDone] = useState<{ right: number; total: number } | null>(null);
  if (!table || !GENDER_OF[vzorId]) return <NotFound what="pattern" />;
  const nouns = [...course.lexicon.values()].filter((e) => e.noun.vzor === vzorId).sort((a, b) => compareCs(a.noun.lemma, b.noun.lemma));
  const session = run === null ? [] : vzorSession(vzorId, course.lexicon, 10, run);
  const keyOf = new Map(session.map((x) => [x.exercise, x.key]));

  return (
    <>
      <Link to="/grammar" className="inline-flex items-center gap-1 text-sm text-vltava hover:underline"><IconArrowLeft size={16} /> Mluvnice</Link>
      <PageHeader eyebrow="Vzor · model noun" title={table.title} subtitle={`${table.subtitle ?? ''}. Every noun below declines like ${table.title}: learn one, and you have them all.`}>
        <div className="mt-3"><GenderMark gender={GENDER_OF[vzorId]!} /></div>
      </PageHeader>
      <FormTableView table={table} />

      <section aria-labelledby="nouns-h" className="mt-10">
        <SectionNumber n={1} id="nouns-h">Nouns in the course like {table.title}</SectionNumber>
        {nouns.length === 0 ? (
          <p className="mt-3 text-ink-2"><span lang="cs">Tady zatím nic není.</span> No course nouns follow this pattern yet.</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2" lang="cs">
            {nouns.map(({ noun }) => (
              <li key={noun.lemma} className="chip normal-case tracking-normal" title={noun.en}>
                <span className="font-ui text-base">{noun.lemma}</span>
                {noun.uncertain && <span className="text-ink-3" title="Some forms not yet checked">?</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {nouns.length > 0 && (
        <section aria-labelledby="drill-h" className="mt-12">
          <SectionNumber n={2} id="drill-h">Drill the pattern</SectionNumber>
          <p className="mt-3 max-w-2xl text-ink-2">Ten questions across the cases, singular and plural, on these nouns. Each ending you practise is scheduled for review on its own.</p>
          {run === null || done ? (
            <div className="mt-5 flex flex-wrap items-center gap-4">
              {done && <p className="font-semibold">{done.right} of {done.total} right. <span lang="cs">{done.right === done.total ? 'Bezchybně.' : 'Ještě jednou?'}</span></p>}
              <button type="button" className="btn btn-primary" onClick={() => { setDone(null); setRun(Date.now()); }}>
                {done ? 'Another ten' : 'Start the drill'}
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <ExerciseRunner
                key={run}
                exercises={session.map((x) => x.exercise)}
                context="lesson"
                retryMissed={false}
                onAnswer={async (o) => {
                  const key = keyOf.get(o.exercise);
                  if (key) await scheduleAnswer(key, o.exercise.skills, o.result.status);
                }}
                onFinish={(o) => setDone({ right: o.filter((x) => x.result.accepted).length, total: o.length })}
              />
            </div>
          )}
        </section>
      )}
    </>
  );
}
