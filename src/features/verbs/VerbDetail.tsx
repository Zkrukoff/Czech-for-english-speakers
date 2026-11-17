import { Link, useParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { AspectBadge } from '@/components/AspectBadge';
import { PersonTable } from '@/components/ConjugationTable';
import { ReviewStatusBadge } from '@/components/ReviewStatusBadge';
import { SpeakButton } from '@/components/SpeakButton';
import { SpokenFormNote } from '@/components/SpokenFormNote';
import { conditionalForms, futureForms, imperativeForms, pastForms, presentForms } from '@/lib/verbs';
import { IconArrowLeft } from '@/components/icons';

export function VerbDetail() {
  const { lemma = '' } = useParams();
  const verb = course.verbsByLemma.get(lemma);
  if (!verb) return <NotFound what="verb" />;
  const imp = imperativeForms(verb);
  const topicPages = verb.topics.map((t) => course.grammarBySkill.get(`verb:${t}`)).filter((p) => p !== undefined);
  const futureNote = verb.future
    ? 'Irregular future.'
    : verb.aspect === 'pf'
      ? 'Perfective: the present forms have future meaning.'
      : 'Imperfective: budu + infinitive.';
  return (
    <>
      <Link to="/verbs/lookup" className="text-sm text-vltava hover:underline"><IconArrowLeft size={16} className="inline-block align-[-3px]" /> Verb lookup</Link>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            {verb.lemma} <SpeakButton text={verb.lemma} />
          </span>
        }
        subtitle={verb.en}
      >
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <AspectBadge aspect={verb.aspect} />
          <span className="text-ink-3">Class {verb.class}</span>
          {verb.motion && <span className="text-ink-3">· verb of motion ({verb.motion})</span>}
          <ReviewStatusBadge reviewed={verb.nativeReviewed} />
        </div>
      </PageHeader>

      {(verb.partner.length > 0 || verb.motionPair) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {verb.partner.map((p) => {
            const pv = course.verbsByLemma.get(p);
            return (
              <Link key={p} to={`/verbs/lookup/${encodeURIComponent(p)}`} className="rounded-lg border border-rule bg-surface px-4 py-2 hover:border-rule-strong">
                <span className="block text-xs text-ink-3">Aspect partner</span>
                <span className="font-semibold">{p}</span> {pv && <AspectBadge aspect={pv.aspect} />}
              </Link>
            );
          })}
          {verb.motionPair && (
            <Link to={`/verbs/lookup/${encodeURIComponent(verb.motionPair)}`} className="rounded-lg border border-rule bg-surface px-4 py-2 hover:border-rule-strong">
              <span className="block text-xs text-ink-3">Motion pair</span>
              <span className="font-semibold">{verb.motionPair}</span>
            </Link>
          )}
        </div>
      )}

      {verb.notes && <p className="mb-4 max-w-2xl rounded-lg bg-paper-2 px-4 py-3 text-ink">{verb.notes}</p>}
      {verb.spoken && <div className="mb-6"><SpokenFormNote spoken={verb.spoken} /></div>}

      <div className="grid gap-4 md:grid-cols-2">
        <PersonTable title={verb.aspect === 'pf' ? 'Present forms (future meaning)' : 'Present'} forms={presentForms(verb)} />
        <PersonTable title="Past" forms={pastForms(verb)} highlight={false} />
        <div>
          <PersonTable title="Future" forms={futureForms(verb)} highlight={!!verb.future || verb.aspect === 'pf'} />
          <p className="mt-1 text-xs text-ink-3">{futureNote}</p>
        </div>
        <PersonTable title="Conditional" forms={conditionalForms(verb)} highlight={false} />
        {imp && (
          <div className="overflow-hidden rounded-lg border border-rule bg-surface">
            <div className="border-b border-rule bg-paper px-3 py-1.5 text-sm font-medium text-ink-2">Imperative</div>
            <table className="w-full text-sm">
              <tbody>
                {(['2sg', '1pl', '2pl'] as const).map((p) => (
                  <tr key={p} className="border-t border-rule first:border-0">
                    <th scope="row" className="w-32 px-3 py-1.5 text-left font-normal text-ink-3">{{ '2sg': 'ty', '1pl': 'my', '2pl': 'vy' }[p]}</th>
                    <td className="px-3 py-1.5 text-base">{imp[p]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {topicPages.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 font-semibold">Related topics</h2>
          <ul className="flex flex-wrap gap-2">
            {topicPages.map((p) => (
              <li key={p.id}><Link to={`/verbs/${p.id}`} className="rounded-full border border-rule-strong px-3 py-1 text-sm hover:bg-paper-2">{p.title}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
