import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { Card, EnamelPlate, TileGrid } from '@/components/ui';
import { IconArrowRight } from '@/components/icons';

/** Short Czech names used on the plates (the brief's section names). */
const PLATE: Record<string, string> = { 'prague-transport': 'Doprava', culture: 'Kultura', 'settling-in': 'Zabydlení' };
const TILE: Record<string, string> = { 'prague-transport': '16', culture: '04', 'settling-in': '10' };

export function GuidesIndex() {
  return (
    <>
      <PageHeader
        title="Guides"
        cs="Průvodce"
        subtitle="Life in Czechia beyond the lessons. Every article links to the lessons that teach its Czech, and every lesson links back here."
      />
      <ul className="grid gap-8 md:grid-cols-2">
        {course.guides.map((g) => {
          const lessons = new Set(g.sections.flatMap((s) => s.lessons)).size;
          return (
            <li key={g.id}>
              <Link to={`/guides/${g.id}`} className="group block h-full transition-transform hover:-translate-y-0.5">
                <Card corner="tr" className="h-full">
                  <TileGrid tone={`var(--tile-${TILE[g.id] ?? '12'})`} cols={8} rows={1} size={36} className="w-full border-b-2 border-ink" />
                  <div className="p-5">
                    <EnamelPlate tone="blue">{PLATE[g.id] ?? g.titleCs ?? g.title}</EnamelPlate>
                    <h2 className="mt-4 text-2xl font-extrabold tracking-tight">{g.title}</h2>
                    <p className="mt-2 text-ink-2">{g.summary}</p>
                    <p className="label-board mt-4 text-ink-3">
                      {g.sections.length} sections · {g.phrasebook.reduce((n, b) => n + b.phrases.length, 0)} phrases · {lessons} linked lessons
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 font-semibold text-vltava group-hover:underline">
                      Open <IconArrowRight size={16} />
                    </span>
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
        {course.draftGuides.map((g) => (
          <li key={g.id} className="border-2 border-dashed border-rule-strong bg-paper-2 p-5">
            <EnamelPlate tone="paper">{PLATE[g.id] ?? g.title}</EnamelPlate>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-2">{g.title}</h2>
            <p className="mt-2 text-ink-2">{g.summary}</p>
            <p className="label-board mt-4 text-ink-3"><span lang="cs">Výluka</span> · being written</p>
          </li>
        ))}
      </ul>
    </>
  );
}
