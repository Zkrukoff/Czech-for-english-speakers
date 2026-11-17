# Content schema

All course content lives in `/content` as JSON and Markdown. The app validates
everything on load (see `src/content/schema.ts`, the source of truth for this
document). In development, a content error replaces the app with a list of
problems and their file paths; `npm test` fails on the same errors.

```
content/
├── course.json                      unit order
├── units/<unit-slug>/
│   ├── unit.json                    goals, lesson order, unit check
│   └── lessons/<lesson-slug>/
│       ├── lesson.json              vocab, dialogue, exercises
│       └── explanation.md           grammar explanation (Markdown)
├── grammar/
│   ├── overview/*.md                general pages ("How Czech cases work")
│   ├── cases/*.md                   one page per case
│   ├── verbs/*.md                   one page per verb topic
│   └── tables/*.json                declension tables
├── verbs/verbs.json                 the verb lookup
├── alphabet/
│   ├── alphabet.json                letters + practice sets
│   └── intro.md                     pronunciation guide
├── guides/<guide-slug>/
│   ├── guide.json                   sections, phrasebook, practice, sources
│   └── *.md                         one Markdown file per section
├── REVIEW_NEEDED.md                 items for a native speaker to check
└── SCHEMA.md                        this file
```

## Native review

**Every piece of Czech content has `"nativeReviewed": false|true`** (lessons,
vocabulary items, dialogue lines, exercises, units, tables, verbs, grammar
pages). It is required: content without it is rejected. Set it to `true` only
after a native speaker has checked that item. Anything `false` shows a
"Not yet native-reviewed" label. List doubtful items in `REVIEW_NEEDED.md`.

## Ids and skills

- Ids use lowercase letters, digits and hyphens. Conventions:
  units `u03`, lessons `u03-l02`, exercises `u03-l02-e5`, unit-check
  exercises `u03-c4`, goals `u03-g2`, vocabulary `v-<word>`.
- Exercise and vocabulary ids must be unique across the whole course: they
  are the keys for the learner's review history. **Don't rename an id once
  published**, or learners lose that item's history.
- **Skill tags** link exercises to grammar topics and vocabulary:
  - `alphabet`: alphabet and pronunciation practice
  - `guide:<guide id>`: practice belonging to a guide (must exist)
  - `case:<case>`: nominative, genitive, dative, accusative, vocative, locative, instrumental
  - `verb:<topic>`: present-classes, irregulars, past, aspect, future, motion, reflexive, modals, imperative, conditional
  - `vocab:<vocab id>`: must exist in some lesson's `vocab`

  Grammar skills drive the mastery bars on the progress page; vocab skills
  also schedule that word for review when the exercise is answered.

## course.json

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `units` | string[] | Unit folder names, in order |

## unit.json

| Field | Type | Notes |
|---|---|---|
| `id` | id | e.g. `u02` |
| `title` | string | English title |
| `titleCs` | string? | Czech title, e.g. "V kavárně" |
| `situation` | string | One sentence describing the real-life situation |
| `canDo` | `{id, text}[]` | Goals, phrased "You can…" |
| `lessons` | string[] | Lesson folder names, in order |
| `missions` | Mission[] | Real-world tasks for this station: `{id, title, task, phrases: {cs, en}[], ifStuck?, nativeReviewed}`. Learners tick them off themselves |
| `check.passRatio` | number | Default 0.8. Share of a goal's check items needed to complete it |
| `check.exercises` | Exercise[] | Each needs a `goalId`; every goal needs at least one |
| `nativeReviewed` | boolean | |

## lesson.json

| Field | Type | Notes |
|---|---|---|
| `id` | id | e.g. `u02-l03` |
| `title` | string | |
| `canDo` | string[] | Goal ids of the unit this lesson works towards |
| `explanation` | string | Markdown file name, default `explanation.md` |
| `grammarRefs` | skill[] | Grammar pages linked from the lesson |
| `grammarPreview` | skill[] | Grammar met here only as fixed phrases before it's taught (e.g. *Jsem z Anglie* in unit 1). The case lens says where it's taught properly. Cases must be formally taught (`grammarRefs`) in the order nominative → accusative → locative → genitive → instrumental → dative → vocative; a test checks it |
| `vocab` | VocabItem[] | |
| `dialogue` | `{setting?, lines: DialogueLine[]}` | |
| `exercises` | Exercise[] | At least one |
| `nativeReviewed` | boolean | |

### VocabItem

| Field | Type | Notes |
|---|---|---|
| `id` | id | `v-…`, unique in the course |
| `cs` | string | Czech. `"a / b"` pairs (e.g. `"učitel / učitelka"`) are accepted as either form in reviews; text in `(…)` is ignored when checking |
| `en` | string | English gloss. Separate meanings with `;` |
| `pos` | enum | noun, verb, adj, adv, pron, prep, conj, num, phrase, particle, interj |
| `gender` | enum? | `m-anim`, `m-inan`, `f`, `n` |
| `genitive` | string? | Shown next to the word, e.g. "z Prahy" |
| `aspect` / `partner` | enum? / string? | For verbs: `impf`, `pf`, `bi` and the aspect partner |
| `spoken` | `{form, note?}`? | The obecná čeština form learners will hear |
| `notes` | string? | |
| `audio` | string? | Recorded file id in `public/audio/` (without `.mp3`) |
| `nativeReviewed` | boolean | |

Entries whose `cs` contains `", "` (lists like the numbers) are shown in the
lesson but not turned into review flashcards.

### DialogueLine

`{ speaker, cs, en, spoken?, audio?, nativeReviewed }`. Write dialogues a
native speaker would actually have; put colloquial versions in `spoken`.

### Exercise

Common fields:

| Field | Type | Notes |
|---|---|---|
| `id` | id | Unique in the course |
| `type` | enum | See below |
| `answers` | pattern[] | Accepted answers (see *Answer patterns*) |
| `why` | string | **Required.** Explains the rule, shown for any wrong answer |
| `hints` | `{wrong, explain}[]` | Specific wrong answers (patterns) with a targeted explanation |
| `skills` | skill[] | At least one |
| `diacriticsMatter` | boolean? | Missing diacritics always count as wrong (e.g. *byt* vs *být*) |
| `goalId` | string? | Required in unit checks |
| `nativeReviewed` | boolean | |

Types:

| `type` | Extra fields | What the learner does |
|---|---|---|
| `translate` | `direction`: `en-cs` or `cs-en`; `prompt` | Types a translation |
| `fillEnding` | `prompt` containing `___` right after the stem (`"Dám si káv___"`); `base?` (dictionary form); `en?` | Types the ending, or the whole word |
| `caseSelect` | `prompt` with the word in `**bold**`; `question`; `options` (case names); `en?` | Picks the case. `answers` = `["genitive"]` |
| `conjugate` | `verb` (should be in verbs.json); `person?` (`1sg`…`3pl`); `tense?`; `prompt` with `___`; `en?` | Types the verb form |
| `dialogueComplete` | `context: {speaker, cs, en?}[]`; `prompt` (English instruction) | Types the reply |
| `question` | `prompt` (English, `**bold**` allowed); `cs?` (Czech text shown large with a listen button); `speak?` (what the listen button says, if different); `answerLang`: `cs` (default) or `en` | Types an answer to a free-form question |
| `listenType` | `audio` (recording id); `cs` (what is said); `en?` | Hears a real recording and types it. **Hidden until the recording is in `audio/manifest.json`** |
| `chooseEnding` | `prompt` with `___` after the stem; `options` (2–5 endings, `""` for none); `base?`; `en?` | Picks the ending. `answers` ⊂ `options` |
| `buildSentence` | `prompt` (English meaning); `tiles` (words, may include distractors) | Taps tiles in order. Every word of every answer must be a tile |
| `aspectChoice` | `prompt` with `___`; `options`: [impf form, pf form]; `verbs`: [impf, pf] infinitives | Picks the aspect. `verbs` must be partners in verbs.json |
| `minimalPair` | `pair` [word, word]; `audio` (recording of one of them); `sound` (e.g. "ř / ž") | Picks the word heard. **Hidden until the recording exists** |
| `speak` | `cs`; `en`; `audio?` (reference recording); `focus?` (what to listen for) | Records themself in the browser, compares, judges themself. Nothing is uploaded. `answers` may be empty |
| `readReal` | `realia: {kind: sign/menu/announcement/timetable/form/message, title?, lines[]}`; `prompt` (English question); `answerLang` (`en` default) | Reads a real-world text (recreated in our style, no real logos) and answers |

### Case-lens markup

Any Czech string (dialogue lines, prompts, examples, phrases, realia) can mark
words with the case they're in and **why**:

```
Dám si [[kávu|káva|acc|object]], prosím.
         form  lemma case function
```

- `case` is `nom gen dat acc voc loc ins`, optionally with a number: `acc.pl`.
- `function` is an id from `grammar/functions.json` and must belong to that case
  (except `chunk`: a fixed phrase whose grammar is taught later, D9).
- The lemma must be in `lexicon/nouns.json`, and the form must be that case of
  the lemma. Forms are generated from the noun's vzor table, so a wrong ending
  is a content error (only a warning for nouns marked `uncertain`).
- Readers never see the markup; the lens and review use it. Each annotated word
  also schedules review of its ending pattern (`pattern:<vzor>:<case>.<number>`)
  and its function (`fn:<id>`).

### Answer patterns

- `[text]`: optional, as in `"Dám si čaj[, prosím]."`
- `{a|b}`: alternatives, as in `"Dám si {kávu|kafe}."`
- They nest: `"{Dám si|Chtěl[a] bych} kávu."`

Answers are compared ignoring case, punctuation and extra spaces. Missing or
wrong háčky/čárky are accepted with a warning unless the learner has turned on
strict diacritics or the exercise sets `diacriticsMatter`. The first expansion
of the first pattern is the answer shown by default, so put the most natural
answer first. Hints are checked before the diacritics tolerance, so a hint like
`"Dám si káva."` also catches `"Dam si kava"`.

`npm test` checks that every accepted answer is marked correct and that every
hint triggers its own explanation.

## Grammar pages (Markdown)

Frontmatter (simple `key: value` lines):

```
---
id: genitive              # URL: /grammar/genitive or /verbs/<id>
title: Genitive (2. pád)
kind: case                # case | verb-topic | other
skill: case:genitive      # the skill this page explains (one page per skill)
order: 2
summary: One line shown in lists.
nativeReviewed: false
---
```

Markdown (GitHub-flavoured, with tables) plus two embeds:

- a fenced block with the info string `table noun-zena` embeds a declension table
- a fenced block with the info string `verb jít` embeds a verb's present tense from verbs.json

````
```table noun-zena
```
````

Links starting with `/` are in-app links: `[genitive](/grammar/genitive)`.
Lesson `explanation.md` files use the same Markdown and embeds.

## Declension tables (`grammar/tables/*.json`)

```json
{ "tables": [{
  "id": "noun-zena", "title": "žena", "group": "nouns",
  "subtitle": "feminine · hard (-a)",
  "columns": ["singular", "plural"],
  "rows": [{ "case": "nom", "forms": ["žen|a", "žen|y"] }, …],
  "notes": ["…"],
  "nativeReviewed": false
}] }
```

Each form is `stem|ending`; the ending is coloured by the row's case. Use
`" / "` between alternatives (`"pán|ovi / pán|u"`) and an empty ending for
zero endings (`"žen|"`). Forms without `|` are shown uncoloured (pronouns).
Every row needs one form per column.

## Alphabet (`alphabet/alphabet.json`)

```json
{
  "intro": "intro.md",
  "letters": [{
    "letter": "č", "upper": "Č", "name": "čé", "group": "consonant",
    "sound": "like the \"ch\" in \"church\"", "ipa": "tʃ",
    "example": { "cs": "čaj", "en": "tea" },
    "spellingWord": "Čeněk", "tip": "…", "loanOnly": false,
    "nativeReviewed": false
  }],
  "practice": [{ "id": "alphabet-sounds", "title": "…", "description": "…", "exercises": [ … ] }],
  "nativeReviewed": false
}
```

Letters are listed in Czech alphabetical order (*ch* after *h*). `name` is
how the letter is said when spelling aloud; `spellingWord` is its word in the
traditional phone-spelling alphabet ("Č jako Čeněk"). Practice exercises are
ordinary exercises (usually `question`) with the skill `alphabet`. Set
`diacriticsMatter: true` where the diacritic is the point of the question.

## Guides (`guides/<slug>/guide.json`)

Guides cover life in Czechia beyond the lessons (culture, Prague transport…).
Each one is a set of Markdown sections shown as tabs, an optional phrasebook
and optional practice sets.

| Field | Type | Notes |
|---|---|---|
| `id` | id | URL: `/guides/<id>` |
| `title`, `titleCs?`, `summary` | string | |
| `order` | number | Position on the guides page |
| `sections` | `{id, title, file, lessons?}[]` | Markdown files next to guide.json, shown as tabs in order. `lessons`: ids of lessons that teach this section's language (back-links on lessons are generated) |
| `draft` | boolean? | Validated and reachable by URL, but not listed for learners yet |
| `phrasebook` | `{id, title, intro?, phrases: {cs, en, note?, spoken?, nativeReviewed}[]}[]` | Shown on a "Phrases" tab with listen buttons |
| `practice` | PracticeSet[] | As in the alphabet; tag every exercise with `guide:<id>` |
| `sources` | `{title, url}[]` | Official sources for facts that change |
| `lastChecked` | string? | When prices, lines etc. were last checked, e.g. "November 2026" |
| `nativeReviewed` | boolean | |

Optional interactive data:

- **`timeline`**: `{id, year, title, titleCs?, summary, significance, place?, nativeReviewed}[]`,
  shown where a section contains a fenced block with the info string `timeline <guide id>`.
  `summary` is always visible; `significance` ("why it matters") and `place`
  ("see it in Prague") open as the event scrolls into focus.
- **The metro map** is drawn from `lines/lines.json` wherever a section
  contains a fenced block with the info string `metro network`.

Link to a guide tab from Markdown with `/guides/<id>?tab=<section id>`
(or `phrases` / `practice`). Put prices, line numbers and timetables only in
guides with `sources` and `lastChecked`, and re-check them at least yearly.

## Verbs (`verbs/verbs.json`)

| Field | Type | Notes |
|---|---|---|
| `lemma` | string | Infinitive including `se`/`si` (`"učit se"`) |
| `en` | string | |
| `aspect` | `impf` / `pf` / `bi` | |
| `partner` | string[] | Aspect partners (should have their own entries) |
| `class` | string | Conjugation class label |
| `reflexive` | `se` / `si`? | Added automatically to generated forms |
| `present` | `{1sg…3pl}` | Present forms without se/si. Alternatives: `"píšu / píši"` |
| `past` | `{m, f, n, mpl, fpl}` | l-participles |
| `imperative` | `{2sg, 1pl, 2pl}`? | |
| `future` | `{1sg…3pl}`? | Only for irregular futures (`budu`, `půjdu`, `pojedu`) |
| `motion` / `motionPair` | enum? / string? | `determinate` / `indeterminate` and the other verb of the pair |
| `family` | string? | Motion-verb family: the base verb (`jít` for `chodit`, `přijít`, `odcházet`…) |
| `topics` | string[] | Verb topics for the "related topics" links |
| `notes`, `spoken` | | |
| `nativeReviewed` | boolean | |

The verb page builds the past, future (`budu` + infinitive for
imperfectives, present forms for perfectives), conditional and reflexive
forms from these fields.

## Lines and stations (`lines/lines.json`)

The course map, and the single source of station data (the metro map uses it
too). Lines A, B and C are CEFR levels A1–A2, B1–B2 and C1–C2.

| Field | Notes |
|---|---|
| `verified` | `{source, date, note?}`: when names and order were last checked against PID open data with `scripts/pid_stations.py` |
| `milestones` | `{id, name, en, summary, level}[]`, e.g. *Václavák* |
| `lines[]` | `{id, nickname, levels, service: in-service / not-yet, stops[]}`; stops in riding order |
| `stops[]` | `{station, kind}` where kind is `pronunciation`, `unit` (+ `unit` id), `milestone` (+ `milestone: {id, part: review/check, level}`) or `planned` (shown as *výluka*) |
| `stations` | Keyed by ASCII slug (also the URL: `/line/A/<slug>`): `{name, tile: "01"…"24", aboveGround?, status?: {note, checked}}` |

Units must appear along the lines in `course.json` order, each exactly once.
To re-check stations: download `https://data.pid.cz/PID_GTFS.zip` and run
`python3 scripts/pid_stations.py PID_GTFS.zip --check`.

## Lexicon (`lexicon/nouns.json`)

`{lemma, en, gender, vzor, stem?, number?: sg/pl, forms?, uncertain?, note?, nativeReviewed}`.
`vzor` is a noun table id (`noun-zena`…) or `irregular` (then `forms` lists all
14 cells, e.g. `"gen.pl": "přátel"`). For regular nouns, `forms` only overrides
cells the rules can't predict: mobile *e* in the genitive plural (`zastávek`),
*-é* plurals (`učitelé`), irregular vocatives (`synu`). `stem` is the oblique
stem when it differs (`lístek` → `lístk`). See `src/lib/lens/decline.ts` for
the rules applied.

## Case functions (`grammar/functions.json`)

`{id, case, label, explain, example: {cs, en}, triggers?}`: the controlled list
of reasons a case is used (`after-z`, `location-v-na`, `with-s`, `quantity-5plus`…).

## Name days (`calendar/namedays.json`)

`{source: {title, url, licence, retrieved}, verify: {date, note}[], days: {"MM-DD": names[]}}`.
Bundled (no network use). Days listed in `verify` need a native speaker's check.

## Audio (`audio/manifest.json`)

Real-speaker recordings: `{id, file, cs, speaker, licence}[]`, files in
`public/audio/`. See `docs/AUDIO.md`.

