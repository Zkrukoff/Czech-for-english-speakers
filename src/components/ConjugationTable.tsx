import { Link } from 'react-router-dom';
import type { Verb } from '@/content/schema';
import { PERSONS, PERSON_LABELS, commonStem, type Person } from '@/lib/verbs';
import { SpeakButton } from './SpeakButton';

/** Form with the part after the shared stem highlighted. */
export function HighlightedForm({ form, stem }: { form: string; stem: string }) {
  return (
    <>
      {form.split(' / ').map((alt, i) => (
        <span key={i}>
          {i > 0 && <span className="text-ink-3"> / </span>}
          {stem && alt.startsWith(stem) ? (
            <>
              {stem}
              <span className="font-semibold text-vltava">{alt.slice(stem.length).split(' ')[0]}</span>
              {alt.slice(stem.length).includes(' ') && ' ' + alt.slice(stem.length).split(' ').slice(1).join(' ')}
            </>
          ) : (
            alt
          )}
        </span>
      ))}
    </>
  );
}

export function PersonTable({ title, forms, highlight = true }: { title: string; forms: Record<Person, string>; highlight?: boolean }) {
  const stem = highlight ? commonStem(PERSONS.map((p) => forms[p])) : '';
  return (
    <div className="overflow-hidden rounded-md border-2 border-ink bg-surface">
      <div className="border-b border-rule bg-paper px-3 py-1.5 text-sm font-medium text-ink-2">{title}</div>
      <table className="w-full text-sm">
        <tbody>
          {PERSONS.map((p) => (
            <tr key={p} className="border-t border-rule first:border-0">
              <th scope="row" className="w-32 px-3 py-1.5 text-left font-normal text-ink-3">{PERSON_LABELS[p]}</th>
              <td lang="cs" className="px-3 py-1.5 text-base"><HighlightedForm form={forms[p]} stem={stem} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Compact present-tense table used when a grammar page embeds ```verb lemma```. */
export function EmbeddedVerb({ verb }: { verb: Verb }) {
  const forms = Object.fromEntries(PERSONS.map((p) => [p, verb.present[p] + (verb.reflexive ? ` ${verb.reflexive}` : '')])) as Record<Person, string>;
  return (
    <div className="not-prose my-4 max-w-md">
      <div className="mb-1 flex items-center gap-2 text-sm">
        <Link to={`/verbs/lookup/${encodeURIComponent(verb.lemma)}`} className="font-semibold text-ink hover:underline">{verb.lemma}</Link>
        <span className="text-ink-3">{verb.en}</span>
        <SpeakButton text={verb.lemma} />
      </div>
      <PersonTable title={`Present · ${verb.class}`} forms={forms} />
    </div>
  );
}
