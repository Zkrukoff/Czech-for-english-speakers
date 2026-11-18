import { ExerciseSchema, type Exercise } from '@/content/schema';
import { wordCount } from '@/lib/exam/score';
import { ExamFileSchema, PARTS, TASK_SHAPE, WORD_MIN, WarmupFileSchema, type ExamTask, type Part } from './schema';

export interface ExamContent {
  tasks: ExamTask[];
  byId: Map<string, ExamTask>;
  warmup: Exercise[];
  errors: string[];
}

/**
 * Loads content/exam/*.json. The exam's content is kept out of the main
 * course bundle (see src/content/files.ts): only the exam pages load it.
 * `pictures` is the set of known pictogram ids, checked when given.
 */
export function loadExam(files: Record<string, unknown>, pictures?: Set<string>): ExamContent {
  const errors: string[] = [];
  const tasks: ExamTask[] = [];
  let warmup: Exercise[] = [];
  for (const [path, raw] of Object.entries(files).sort()) {
    if (path.endsWith('warmup.json')) {
      const w = WarmupFileSchema.safeParse(raw);
      if (!w.success) { errors.push(`${path}: ${w.error.message}`); continue; }
      warmup = w.data.warmup.flatMap((e, i) => {
        const r = ExerciseSchema.safeParse(e);
        if (!r.success) { errors.push(`${path}: warm-up item ${i}: ${r.error.issues[0]?.message}`); return []; }
        return [r.data];
      });
      continue;
    }
    const r = ExamFileSchema.safeParse(raw);
    if (!r.success) {
      for (const issue of r.error.issues.slice(0, 5)) errors.push(`${path}: ${issue.path.join('.')}: ${issue.message}`);
      continue;
    }
    tasks.push(...r.data.tasks);
  }

  const byId = new Map<string, ExamTask>();
  const slots = new Set<string>();
  for (const t of tasks) {
    const where = `exam task ${t.id}`;
    if (byId.has(t.id)) errors.push(`${where}: duplicate id`);
    byId.set(t.id, t);
    const shape = TASK_SHAPE[t.part][t.task];
    if (!shape) { errors.push(`${where}: ${t.part} has no task ${t.task}`); continue; }
    if (shape.kind !== t.kind) errors.push(`${where}: ${t.part} task ${t.task} must be "${shape.kind}", not "${t.kind}"`);
    const slot = `${t.part}-${t.task}-${t.use}`;
    if (slots.has(slot)) errors.push(`${where}: a second ${t.use} set for ${t.part} task ${t.task}`);
    slots.add(slot);
    const pic = (id: string | undefined, what: string) => {
      if (id && pictures && !pictures.has(id)) errors.push(`${where}: unknown picture "${id}" (${what})`);
    };

    switch (t.kind) {
      case 'match': {
        if (t.items.length !== shape.items) errors.push(`${where}: needs ${shape.items} items, has ${t.items.length}`);
        if (t.options.length !== shape.items + (shape.extras ?? 0)) errors.push(`${where}: needs ${shape.items + (shape.extras ?? 0)} options (${shape.extras} extra), has ${t.options.length}`);
        const optionIds = new Set(t.options.map((o) => o.id));
        const used = new Set<string>();
        for (const i of t.items) {
          const a = t.answers[i.id];
          if (!a) errors.push(`${where}: item ${i.id} has no answer`);
          else if (!optionIds.has(a)) errors.push(`${where}: item ${i.id} answer ${a} is not an option`);
          else if (used.has(a)) errors.push(`${where}: option ${a} is the answer twice`);
          if (a) used.add(a);
          if (!i.text && !i.audio && !i.picture) errors.push(`${where}: item ${i.id} has nothing to show`);
          if (t.part === 'listening' && !i.audio) errors.push(`${where}: listening item ${i.id} needs audio`);
          pic(i.picture, `item ${i.id}`);
        }
        for (const o of t.options) {
          if (!o.text && !o.picture) errors.push(`${where}: option ${o.id} is empty`);
          pic(o.picture, `option ${o.id}`);
        }
        break;
      }
      case 'choice':
        if (t.questions.length !== shape.items) errors.push(`${where}: needs ${shape.items} questions, has ${t.questions.length}`);
        t.questions.forEach((q, i) => {
          if (new Set(q.options).size !== 4) errors.push(`${where}: question ${i + 1} repeats an option`);
          if (t.part === 'listening' && !q.audio) errors.push(`${where}: listening question ${i + 1} needs audio`);
          if (t.part === 'reading' && t.task === 4 && !(q.text ?? '').includes('___')) errors.push(`${where}: reading 4 text ${i + 1} needs a gap (___)`);
        });
        if (t.part === 'reading' && t.task === 2 && !t.text) errors.push(`${where}: reading 2 needs a text`);
        break;
      case 'fill':
        if (t.questions.length !== shape.items) errors.push(`${where}: needs ${shape.items} questions, has ${t.questions.length}`);
        if (t.part === 'listening' ? !t.audio : !t.text) errors.push(`${where}: needs ${t.part === 'listening' ? 'audio' : 'a text'}`);
        break;
      case 'form':
        if (t.questions.length !== 3) errors.push(`${where}: a form has 3 questions`);
        t.questions.forEach((q, i) => { if (wordCount(q.model) < WORD_MIN.formAnswer) errors.push(`${where}: model answer ${i + 1} is under ${WORD_MIN.formAnswer} words`); });
        break;
      case 'email':
        if (t.prompts.length !== 5) errors.push(`${where}: an e-mail has 5 prompts`);
        if (wordCount(t.model) < WORD_MIN.email) errors.push(`${where}: model e-mail is under ${WORD_MIN.email} words`);
        t.prompts.forEach((p) => pic(p.picture, 'prompt'));
        break;
      case 'roleplay':
        t.cards.forEach((c, i) => {
          if (c.model.filter((m) => m.who === 'you').length < 4) errors.push(`${where}: card ${i + 1} model needs 4 questions from you`);
        });
        break;
      case 'story':
        t.panels.forEach((p) => pic(p, 'panel'));
        if (wordCount(t.model) < 30) errors.push(`${where}: the model story is too short for a minute`);
        break;
      case 'agree':
        t.options.forEach((o) => pic(o.picture, 'option'));
        break;
      case 'interview':
        break;
    }
  }
  return { tasks: PARTS.flatMap((p) => tasks.filter((t) => t.part === p).sort((a, b) => a.task - b.task || a.use.localeCompare(b.use))), byId, warmup, errors };
}

export const tasksFor = (c: ExamContent, part: Part, task: number) => c.tasks.filter((t) => t.part === part && t.task === task);
export const mockTasks = (c: ExamContent, mock: 'mock1' | 'mock2') => c.tasks.filter((t) => t.use === mock);
