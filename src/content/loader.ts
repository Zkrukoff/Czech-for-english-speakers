import type { z } from 'zod';
import { parseFrontmatter } from './frontmatter';
import {
  CourseSchema,
  FormTableFileSchema,
  GrammarFrontmatterSchema,
  LessonSchema,
  UnitSchema,
  VerbFileSchema,
  type Exercise,
  type FormTable,
  type GrammarFrontmatter,
  type LessonData,
  type UnitData,
  type Verb,
  type VocabItem,
} from './schema';
import { validatePattern } from '@/lib/answers/patterns';

/* ---------- Resolved (loaded) content types ---------- */

export interface Lesson extends LessonData {
  unitId: string;
  /** Folder name, e.g. "01-ordering-a-drink". */
  slug: string;
  /** 1-based position in the unit. */
  number: number;
  explanationMd: string;
}

export interface Unit extends UnitData {
  slug: string;
  number: number;
  lessonList: Lesson[];
}

export interface GrammarPage extends GrammarFrontmatter {
  section: 'cases' | 'verbs' | 'other';
  body: string;
  path: string;
}

export type ExerciseSource =
  | { kind: 'lesson'; unitId: string; lessonId: string }
  | { kind: 'unitCheck'; unitId: string };

export interface IndexedExercise {
  exercise: Exercise;
  source: ExerciseSource;
}

export interface Course {
  title: string;
  units: Unit[];
  unitsById: Map<string, Unit>;
  lessonsById: Map<string, Lesson>;
  exercisesById: Map<string, IndexedExercise>;
  vocabById: Map<string, { item: VocabItem; lessonId: string }>;
  grammarPages: GrammarPage[];
  grammarBySkill: Map<string, GrammarPage>;
  grammarById: Map<string, GrammarPage>;
  tables: Map<string, FormTable>;
  verbs: Verb[];
  verbsByLemma: Map<string, Verb>;
}

export interface ContentFiles {
  /** Parsed JSON keyed by path relative to /content, e.g. "units/01-greetings/unit.json". */
  json: Record<string, unknown>;
  /** Raw markdown keyed by path relative to /content. */
  markdown: Record<string, string>;
}

export interface LoadResult {
  course: Course;
  errors: string[];
  warnings: string[];
}

function formatZodError(path: string, error: z.ZodError): string[] {
  return error.issues.map((i) => `${path}: ${i.path.join('.') || '(root)'} — ${i.message}`);
}

const TABLE_EMBED = /```table\s+([a-z0-9-]+)\s*```/g;

export function loadContent(files: ContentFiles): LoadResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const course: Course = {
    title: '',
    units: [],
    unitsById: new Map(),
    lessonsById: new Map(),
    exercisesById: new Map(),
    vocabById: new Map(),
    grammarPages: [],
    grammarBySkill: new Map(),
    grammarById: new Map(),
    tables: new Map(),
    verbs: [],
    verbsByLemma: new Map(),
  };

  function parse<T>(schema: z.ZodType<T>, path: string, data: unknown): T | null {
    const r = schema.safeParse(data);
    if (!r.success) {
      errors.push(...formatZodError(path, r.error));
      return null;
    }
    return r.data;
  }

  /* ---- Tables ---- */
  for (const [path, data] of Object.entries(files.json)) {
    if (!path.startsWith('grammar/tables/')) continue;
    const file = parse(FormTableFileSchema, path, data);
    if (!file) continue;
    for (const t of file.tables) {
      if (course.tables.has(t.id)) errors.push(`${path}: duplicate table id "${t.id}"`);
      t.rows.forEach((row, i) => {
        if (row.forms.length !== t.columns.length) {
          errors.push(
            `${path}: table "${t.id}" row ${i + 1} has ${row.forms.length} forms but ${t.columns.length} columns`,
          );
        }
      });
      course.tables.set(t.id, t);
    }
  }

  /* ---- Verbs ---- */
  for (const [path, data] of Object.entries(files.json)) {
    if (!path.startsWith('verbs/')) continue;
    const file = parse(VerbFileSchema, path, data);
    if (!file) continue;
    for (const v of file.verbs) {
      if (course.verbsByLemma.has(v.lemma)) errors.push(`${path}: duplicate verb "${v.lemma}"`);
      course.verbsByLemma.set(v.lemma, v);
      course.verbs.push(v);
    }
  }
  for (const v of course.verbs) {
    for (const p of v.partner) {
      if (!course.verbsByLemma.has(p)) warnings.push(`verbs: partner "${p}" of "${v.lemma}" has no entry`);
    }
  }
  course.verbs.sort((a, b) => a.lemma.localeCompare(b.lemma, 'cs'));

  /* ---- Grammar pages ---- */
  for (const [path, raw] of Object.entries(files.markdown)) {
    if (!path.startsWith('grammar/')) continue;
    const { data, body } = parseFrontmatter(raw);
    const fm = parse(GrammarFrontmatterSchema, path, data);
    if (!fm) continue;
    const section = path.startsWith('grammar/cases/') ? 'cases' : path.startsWith('grammar/verbs/') ? 'verbs' : 'other';
    const page: GrammarPage = { ...fm, section, body, path };
    if (course.grammarById.has(page.id)) errors.push(`${path}: duplicate grammar page id "${page.id}"`);
    course.grammarById.set(page.id, page);
    if (page.skill) {
      if (course.grammarBySkill.has(page.skill)) errors.push(`${path}: a page for "${page.skill}" already exists`);
      course.grammarBySkill.set(page.skill, page);
    }
    course.grammarPages.push(page);
  }
  course.grammarPages.sort((a, b) => a.order - b.order);

  /* ---- Course, units, lessons ---- */
  const courseData = parse(CourseSchema, 'course.json', files.json['course.json']);
  if (!courseData) {
    if (!files.json['course.json']) errors.push('course.json is missing');
    return { course, errors, warnings };
  }
  course.title = courseData.title;

  const seenIds = new Set<string>();
  function claimId(kind: string, idValue: string, path: string) {
    const key = `${kind}:${idValue}`;
    if (seenIds.has(key)) errors.push(`${path}: duplicate ${kind} id "${idValue}"`);
    seenIds.add(key);
  }

  courseData.units.forEach((unitSlug, unitIdx) => {
    const unitPath = `units/${unitSlug}/unit.json`;
    if (!(unitPath in files.json)) {
      errors.push(`course.json lists unit "${unitSlug}" but ${unitPath} does not exist`);
      return;
    }
    const unitData = parse(UnitSchema, unitPath, files.json[unitPath]);
    if (!unitData) return;
    claimId('unit', unitData.id, unitPath);
    const goalIds = new Set(unitData.canDo.map((g) => g.id));

    const unit: Unit = { ...unitData, slug: unitSlug, number: unitIdx + 1, lessonList: [] };

    unitData.lessons.forEach((lessonSlug, lessonIdx) => {
      const base = `units/${unitSlug}/lessons/${lessonSlug}`;
      const lessonPath = `${base}/lesson.json`;
      if (!(lessonPath in files.json)) {
        errors.push(`${unitPath} lists lesson "${lessonSlug}" but ${lessonPath} does not exist`);
        return;
      }
      const data = parse(LessonSchema, lessonPath, files.json[lessonPath]);
      if (!data) return;
      claimId('lesson', data.id, lessonPath);
      const mdPath = `${base}/${data.explanation}`;
      const explanationMd = files.markdown[mdPath];
      if (explanationMd === undefined) errors.push(`${lessonPath}: explanation file ${mdPath} not found`);
      for (const g of data.canDo) {
        if (!goalIds.has(g)) errors.push(`${lessonPath}: canDo "${g}" is not a goal of unit "${unitData.id}"`);
      }
      const lesson: Lesson = {
        ...data,
        unitId: unitData.id,
        slug: lessonSlug,
        number: lessonIdx + 1,
        explanationMd: explanationMd ?? '',
      };
      for (const v of data.vocab) {
        claimId('vocab', v.id, lessonPath);
        course.vocabById.set(v.id, { item: v, lessonId: data.id });
      }
      for (const ex of data.exercises) {
        claimId('exercise', ex.id, lessonPath);
        course.exercisesById.set(ex.id, {
          exercise: ex,
          source: { kind: 'lesson', unitId: unitData.id, lessonId: data.id },
        });
      }
      course.lessonsById.set(lesson.id, lesson);
      unit.lessonList.push(lesson);
    });

    const goalsCovered = new Set<string>();
    for (const ex of unitData.check.exercises) {
      claimId('exercise', ex.id, unitPath);
      if (!ex.goalId) errors.push(`${unitPath}: check exercise "${ex.id}" needs a goalId`);
      else if (!goalIds.has(ex.goalId)) errors.push(`${unitPath}: check exercise "${ex.id}" has unknown goalId "${ex.goalId}"`);
      else goalsCovered.add(ex.goalId);
      course.exercisesById.set(ex.id, { exercise: ex, source: { kind: 'unitCheck', unitId: unitData.id } });
    }
    for (const g of goalIds) {
      if (!goalsCovered.has(g)) errors.push(`${unitPath}: can-do goal "${g}" has no check exercise`);
    }

    course.unitsById.set(unit.id, unit);
    course.units.push(unit);
  });

  /* ---- Cross-reference checks ---- */
  for (const [exId, { exercise, source }] of course.exercisesById) {
    const where = source.kind === 'lesson' ? `lesson ${source.lessonId}` : `unit ${source.unitId} check`;
    for (const p of [...exercise.answers, ...exercise.hints.map((h) => h.wrong)]) {
      const err = validatePattern(p);
      if (err) errors.push(`${where}, exercise ${exId}: ${err}`);
    }
    for (const s of exercise.skills) {
      if (s.startsWith('vocab:') && !course.vocabById.has(s.slice(6))) {
        errors.push(`${where}, exercise ${exId}: skill "${s}" refers to unknown vocab id`);
      }
    }
    if (exercise.type === 'caseSelect') {
      for (const a of exercise.answers) {
        if (!(exercise.options as string[]).includes(a)) {
          errors.push(`${where}, exercise ${exId}: answer "${a}" is not one of the options`);
        }
      }
    }
    if (exercise.type === 'conjugate' && !course.verbsByLemma.has(exercise.verb)) {
      warnings.push(`${where}, exercise ${exId}: verb "${exercise.verb}" is not in the verb lookup`);
    }
  }

  const checkEmbeds = (md: string, where: string) => {
    for (const m of md.matchAll(TABLE_EMBED)) {
      if (!course.tables.has(m[1]!)) errors.push(`${where}: embedded table "${m[1]}" does not exist`);
    }
  };
  for (const page of course.grammarPages) checkEmbeds(page.body, page.path);
  for (const lesson of course.lessonsById.values()) checkEmbeds(lesson.explanationMd, `lesson ${lesson.id}`);

  for (const lesson of course.lessonsById.values()) {
    for (const ref of lesson.grammarRefs) {
      if (course.grammarPages.length > 0 && !course.grammarBySkill.has(ref)) {
        warnings.push(`lesson ${lesson.id}: grammar page for "${ref}" does not exist yet`);
      }
    }
  }

  return { course, errors, warnings };
}
