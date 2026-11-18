import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { saveExamAttempt } from '@/db/exam';
import { exam } from './examContent';
import { PART_INFO, TASK_SHAPE } from './schema';
import { isAutoScored, ScoredTask } from './ScoredTask';
import { SelfAssessedTask } from './SelfAssessedTask';

/** One practice set of one task type, with no time limit. */
export function PracticeTaskPage() {
  const { taskId = '' } = useParams();
  const task = exam.byId.get(taskId);
  const [started] = useState(() => Date.now());
  const [saved, setSaved] = useState(false);
  if (!task || !task.use.startsWith('practice')) return <NotFound />;
  const shape = TASK_SHAPE[task.part][task.task]!;
  const info = PART_INFO[task.part];
  const other = exam.tasks.find((t) => t.part === task.part && t.task === task.task && t.use !== task.use && t.use.startsWith('practice'));
  const record = (score: number, max: number, selfAssessed: boolean) => {
    if (saved) return;
    setSaved(true);
    void saveExamAttempt({ taskId: task.id, part: task.part, task: task.task, mode: 'practice', score, max, selfAssessed, at: Date.now(), durationMs: Date.now() - started });
  };
  return (
    <>
      <PageHeader
        eyebrow={<Link to="/exam" className="underline">Exam · <span lang="cs">Zkouška A2</span></Link>}
        title={`${info.en} ${task.task}: ${shape.en}`}
        cs={`${info.cs}, úloha ${task.task}`}
        subtitle={`Practice set ${task.use === 'practice1' ? 1 : 2}${task.title ? `: ${task.title}` : ''}. ${shape.points} points in the exam. No time limit here.`}
      />
      <h2 className="label-board mb-3 text-ink-3">The task · <span lang="cs">úloha</span></h2>
      {isAutoScored(task) ? (
        <ScoredTask key={task.id} task={task} onHandIn={(s, m) => record(s, m, false)} />
      ) : (
        <SelfAssessedTask key={task.id} task={task} onDone={(s, m) => record(s, m, true)} />
      )}
      <nav aria-label="More practice" className="mt-10 flex flex-wrap gap-3 border-t-2 border-rule pt-6">
        {other && <Link to={`/exam/practice/${other.id}`} className="btn btn-secondary">The other practice set</Link>}
        <Link to="/exam" className="btn btn-quiet">Back to the exam page</Link>
      </nav>
    </>
  );
}
