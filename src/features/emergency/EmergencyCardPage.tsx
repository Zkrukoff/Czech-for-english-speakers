import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { Button, SectionNumber } from '@/components/ui';
import { SpeakButton } from '@/components/SpeakButton';
import { IconArrowLeft } from '@/components/icons';
import { EmergencyNumbers, VerifiedLine } from './Numbers';
import { ShowMode } from './ShowMode';

export function EmergencyCardPage() {
  const { cardId = '' } = useParams();
  const c = course.emergency.cards.find((x) => x.id === cardId);
  const [showing, setShowing] = useState(false);
  if (!c) return <NotFound what="emergency card" />;
  let n = 0;
  return (
    <>
      <Link to="/emergency" className="inline-flex min-h-11 items-center gap-1 text-sm text-vltava hover:underline"><IconArrowLeft size={16} /> Emergency</Link>
      <PageHeader title={c.title} cs={c.titleCs} subtitle={c.intro}>
        <Button variant="primary" className="mt-5" onClick={() => setShowing(true)}>Show to a Czech</Button>
      </PageHeader>

      {c.numbers.length > 0 && (
        <section className="mb-12" aria-labelledby="c-num">
          <SectionNumber n={++n} id="c-num">Call</SectionNumber>
          <EmergencyNumbers ids={c.numbers} compact />
          <VerifiedLine />
        </section>
      )}

      <section className="mb-12" aria-labelledby="c-say">
        <SectionNumber n={++n} id="c-say">Say</SectionNumber>
        <ul className="divide-y-2 divide-rule border-y-2 border-rule">
          {[...c.show, ...c.phrases].map((p) => (
            <li key={p.cs} className="flex items-start justify-between gap-3 py-3">
              <span className="min-w-0">
                <span lang="cs" className="block text-lg font-semibold text-ink">{p.cs}</span>
                <span className="block text-sm text-ink-2">{p.en}</span>
              </span>
              <SpeakButton text={p.cs} />
            </li>
          ))}
        </ul>
      </section>

      {c.contacts.length > 0 && (
        <section className="mb-12" aria-labelledby="c-con">
          <SectionNumber n={++n} id="c-con">Contacts</SectionNumber>
          <ul className="grid gap-3">
            {c.contacts.map((k) => (
              <li key={k.tel} className="card p-4">
                <span className="block text-sm text-ink-2">{k.label}</span>
                <a href={`tel:${k.tel}`} className="font-display text-2xl font-extrabold tabular-nums underline">{k.display}</a>
                <span className="mt-1 block text-xs text-ink-3">
                  Checked {k.verified.date} on <a href={k.verified.url} className="underline" target="_blank" rel="noreferrer">{new URL(k.verified.url).hostname}</a>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {c.expect.length > 0 && (
        <section className="mb-12" aria-labelledby="c-exp">
          <SectionNumber n={++n} id="c-exp">Good to know</SectionNumber>
          <div className="prose-cz"><ul>{c.expect.map((e) => <li key={e}>{e}</li>)}</ul></div>
        </section>
      )}

      <p className="text-xs text-ink-3">The Czech on this card is awaiting review by a native speaker.</p>
      {showing && <ShowMode messages={c.show} onClose={() => setShowing(false)} />}
    </>
  );
}
