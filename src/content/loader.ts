import type { z } from 'zod';
import { parseFrontmatter } from './frontmatter';
import {
  AlphabetSchema,
  CourseSchema,
  GuideSchema,
  FormTableFileSchema,
  GrammarFrontmatterSchema,
  LessonSchema,
  LinesSchema,
  LexiconSchema,
  FunctionsFileSchema,
  NamedaysSchema,
  HolidaysSchema,
  OverheardSceneSchema,
  HolidayLessonsSchema,
  EmergencyNumbersSchema,
  EmergencyCardsSchema,
  IdiomsSchema,
  AudioManifestSchema,
  UnitSchema,
  VerbFileSchema,
  type AlphabetData,
  type GuideData,
  type Exercise,
  type FormTable,
  type GrammarFrontmatter,
  type LessonData,
  type UnitData,
  type Verb,
  type LinesData,
  type Noun,
  type GrammarFunction,
  type NamedaysData,
  type HolidaysData,
  type OverheardScene,
  type HolidayLesson,
  type EmergencyNumbers,
  type EmergencyCards,
  type Idiom,
  type AudioManifest,
  type Mission,
  type StationData,
  type StopData,
  type VocabItem,
} from './schema';
import { validatePattern } from '@/lib/answers/patterns';
import { compareCs } from '@/lib/text';
import { decline, cellsOf, parseLens, lensPlain, lensKeys, type Paradigm } from '@/lib/lens';
import { expandPatterns } from '@/lib/answers/patterns';

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
  | { kind: 'unitCheck'; unitId: string }
  | { kind: 'alphabet'; setId: string }
  | { kind: 'guide'; guideId: string; setId: string }
  | { kind: 'overheard'; sceneId: string }
  | { kind: 'holiday'; lessonId: string };

export interface Guide extends GuideData {
  /** Folder name under content/guides/. */
  slug: string;
  sectionMd: Record<string, string>;
}

export type LineId = 'A' | 'B' | 'C';

/** A stop on a line: the station, its role in the course, and its position. */
export type Stop = StopData & {
  line: LineId;
  /** 1-based position on the line. */
  position: number;
  /** Slug of the station, also its URL segment. */
  slug: string;
  stationInfo: StationData;
  /** Other lines you can change to here. */
  transfers: LineId[];
};

export interface Line extends Omit<LinesData['lines'][number], 'stops'> {
  stops: Stop[];
}

/** What the schematic metro map needs (derived from lines.json). */
export interface MetroData {
  lines: { id: LineId; nickname: string; stations: string[] }[];
  /** Above-ground notes, keyed by station name. */
  notes: Record<string, string>;
  underConstruction?: string;
}

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
  /** The alphabet section, if content/alphabet/alphabet.json exists. */
  alphabet: (AlphabetData & { introMd: string }) | null;
  guides: Guide[];
  /** Guides still being written: validated, reachable by URL, not listed. */
  draftGuides: Guide[];
  guidesById: Map<string, Guide>;
  /** The course map: lines A, B and C (content/lines/lines.json). */
  lines: Line[];
  linesVerified: LinesData['verified'] | null;
  milestones: LinesData['milestones'];
  /** The stop each unit sits at. */
  stopByUnit: Map<string, Stop>;
  /** Stops keyed by "<line>/<station slug>". */
  stopsByKey: Map<string, Stop>;
  metro: MetroData | null;
  /** Nouns with their generated paradigms (content/lexicon/nouns.json). */
  lexicon: Map<string, { noun: Noun; paradigm: Paradigm }>;
  /** Case-lens functions (content/grammar/functions.json). */
  functions: Map<string, GrammarFunction>;
  missionsById: Map<string, { mission: Mission; unitId: string }>;
  /** The first lesson that formally teaches each grammar skill (from grammarRefs, in course order). */
  taughtIn: Map<string, string>;
  /** Guide sections that use each lesson's language (generated from guide.json). */
  guideLinksByLesson: Map<string, { guideId: string; sectionId: string; title: string }[]>;
  namedays: NamedaysData | null;
  /** Czech public holidays (content/calendar/holidays.json). */
  holidays: HolidaysData | null;
  /** Listening scenes (content/overheard/*.json), in order. */
  overheard: OverheardScene[];
  /** Holiday prep mini-lessons, in calendar order. */
  holidayLessons: HolidayLesson[];
  emergency: { numbers: EmergencyNumbers['numbers']; cards: EmergencyCards['cards'] };
  idioms: Idiom[];
  /** Recorded audio by id (content/audio/manifest.json). */
  audio: Map<string, AudioManifest['recordings'][number]>;
  /** Pattern and function SRS keys each exercise practises (from its lens markup). */
  lensKeysByExercise: Map<string, string[]>;
  /** Exercises that practise each pattern/function key. */
  exercisesByLensKey: Map<string, string[]>;
  /** Exercises left out because their recording doesn't exist yet. */
  hiddenExercises: { id: string; audio: string }[];
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
const VERB_EMBED = /```verb\s+([^\n`]+?)\s*```/g;
const GUIDE_EMBED = /```timeline\s+([a-z0-9-]+)\s*```/g;
const METRO_EMBED = /```metro(?:\s+[a-z0-9-]+)?\s*```/g;

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
    alphabet: null,
    guides: [],
    draftGuides: [],
    guidesById: new Map(),
    lines: [],
    linesVerified: null,
    milestones: [],
    stopByUnit: new Map(),
    stopsByKey: new Map(),
    metro: null,
    lexicon: new Map(),
    functions: new Map(),
    missionsById: new Map(),
    taughtIn: new Map(),
    guideLinksByLesson: new Map(),
    namedays: null,
    holidays: null,
    overheard: [],
    holidayLessons: [],
    emergency: { numbers: [], cards: [] },
    idioms: [],
    audio: new Map(),
    hiddenExercises: [],
    lensKeysByExercise: new Map(),
    exercisesByLensKey: new Map(),
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
    if (v.motionPair && !course.verbsByLemma.has(v.motionPair)) {
      errors.push(`verbs: motionPair "${v.motionPair}" of "${v.lemma}" has no entry`);
    }
  }
  for (const v of course.verbs) {
    if (v.family && !course.verbsByLemma.has(v.family)) errors.push(`verbs: family "${v.family}" of "${v.lemma}" has no entry`);
  }
  course.verbs.sort((a, b) => compareCs(a.lemma, b.lemma));

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

    for (const m of unitData.missions) {
      claimId('mission', m.id, unitPath);
      course.missionsById.set(m.id, { mission: m, unitId: unitData.id });
    }

    course.unitsById.set(unit.id, unit);
    course.units.push(unit);
  });

  /* ---- Alphabet ---- */
  if ('alphabet/alphabet.json' in files.json) {
    const data = parse(AlphabetSchema, 'alphabet/alphabet.json', files.json['alphabet/alphabet.json']);
    if (data) {
      const introPath = `alphabet/${data.intro}`;
      const introMd = files.markdown[introPath];
      if (introMd === undefined) errors.push(`alphabet/alphabet.json: intro file ${introPath} not found`);
      const seenLetters = new Set<string>();
      for (const l of data.letters) {
        if (seenLetters.has(l.letter)) errors.push(`alphabet/alphabet.json: duplicate letter "${l.letter}"`);
        seenLetters.add(l.letter);
      }
      for (const set of data.practice) {
        claimId('practice set', set.id, 'alphabet/alphabet.json');
        for (const ex of set.exercises) {
          claimId('exercise', ex.id, 'alphabet/alphabet.json');
          course.exercisesById.set(ex.id, { exercise: ex, source: { kind: 'alphabet', setId: set.id } });
        }
      }
      course.alphabet = { ...data, introMd: introMd ?? '' };
    }
  }

  /* ---- Guides ---- */
  for (const [path, raw] of Object.entries(files.json)) {
    const m = /^guides\/([^/]+)\/guide\.json$/.exec(path);
    if (!m) continue;
    const data = parse(GuideSchema, path, raw);
    if (!data) continue;
    const slug = m[1]!;
    if (course.guidesById.has(data.id)) errors.push(`${path}: duplicate guide id "${data.id}"`);
    const sectionMd: Record<string, string> = {};
    for (const s of data.sections) {
      const md = files.markdown[`guides/${slug}/${s.file}`];
      if (md === undefined) errors.push(`${path}: section file guides/${slug}/${s.file} not found`);
      sectionMd[s.id] = md ?? '';
    }
    for (const set of data.practice) {
      claimId('practice set', set.id, path);
      for (const ex of set.exercises) {
        claimId('exercise', ex.id, path);
        course.exercisesById.set(ex.id, { exercise: ex, source: { kind: 'guide', guideId: data.id, setId: set.id } });
      }
    }
    const guide: Guide = { ...data, slug, sectionMd };
    course.guidesById.set(guide.id, guide);
    course.guides.push(guide);
  }
  course.guides.sort((a, b) => a.order - b.order);
  // Drafts are validated like any guide but not listed for learners.
  course.draftGuides = course.guides.filter((g) => g.draft);
  course.guides = course.guides.filter((g) => !g.draft);
  for (const g of [...course.guides, ...course.draftGuides]) {
    for (const sec of g.sections) {
      for (const lessonId of sec.lessons) {
        if (!course.lessonsById.has(lessonId)) {
          errors.push(`guides/${g.slug}/guide.json: section "${sec.id}" links to unknown lesson "${lessonId}"`);
          continue;
        }
        if (g.draft) continue;
        const links = course.guideLinksByLesson.get(lessonId) ?? [];
        links.push({ guideId: g.id, sectionId: sec.id, title: sec.title });
        course.guideLinksByLesson.set(lessonId, links);
      }
    }
  }

  /* ---- Name days and audio ---- */
  for (const [path, raw] of Object.entries(files.json)) {
    if (!/^overheard\/[^/]+\.json$/.test(path)) continue;
    const scene = parse(OverheardSceneSchema, path, raw);
    if (!scene) continue;
    claimId('overheard scene', scene.id, path);
    for (const q of scene.questions) {
      claimId('exercise', q.id, path);
      course.exercisesById.set(q.id, { exercise: q, source: { kind: 'overheard', sceneId: scene.id } });
    }
    course.overheard.push(scene);
  }
  course.overheard.sort((a, b) => a.order - b.order);
  if ('calendar/holidays.json' in files.json) course.holidays = parse(HolidaysSchema, 'calendar/holidays.json', files.json['calendar/holidays.json']);
  if ('calendar/holiday-lessons.json' in files.json) {
    const where = 'calendar/holiday-lessons.json';
    const data = parse(HolidayLessonsSchema, where, files.json[where]);
    const known = new Set(course.holidays?.holidays.map((h) => h.id) ?? []);
    for (const l of data?.lessons ?? []) {
      claimId('holiday lesson', l.id, where);
      for (const h of l.holidays) if (!known.has(h)) errors.push(`${where}: lesson ${l.id} refers to unknown holiday "${h}"`);
      for (const v of l.vocab) {
        claimId('vocab', v.id, where);
        course.vocabById.set(v.id, { item: v, lessonId: l.id });
      }
      for (const ex of l.exercises) {
        claimId('exercise', ex.id, where);
        course.exercisesById.set(ex.id, { exercise: ex, source: { kind: 'holiday', lessonId: l.id } });
      }
      course.holidayLessons.push(l);
    }
  }
  {
    const nums = files.json['emergency/numbers.json'] ? parse(EmergencyNumbersSchema, 'emergency/numbers.json', files.json['emergency/numbers.json']) : null;
    const cards = files.json['emergency/cards.json'] ? parse(EmergencyCardsSchema, 'emergency/cards.json', files.json['emergency/cards.json']) : null;
    course.emergency = { numbers: nums?.numbers ?? [], cards: cards?.cards ?? [] };
    const known = new Set(course.emergency.numbers.map((n) => n.id));
    for (const c of course.emergency.cards) for (const n of c.numbers) if (!known.has(n)) errors.push(`emergency/cards.json: card ${c.id} uses unknown number "${n}"`);
  }
  if (files.json['idioms/idioms.json']) {
    const data = parse(IdiomsSchema, 'idioms/idioms.json', files.json['idioms/idioms.json']);
    course.idioms = data?.idioms ?? [];
    const seen = new Set<string>();
    for (const i of course.idioms) {
      if (seen.has(i.id)) errors.push(`idioms/idioms.json: duplicate id "${i.id}"`);
      seen.add(i.id);
    }
  }
  if ('calendar/namedays.json' in files.json) course.namedays = parse(NamedaysSchema, 'calendar/namedays.json', files.json['calendar/namedays.json']);
  if ('audio/manifest.json' in files.json) {
    const manifest = parse(AudioManifestSchema, 'audio/manifest.json', files.json['audio/manifest.json']);
    for (const r of manifest?.recordings ?? []) {
      if (course.audio.has(r.id)) errors.push(`audio/manifest.json: duplicate recording "${r.id}"`);
      course.audio.set(r.id, r);
    }
  }

  for (const u of course.units) for (const l of u.lessonList) for (const r of l.grammarRefs) if (!course.taughtIn.has(r)) course.taughtIn.set(r, l.id);

  /* ---- Lines and stations ---- */
  if ('lines/lines.json' in files.json) loadLines(files.json['lines/lines.json']);
  else errors.push('content/lines/lines.json is missing: the course map needs it');

  function loadLines(raw: unknown) {
    const where = 'lines/lines.json';
    const data = parse(LinesSchema, where, raw);
    if (!data) return;
    course.linesVerified = data.verified;
    course.milestones = data.milestones;
    const milestoneIds = new Set(data.milestones.map((m) => m.id));
    const linesAt = new Map<string, LineId[]>();
    for (const l of data.lines) for (const st of l.stops) linesAt.set(st.station, [...(linesAt.get(st.station) ?? []), l.id]);
    const usedStations = new Set<string>();
    for (const l of data.lines) {
      const seen = new Set<string>();
      const stops: Stop[] = [];
      l.stops.forEach((st, i) => {
        const info = data.stations[st.station];
        if (!info) {
          errors.push(`${where}: line ${l.id} stop ${i + 1} uses unknown station "${st.station}"`);
          return;
        }
        if (seen.has(st.station)) errors.push(`${where}: line ${l.id} visits "${st.station}" twice`);
        seen.add(st.station);
        usedStations.add(st.station);
        const stop: Stop = { ...st, line: l.id, position: i + 1, slug: st.station, stationInfo: info, transfers: (linesAt.get(st.station) ?? []).filter((x) => x !== l.id) };
        if (st.kind === 'unit') {
          if (!course.unitsById.has(st.unit)) errors.push(`${where}: line ${l.id} station "${st.station}" refers to unknown unit "${st.unit}"`);
          if (course.stopByUnit.has(st.unit)) errors.push(`${where}: unit "${st.unit}" is placed at two stations`);
          course.stopByUnit.set(st.unit, stop);
        }
        if (st.kind === 'milestone' && !milestoneIds.has(st.milestone.id)) errors.push(`${where}: unknown milestone "${st.milestone.id}" at "${st.station}"`);
        if (st.kind !== 'planned' && l.service !== 'in-service') errors.push(`${where}: line ${l.id} is not in service but "${st.station}" has course content`);
        course.stopsByKey.set(`${l.id}/${st.station}`, stop);
        stops.push(stop);
      });
      course.lines.push({ ...l, stops });
    }
    // Units must sit on the line in course order.
    const unitOrder = course.lines.flatMap((l) => l.stops).flatMap((s) => (s.kind === 'unit' ? [s.unit] : []));
    const courseOrder = course.units.map((u) => u.id);
    if (unitOrder.join() !== courseOrder.filter((u) => unitOrder.includes(u)).join()) errors.push(`${where}: units are not in course.json order along the lines`);
    for (const u of courseOrder) if (!course.stopByUnit.has(u)) errors.push(`${where}: unit "${u}" has no station`);
    for (const slug of Object.keys(data.stations)) if (!usedStations.has(slug)) warnings.push(`${where}: station "${slug}" is not on any line`);
    course.metro = {
      lines: course.lines.map((l) => ({ id: l.id, nickname: l.nickname, stations: l.stops.map((s) => s.stationInfo.name) })),
      notes: Object.fromEntries(Object.values(data.stations).flatMap((s) => (s.aboveGround ? [[s.name, s.aboveGround]] : []))),
      underConstruction: data.underConstruction,
    };
  }

  /* ---- Lexicon, functions and case-lens markup ---- */
  if ('lexicon/nouns.json' in files.json) {
    const lex = parse(LexiconSchema, 'lexicon/nouns.json', files.json['lexicon/nouns.json']);
    for (const noun of lex?.nouns ?? []) {
      if (course.lexicon.has(noun.lemma)) errors.push(`lexicon/nouns.json: duplicate lemma "${noun.lemma}"`);
      const { paradigm, error } = decline(noun, course.tables);
      if (error) errors.push(`lexicon/nouns.json: "${noun.lemma}": ${error}`);
      course.lexicon.set(noun.lemma, { noun, paradigm });
    }
  }
  if ('grammar/functions.json' in files.json) {
    const fns = parse(FunctionsFileSchema, 'grammar/functions.json', files.json['grammar/functions.json']);
    for (const f of fns?.functions ?? []) {
      if (course.functions.has(f.id)) errors.push(`grammar/functions.json: duplicate function "${f.id}"`);
      course.functions.set(f.id, f);
    }
  }

  /** Check every [[form|lemma|case|function]] token in a piece of content. */
  const checkLens = (value: unknown, where: string): void => {
    if (typeof value === 'string') {
      if (!value.includes('[[') && !value.includes(']]')) return;
      const { segments, problems } = parseLens(value);
      for (const p of problems) errors.push(`${where}: ${p}`);
      for (const seg of segments) {
        if (seg.type !== 'lens') continue;
        const fn = course.functions.get(seg.fn);
        if (!fn) errors.push(`${where}: ${seg.raw}: unknown function "${seg.fn}" (see content/grammar/functions.json)`);
        else if (fn.id !== 'chunk' && fn.case !== seg.case) errors.push(`${where}: ${seg.raw}: function "${fn.id}" is for the ${fn.case} case, not ${seg.case}`);
        const entry = course.lexicon.get(seg.lemma);
        if (!entry) {
          errors.push(`${where}: ${seg.raw}: lemma "${seg.lemma}" is not in content/lexicon/nouns.json`);
          continue;
        }
        // A word with a blank ("káv___") is checked per accepted answer in the exercise checks below.
        if (seg.form.includes('___')) continue;
        const cells = cellsOf(entry.paradigm, seg.form).filter((c) => c.startsWith(seg.case) && (!seg.number || c.endsWith(seg.number)));
        if (cells.length === 0) {
          const expected = (['sg', 'pl'] as const)
            .filter((n) => !seg.number || n === seg.number)
            .flatMap((n) => entry.paradigm[`${seg.case}.${n}`] ?? [])
            .join(' / ');
          const msg = `${where}: ${seg.raw}: "${seg.form}" is not the ${seg.case} of "${seg.lemma}" (expected ${expected || 'no such form'})`;
          if (entry.noun.uncertain) warnings.push(msg + '; lexicon entry is marked uncertain');
          else errors.push(msg);
        }
      }
    } else if (Array.isArray(value)) value.forEach((v) => checkLens(v, where));
    else if (value && typeof value === 'object') for (const v of Object.values(value)) checkLens(v, where);
  };
  for (const u of course.units) {
    checkLens({ ...u, lessonList: undefined }, `unit ${u.id}`);
    for (const l of u.lessonList) checkLens(l, `lesson ${l.id}`);
  }
  for (const g of [...course.guides, ...course.draftGuides]) checkLens(g, `guide ${g.id}`);
  if (course.alphabet) checkLens(course.alphabet, 'alphabet');
  for (const sc of course.overheard) checkLens(sc.lines, `overheard ${sc.id}`);

  /* ---- Cross-reference checks ---- */
  for (const [exId, { exercise, source }] of course.exercisesById) {
    const where =
      source.kind === 'lesson'
        ? `lesson ${source.lessonId}`
        : source.kind === 'unitCheck'
          ? `unit ${source.unitId} check`
          : source.kind === 'guide'
            ? `guide ${source.guideId}, set ${source.setId}`
            : source.kind === 'overheard'
              ? `overheard ${source.sceneId}`
              : source.kind === 'holiday'
                ? `holiday lesson ${source.lessonId}`
            : `alphabet set ${source.setId}`;
    for (const p of [...exercise.answers, ...exercise.hints.map((h) => h.wrong)]) {
      const err = validatePattern(p);
      if (err) errors.push(`${where}, exercise ${exId}: ${err}`);
    }
    for (const s of exercise.skills) {
      if (s.startsWith('vocab:') && !course.vocabById.has(s.slice(6))) {
        errors.push(`${where}, exercise ${exId}: skill "${s}" refers to unknown vocab id`);
      }
      if (s.startsWith('guide:') && !course.guidesById.has(s.slice(6))) {
        errors.push(`${where}, exercise ${exId}: skill "${s}" refers to unknown guide`);
      }
    }
    if (exercise.type === 'caseSelect') {
      for (const a of exercise.answers) {
        if (!(exercise.options as string[]).includes(a)) {
          errors.push(`${where}, exercise ${exId}: answer "${a}" is not one of the options`);
        }
      }
    }
    const mustBeOptions = (opts: readonly string[], label: string) => {
      for (const a of exercise.answers) if (!opts.includes(a)) errors.push(`${where}, exercise ${exId}: answer "${a}" is not one of the ${label}`);
    };
    if (exercise.type === 'chooseEnding') mustBeOptions(exercise.options, 'options');
    // A lens word around the blank must be the right case of its lemma for every accepted ending.
    if (exercise.type === 'fillEnding' || exercise.type === 'chooseEnding') {
      for (const seg of parseLens(exercise.prompt).segments) {
        if (seg.type !== 'lens' || !seg.form.includes('___')) continue;
        const entry = course.lexicon.get(seg.lemma);
        if (!entry) continue;
        for (const ending of expandPatterns(exercise.answers)) {
          const form = seg.form.replace('___', ending);
          const ok = cellsOf(entry.paradigm, form).some((c) => c.startsWith(seg.case) && (!seg.number || c.endsWith(seg.number)));
          if (!ok) (entry.noun.uncertain ? warnings : errors).push(`${where}, exercise ${exId}: ${seg.raw} with answer "${ending}" gives "${form}", which is not the ${seg.case} of "${seg.lemma}"`);
        }
      }
    }
    if (exercise.type === 'minimalPair') mustBeOptions(exercise.pair, 'pair');
    if (exercise.type === 'multipleChoice' || (exercise.type === 'readReal' && exercise.options)) {
      mustBeOptions(exercise.options!, 'options');
      if (new Set(exercise.options).size !== exercise.options!.length) errors.push(`${where}, exercise ${exId}: duplicate options`);
      const explained = new Set(exercise.hints.map((h) => h.wrong));
      for (const o of exercise.options!) {
        if (!exercise.answers.includes(o) && !explained.has(o)) errors.push(`${where}, exercise ${exId}: wrong option "${o}" needs an explanation in hints`);
      }
    }
    if (exercise.type === 'aspectChoice') {
      mustBeOptions(exercise.options, 'options');
      const [impf, pf] = exercise.verbs.map((v) => course.verbsByLemma.get(v));
      if (!impf || !pf) errors.push(`${where}, exercise ${exId}: verbs ${exercise.verbs.join(' / ')} must both be in verbs.json`);
      else if (impf.aspect !== 'impf' || pf.aspect !== 'pf' || !impf.partner.includes(pf.lemma)) {
        errors.push(`${where}, exercise ${exId}: ${impf.lemma} / ${pf.lemma} are not an imperfective / perfective pair in verbs.json`);
      }
    }
    if (exercise.type === 'buildSentence') {
      const tiles = new Set(exercise.tiles.map((t) => lensPlain(t).toLocaleLowerCase('cs')));
      for (const ans of expandPatterns(exercise.answers)) {
        const words = ans.toLocaleLowerCase('cs').replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
        const missing = words.filter((w) => !tiles.has(w));
        if (missing.length) errors.push(`${where}, exercise ${exId}: answer "${ans}" uses words that are not tiles: ${missing.join(', ')}`);
      }
    }
    // Minimal pairs need real recordings (a synthetic voice may blur the very contrast they teach);
    // typed listening falls back to the device's Czech voice.
    if (exercise.type === 'minimalPair' && !course.audio.has(exercise.audio)) {
      course.hiddenExercises.push({ id: exId, audio: exercise.audio });
    }
    if (exercise.type === 'speak' && exercise.audio && !course.audio.has(exercise.audio)) {
      warnings.push(`${where}, exercise ${exId}: reference recording "${exercise.audio}" is not in audio/manifest.json yet`);
    }
    if (exercise.type === 'conjugate' && !course.verbsByLemma.has(exercise.verb)) {
      warnings.push(`${where}, exercise ${exId}: verb "${exercise.verb}" is not in the verb lookup`);
    }
  }

  /* ---- Leave out exercises whose recordings don't exist yet (D6) ---- */
  if (course.hiddenExercises.length) {
    const hidden = new Set(course.hiddenExercises.map((h) => h.id));
    const keep = <T extends { id: string }>(list: T[]) => list.filter((e) => !hidden.has(e.id));
    for (const u of course.units) {
      u.check.exercises = keep(u.check.exercises);
      for (const l of u.lessonList) l.exercises = keep(l.exercises);
    }
    for (const g of course.guides) for (const set of g.practice) set.exercises = keep(set.exercises);
    if (course.alphabet) for (const set of course.alphabet.practice) set.exercises = keep(set.exercises);
    for (const id of hidden) course.exercisesById.delete(id);
  }

  /* ---- Pattern / function SRS keys from lens markup ---- */
  for (const [exId, { exercise }] of course.exercisesById) {
    const keys = lensKeys(exercise, course.lexicon);
    if (!keys.length) continue;
    course.lensKeysByExercise.set(exId, keys);
    for (const k of keys) course.exercisesByLensKey.set(k, [...(course.exercisesByLensKey.get(k) ?? []), exId]);
  }

  const checkEmbeds = (md: string, where: string) => {
    for (const m of md.matchAll(TABLE_EMBED)) {
      if (!course.tables.has(m[1]!)) errors.push(`${where}: embedded table "${m[1]}" does not exist`);
    }
    for (const m of md.matchAll(VERB_EMBED)) {
      if (!course.verbsByLemma.has(m[1]!)) errors.push(`${where}: embedded verb "${m[1]}" is not in verbs.json`);
    }
    for (const m of md.matchAll(GUIDE_EMBED)) {
      const g = course.guidesById.get(m[1]!);
      if (!g) errors.push(`${where}: embedded timeline refers to unknown guide "${m[1]}"`);
      else if (!g.timeline?.length) errors.push(`${where}: guide "${m[1]}" has no timeline`);
    }
    if (METRO_EMBED.test(md) && !course.metro) errors.push(`${where}: embeds the metro map but content/lines/lines.json is missing`);
    METRO_EMBED.lastIndex = 0;
  };
  for (const page of course.grammarPages) checkEmbeds(page.body, page.path);
  for (const lesson of course.lessonsById.values()) checkEmbeds(lesson.explanationMd, `lesson ${lesson.id}`);
  if (course.alphabet) checkEmbeds(course.alphabet.introMd, 'alphabet intro');
  for (const g of course.guides) for (const [id, md] of Object.entries(g.sectionMd)) checkEmbeds(md, `guide ${g.id}, section ${id}`);

  for (const lesson of course.lessonsById.values()) {
    for (const ref of lesson.grammarRefs) {
      if (course.grammarPages.length > 0 && !course.grammarBySkill.has(ref)) {
        warnings.push(`lesson ${lesson.id}: grammar page for "${ref}" does not exist yet`);
      }
    }
  }

  return { course, errors, warnings };
}
