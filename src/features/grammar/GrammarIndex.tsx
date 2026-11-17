import { Link } from 'react-router-dom';
import { CASE_INFO, CASE_KEY_TO_NAME, course, type CaseKey } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { CASE_TEXT } from '@/components/caseColors';
import { GenderMark } from '@/components/GenderMark';
import { SectionNumber } from '@/components/ui';
import { IconArrowRight } from '@/components/icons';
import { VZORY, vzorGender } from './VzorPage';

/** The order the brief teaches cases in: by usefulness, not by number. */
const USEFUL_ORDER: CaseKey[] = ['nom', 'acc', 'loc', 'gen', 'ins', 'dat', 'voc'];

export function GrammarIndex() {
  const overview = course.grammarById.get('how-cases-work');
  const fns = [...course.functions.values()].filter((f) => f.id !== 'chunk');
  return (
    <>
      <PageHeader title="Grammar" cs="Mluvnice" subtitle="Cases by what they do, the model nouns behind every ending, and verbs in pairs. Every underlined ending in a lesson links here." />

      {overview && (
        <Link to={`/grammar/${overview.id}`} className="card card-link mb-12 flex items-center justify-between gap-4 p-5">
          <span>
            <span className="label-board block text-ink-3">Start here</span>
            <span className="mt-1 block text-xl font-bold">{overview.title}</span>
            {overview.summary && <span className="mt-1 block text-sm text-ink-2">{overview.summary}</span>}
          </span>
          <IconArrowRight size={20} className="shrink-0" />
        </Link>
      )}

      <section aria-labelledby="cases-h" className="mb-14">
        <SectionNumber n={1} id="cases-h">Seven cases, by what they do</SectionNumber>
        <p className="mt-3 max-w-2xl text-sm text-ink-2">In the order you'll need them, not the order grammar books number them.</p>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2">
          {USEFUL_ORDER.map((k) => {
            const name = CASE_KEY_TO_NAME[k];
            const info = CASE_INFO[name];
            const page = course.grammarBySkill.get(`case:${name}`);
            const mine = fns.filter((f) => f.case === k);
            return (
              <li key={k}>
                <Link to={page ? `/grammar/${page.id}` : '/grammar'} className="card card-link flex h-full flex-col p-5">
                  <span className={`label-board ${CASE_TEXT[k]}`}>
                    {info.number}. pád · <span lang="cs">{info.czech}</span>
                  </span>
                  <span className="mt-1 text-2xl font-extrabold capitalize">{name}</span>
                  <span lang="cs" className="text-sm italic text-ink-3">{info.question}</span>
                  <ul className="mt-3 space-y-1 text-sm text-ink-2">
                    {mine.slice(0, 4).map((f) => (
                      <li key={f.id} className="flex gap-2">
                        <span aria-hidden className={CASE_TEXT[k]}>ˇ</span> {f.label}
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="vzory-h" className="mb-14">
        <SectionNumber n={2} id="vzory-h">Vzory: the model nouns</SectionNumber>
        <p className="mt-3 max-w-2xl text-sm text-ink-2">Every noun declines like one of these fourteen. Pick one to see its table, the nouns that follow it, and a drill across the cases.</p>
        {(['m-anim', 'm-inan', 'f', 'n'] as const).map((g) => (
          <div key={g} className="mt-5">
            <GenderMark gender={g} />
            <ul className="mt-2 flex flex-wrap gap-2" lang="cs">
              {VZORY.filter((v) => vzorGender(v) === g).map((v) => (
                <li key={v}>
                  <Link to={`/grammar/vzory/${v}`} className="inline-flex min-h-11 items-center border-2 border-ink bg-surface px-4 font-display text-xl font-extrabold shadow-offset-sm hover:-translate-y-0.5">
                    {course.tables.get(v)?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/grammar/numbers" className="btn btn-primary"><span lang="cs">Čísla</span> · numbers + nouns</Link>
          <Link to="/grammar/tables" className="btn btn-secondary">All tables, incl. adjectives and pronouns</Link>
        </div>
      </section>

      <section aria-labelledby="verbs-h">
        <SectionNumber n={3} id="verbs-h">Verbs</SectionNumber>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/grammar/aspect-pairs" className="btn btn-primary"><span lang="cs">Vid</span> · aspect pairs</Link>
          <Link to="/verbs" className="btn btn-secondary">The verb track</Link>
          <Link to="/verbs/lookup" className="btn btn-secondary">Look up a verb</Link>
        </div>
      </section>
    </>
  );
}
