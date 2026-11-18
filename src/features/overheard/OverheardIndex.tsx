import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { Card, EnamelPlate } from '@/components/ui';
import { IconArrowLeft, IconArrowRight, IconSpeaker } from '@/components/icons';
import { isRecorded } from './playback';

const KIND = { transport: 'Doprava', shop: 'Obchod', pub: 'Hospoda', health: 'Zdraví', work: 'Práce' } as const;

export function OverheardIndex() {
  return (
    <>
      <Link to="/sounds" className="inline-flex min-h-11 items-center gap-1 text-sm text-vltava hover:underline"><IconArrowLeft size={16} /> Sounds</Link>
      <PageHeader
        title="Overheard in Prague"
        cs="Zaslechnuto v Praze"
        subtitle="Short everyday scenes: announcements, the checkout, the pub, the pharmacy. Listen, read along in textbook or spoken Czech, then check what you understood."
      />
      <OverheardList />
    </>
  );
}

/** The scene cards, also shown on the Sounds page. */
export function OverheardList() {
  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2">
        {course.overheard.map((sc) => {
          const recorded = sc.lines.every(isRecorded);
          return (
            <li key={sc.id}>
              <Link to={`/sounds/overheard/${sc.id}`} className="group block h-full transition-transform hover:-translate-y-0.5">
                <Card corner="tr" className="h-full">
                  <div className="p-5">
                    <EnamelPlate tone="blue" size="sm">{KIND[sc.kind]}</EnamelPlate>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{sc.title}</h2>
                    <p lang="cs" className="text-ink-3">{sc.titleCs}</p>
                    <p className="mt-2 text-ink-2">{sc.setting}</p>
                    <p className="label-board mt-4 flex items-center gap-2 text-ink-3">
                      <IconSpeaker size={16} /> {sc.lines.length} lines · {sc.questions.length} questions · {recorded ? 'recorded' : 'placeholder voice'}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 font-semibold text-vltava group-hover:underline">Listen <IconArrowRight size={16} /></span>
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
