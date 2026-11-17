import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { IconArrowLeft } from '@/components/icons';
import { compareCs } from '@/lib/text';

/** Aspect pairs taught as pairs (brief 2.2 #4): ongoing or repeated vs finished, side by side. */
export function AspectPairsPage() {
  const page = course.grammarById.get('aspect');
  const pairs = course.verbs
    .filter((v) => v.aspect === 'impf' && v.partner.length > 0)
    .flatMap((v) => v.partner.map((p) => [v, course.verbsByLemma.get(p)] as const))
    .filter(([, pf]) => pf && pf.aspect === 'pf')
    .sort((a, b) => compareCs(a[0].lemma, b[0].lemma));
  return (
    <>
      <Link to="/grammar" className="inline-flex items-center gap-1 text-sm text-vltava hover:underline"><IconArrowLeft size={16} /> Mluvnice</Link>
      <PageHeader
        eyebrow="Vid · aspect"
        title="Aspect pairs"
        subtitle="Most Czech verbs come in pairs. The imperfective is for the process, habits and repetition; the perfective is for one finished result. Learn them together."
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="border-2 border-ink bg-surface p-4">
          <p className="label-board text-ink-3" lang="cs">Nedokonavé · imperfective</p>
          <p className="mt-2" lang="cs"><b>Každý den píšu e-maily.</b></p>
          <p className="text-sm text-ink-2">I write emails every day. (habit, process)</p>
        </div>
        <div className="border-2 border-ink bg-ticket p-4 text-on-fill-dark">
          <p className="label-board" lang="cs">Dokonavé · perfective</p>
          <p className="mt-2" lang="cs"><b>Napíšu ti e-mail.</b></p>
          <p className="text-sm">I'll write you an email. (one finished result)</p>
        </div>
      </div>
      <table className="w-full border-2 border-ink bg-surface text-left shadow-offset-sm">
        <caption className="sr-only">Imperfective and perfective pairs</caption>
        <thead className="border-b-2 border-ink">
          <tr>
            <th scope="col" className="label-board px-4 py-2 text-ink-3">Imperfective</th>
            <th scope="col" className="label-board px-4 py-2 text-ink-3">Perfective</th>
            <th scope="col" className="label-board hidden px-4 py-2 text-ink-3 sm:table-cell">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map(([impf, pf]) => (
            <tr key={`${impf.lemma}-${pf!.lemma}`} className="border-t border-rule">
              <td className="px-4 py-2" lang="cs"><Link to={`/verbs/lookup/${encodeURIComponent(impf.lemma)}`} className="font-semibold hover:underline">{impf.lemma}</Link></td>
              <td className="px-4 py-2" lang="cs"><Link to={`/verbs/lookup/${encodeURIComponent(pf!.lemma)}`} className="font-semibold hover:underline">{pf!.lemma}</Link></td>
              <td className="hidden px-4 py-2 text-ink-2 sm:table-cell">{impf.en}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {page && <p className="mt-6"><Link to={`/verbs/${page.id}`} className="text-vltava underline">The full explanation: {page.title}</Link></p>}
    </>
  );
}
