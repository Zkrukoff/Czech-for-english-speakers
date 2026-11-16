# Čeština for English speakers

A web app that teaches Czech to native English speakers, from absolute
beginner towards CEFR A2. It is built around fluency rather than gamification:

- **No streaks, points, leagues, hearts or guilt notifications.** Progress is
  what you can do: can-do goals passed in unit checks, and how accurately you
  use each case and verb topic.
- **Natural Czech only.** Every sentence is meant to be something a native
  speaker would say. Spoken Czech (obecná čeština) is labelled where learners
  will hear it. All content is marked as not yet native-reviewed until it is.
- **Real grammar explanations** for English speakers: a page for each of the
  seven cases, full declension tables with colour-coded endings, and a verb
  track (conjugation classes, aspect, motion, reflexives, modals, imperative,
  conditional) with a searchable verb lookup.
- **Typed answers that explain mistakes.** Diacritics are tolerated (flagged)
  by default, and wrong answers say *why* ("After do, use the genitive: do Prahy").
- **Spaced repetition (FSRS)** scheduled from the learner's actual answers.

Everything runs in the browser. Learner data is stored locally in IndexedDB;
there is no backend and no account.

## Setup

Requires Node.js 22.12 or newer (Vitest needs it; Vite alone runs on 20.19+).

```bash
npm install
```

```bash
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload (content edits reload too) |
| `npm test` | Unit tests, including validation of all course content |
| `npm run build` | Type-check and build a static site into `dist/` |
| `npm run preview` | Serve the built site locally |

The build is a static single-page app: deploy `dist/` to any static host,
configured to serve `index.html` for unknown paths. Set `BASE_PATH` when
building if the app is served from a sub-path (e.g. `BASE_PATH=/my-app/ npm run build`).

### GitHub Pages

`.github/workflows/deploy.yml` tests, builds and deploys the app on every push
to `main` (or manually from the Actions tab). It builds with
`BASE_PATH=/<repo-name>/` and copies `index.html` to `404.html` so deep links
work. One-time setup in the repository: **Settings → Pages → Build and
deployment → Source: GitHub Actions**. (Pages for a private repository needs a
paid GitHub plan; on a free plan, make the repository public.)

## Project layout

```
content/              course content (JSON + Markdown). See content/SCHEMA.md
public/audio/         recorded audio (optional, replaces text-to-speech per item)
src/
  content/            schemas (zod), loader, cross-reference checks
  lib/answers/        answer patterns and answer checking
  lib/srs/            FSRS scheduler wrapper, review items
  lib/progress/       mastery calculation
  lib/audio/          speech abstraction (Web Speech now, recordings later)
  lib/verbs.ts        verb form generation and search
  db/                 IndexedDB (Dexie): settings, answers, review cards, progress
  components/         shared UI (tables, markdown, badges…)
  features/           pages: lessons, exercises, grammar, verbs, review, progress, settings
tests/                Vitest
```

## How to add a lesson

Content is data only; no code changes are needed.

1. **Create the folder** `content/units/<unit>/lessons/<NN-slug>/` with
   `lesson.json` and `explanation.md`. Copying an existing lesson is the
   quickest start.
2. **Fill in `lesson.json`**: a unique `id` (`u02-l05`), `title`, the unit
   goals it supports (`canDo`), `grammarRefs`, `vocab`, a `dialogue` and
   `exercises`. Set `"nativeReviewed": false` on everything.
3. **Write `explanation.md`**: a short grammar explanation for English
   speakers. You can embed tables and conjugations (see SCHEMA.md).
4. **Register it**: add the folder name to `lessons` in the unit's `unit.json`.
5. **If it introduces a new goal**, add it to the unit's `canDo` and add at
   least one unit-check exercise with that `goalId`.
6. **Add doubtful sentences** to `content/REVIEW_NEEDED.md`.
7. **Run `npm test`.** It checks the schema, ids, cross-references, that
   every accepted answer is marked correct, and that every hint triggers.
   In `npm run dev`, any content error is shown in the browser.

A **new unit** is the same: create `content/units/<NN-slug>/unit.json` with
its goals, lessons and unit check, and add the folder name to
`content/course.json`.

### Writing good exercises

- Put the most natural answer first; it's the one shown by default.
- Use patterns to accept every natural variant: `"Dám si {kávu|kafe}[, prosím]."`
- `why` must explain the rule, not just repeat the answer.
- Add `hints` for the mistakes English speakers really make
  (nominative instead of genitive, `ty` vs `vy`, `jít` vs `jet`…).
- Tag `skills` accurately: they drive the review queue and the mastery bars.
- Use `diacriticsMatter: true` when a missing accent makes a different word.

## Content schema

The full reference is in **[content/SCHEMA.md](content/SCHEMA.md)**. In short:

| File | Holds |
|---|---|
| `course.json` | Unit order |
| `units/*/unit.json` | Title, situation, can-do goals, lesson order, unit check |
| `units/*/lessons/*/lesson.json` | Vocabulary, dialogue, exercises |
| `units/*/lessons/*/explanation.md` | The lesson's grammar explanation |
| `grammar/cases/*.md`, `grammar/verbs/*.md` | Reference pages, with frontmatter |
| `grammar/tables/*.json` | Declension tables (`"stem|ending"` cells) |
| `verbs/verbs.json` | Verb lookup: conjugation, aspect partners |

Exercise types: `translate`, `fillEnding`, `caseSelect`, `conjugate`,
`dialogueComplete`.

## How it works

**Answer checking** (`src/lib/answers/check.ts`): answers are normalised
(case, punctuation, spacing, Unicode). An exact match is correct. A match
that differs only in diacritics is accepted with the differing letters
highlighted, or counted wrong if the learner chose "require exact diacritics"
in Settings or the exercise sets `diacriticsMatter`. Known wrong answers get
their specific explanation; anything else gets the exercise's `why`.

**Spaced repetition** (`src/lib/srs/scheduler.ts`, using
[ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)): every exercise
answered in a lesson or unit check becomes a review card, and so does the
vocabulary it practises. A lesson's vocabulary is added when its practice is
finished. Grades come from the answer: correct → Good, diacritics slip → Hard,
wrong → Again. A wrong answer comes back after 10 minutes; correct answers
come back after growing intervals (about 2, 11, 46, 160 days…). Only the
first try in a session is graded.

**Mastery** (`src/lib/progress/mastery.ts`): for each case and verb topic,
the last 20 answers that use it. "Mastered" means at least 8 answers with
85% or more right. Early mistakes stop counting once you improve, and
mastery can be lost if recent answers go wrong.

**Audio** (`src/lib/audio/speech.ts`): components call one `speech.speak()`
interface. It plays `public/audio/<id>.mp3` when a content item has an
`audio` id and the file exists, and otherwise uses the browser's cs-CZ
text-to-speech voice. Listen buttons are hidden if the browser has no
Czech voice.

**Data**: stored in IndexedDB in the learner's browser. Settings has
download/restore (JSON) and reset.

## Native review status

All Czech content was written carefully but **has not yet been checked by a
native speaker**; it is all marked `"nativeReviewed": false` and labelled in
the app. `content/REVIEW_NEEDED.md` lists the specific sentences and claims
that most need checking. When an item is verified, set `nativeReviewed` to
`true` on it and remove it from that list.
