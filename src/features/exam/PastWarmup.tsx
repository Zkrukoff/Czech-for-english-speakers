import { ExerciseRunner } from '@/features/exercises/ExerciseRunner';
import { exam } from './examContent';

/** Ten quick past-tense choices before the story task. Logged like review answers, tagged verb:past. */
export function PastWarmup({ onFinish }: { onFinish: () => void }) {
  return <ExerciseRunner exercises={exam.warmup} context="exam" retryMissed={false} itemKeyOf={(e) => `exam:${e.id}`} onFinish={() => onFinish()} />;
}
