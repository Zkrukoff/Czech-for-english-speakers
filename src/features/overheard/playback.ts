import type { OverheardScene } from '@/content/schema';
import { course } from '@/content';
import { lensPlain } from '@/lib/lens';
import { speech } from '@/lib/audio/speech';

type Line = OverheardScene['lines'][number];

/** A line has a real recording once its id is listed in content/audio/manifest.json. */
export const isRecorded = (l: Line) => !!l.audio && course.audio.has(l.audio);

/**
 * Play one line: the real recording if there is one, otherwise the browser's
 * Czech voice as a clearly labelled placeholder. Resolves when it has finished.
 */
export function playLine(l: Line, spoken: boolean, rate = 1): Promise<void> {
  if (isRecorded(l)) {
    const r = course.audio.get(l.audio!)!;
    const a = new Audio(`${import.meta.env.BASE_URL}audio/${r.file}`);
    return new Promise((res) => {
      a.onended = a.onerror = () => res();
      a.play().catch(() => res());
    });
  }
  return speech.speak(lensPlain(spoken && l.spoken ? l.spoken : l.cs), { rate });
}
