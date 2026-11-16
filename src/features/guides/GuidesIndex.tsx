import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';

export function GuidesIndex() {
  return (
    <>
      <PageHeader
        title="Guides"
        subtitle="Life in Czechia beyond the lessons: the culture, history and holidays your colleagues take for granted, and the practical systems you use every day, with the Czech you'll meet in them."
      />
      <ul className="grid gap-4 md:grid-cols-2">
        {course.guides.map((g) => (
          <li key={g.id}>
            <Link to={`/guides/${g.id}`} className="card flex h-full flex-col p-5 transition hover:border-stone-400">
              <h2 className="text-xl font-semibold">{g.title}</h2>
              {g.titleCs && <p lang="cs" className="text-stone-500">{g.titleCs}</p>}
              <p className="mt-2 flex-1 text-stone-600">{g.summary}</p>
              <p className="mt-4 text-sm text-stone-500">
                {g.sections.length} sections · {g.phrasebook.reduce((n, b) => n + b.phrases.length, 0)} phrases ·{' '}
                {g.practice.reduce((n, s) => n + s.exercises.length, 0)} practice questions
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
