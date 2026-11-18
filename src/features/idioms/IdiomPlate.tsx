import type { Idiom } from '@/content/schema';

/** The idiom on an enamel street-plate: blue, white rim, big Czech. Fixed colours in both themes. */
export function IdiomPlate({ idiom, week, large = false }: { idiom: Idiom; week?: number; large?: boolean }) {
  return (
    <div
      className="rounded-lg p-5 sm:p-7"
      style={{ background: 'var(--plate-blue)', color: 'var(--on-fill-light)', boxShadow: 'inset 0 0 0 5px var(--plate-blue), inset 0 0 0 7px var(--on-fill-light), var(--shadow-offset)' }}
    >
      <p className="label-board opacity-90">
        <span lang="cs">Idiom týdne</span>
        {week !== undefined && <> · <span lang="cs">týden {week}</span></>}
      </p>
      <p lang="cs" className={`mt-3 font-display font-extrabold leading-tight tracking-tight ${large ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}>{idiom.cs}</p>
      <p className="mt-2 italic opacity-90">“{idiom.literal}”</p>
    </div>
  );
}
