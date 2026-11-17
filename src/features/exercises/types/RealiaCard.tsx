import type { Exercise } from '@/content/schema';
import { CzechText } from '@/components/CzechText';

type Realia = Extract<Exercise, { type: 'readReal' }>['realia'];

const STYLE: Record<Realia['kind'], string> = {
  sign: 'bg-plate-blue text-on-fill-light font-mono uppercase tracking-wider',
  timetable: 'bg-board text-line-b font-mono',
  announcement: 'bg-board text-on-fill-light font-mono',
  menu: 'bg-surface text-ink font-read',
  form: 'bg-surface text-ink font-mono',
  message: 'bg-vltava-tint text-ink',
};

/** A real-world text recreated in our own style (D12): no operators' logos or brand artwork. */
export function RealiaCard({ realia }: { realia: Realia }) {
  return (
    <figure className={`rounded-md border-2 border-ink p-4 shadow-offset-sm ${STYLE[realia.kind]}`} lang="cs">
      {realia.title && <figcaption className="mb-2 text-sm font-bold">{realia.title}</figcaption>}
      {realia.lines.map((l, i) => (
        <p key={i} className="leading-snug"><CzechText text={l} /></p>
      ))}
    </figure>
  );
}
