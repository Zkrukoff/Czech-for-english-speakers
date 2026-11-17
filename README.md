# Pražák

***Mluv jako Pražák.*** Czech for people who actually live here.

A *Pražák* is a Prague local. Pražák is a web app that teaches Czech to
**English speakers who have moved to Czechia for work**, from absolute beginner towards CEFR A2. Lessons are set in the
situations of a working week: meeting colleagues and your manager, coffee and
the daily lunch menu, paying with meal vouchers, the commute, describing the
people around you, spelling your name at an office. It is built around
fluency rather than gamification:

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
- **The whole alphabet**: all 42 letters with sounds, letter names and the
  Czech phone-spelling alphabet, plus practice in reading rules and in
  spelling names and e-mail addresses.
- **Guides to life in Czechia**: Czech culture, history and holidays (with
  holiday phrases to practise), and a complete guide to Prague's public
  transport with the Czech signs and announcements you'll meet.

Live: https://zkrukoff.github.io/Czech-for-english-speakers/ (moving to
`https://zkrukoff.github.io/prazak/` when the repo is renamed; see
[deploy/legacy-redirect](deploy/legacy-redirect/README.md)).

**Naming:** the display name is always *Pražák*, with both diacritics. Code
identifiers, file names, package names, database names and URLs use the ASCII
form `prazak`.

The redesign is planned in [docs/PLAN.md](docs/PLAN.md), from the brief in
[docs/PRAZAK_BRIEF.md](docs/PRAZAK_BRIEF.md).

## Course

| | Unit | Situations |
|---|---|---|
| | **Alphabet** | Letters and sounds, reading rules, spelling on the phone |
| 1 | Meeting people at work | First days in the office: greetings, ty/vy, introductions, where you're from, addressing people |
| 2 | Coffee and lunch near the office | Ordering, the daily lunch menu, prices, the bill, meal vouchers |
| 3 | Getting around and commuting | Directions, trams and trains, where you are, tickets and passes |
| 4 | People at work | Appearance, personality, family and age, introducing your team |

The grammar reference (seven cases, declension tables) and the verb track
(ten topics, 80+ verbs) are available at any time.

| Guide | Contents |
|---|---|
| **Czech culture and traditions** | Everyday life and work (greetings, titles, e-mails, name days, homes, humour); history from Great Moravia to the EU and where to see it in Prague; all 13 public holidays, Christmas and Easter traditions; phrase practice for each |
| **Getting around Prague** | Metro, trams, buses, trolleybuses, trains, ferries, funicular, night lines, the airport; tickets, validation, inspectors and etiquette; signs and announcements in Czech; station names in their declined forms; journey planning and closures |

The transport guide's prices and lines were checked against pid.cz in
November 2026 and link to their sources; re-check them yearly.

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

## Design

The look, tone and interaction rules are in **[docs/DESIGN.md](docs/DESIGN.md)**.
The frame takes its identity from Prague: the metro line colours, the
"bubble" wall panels of the metro stations, departure boards, units drawn as
metro lines with lessons as stops, and a bold display typeface. The learning
itself stays calm: Czech in its own serif, colour for grammar only in tables,
light and dark themes, and full support for reduced motion.

Interactive pieces: a scroll-driven history timeline (culture guide) and an
interactive metro map with all 61 stations (transport guide).

## Project layout

```
content/              course content (JSON + Markdown), incl. alphabet/ and guides/. See content/SCHEMA.md
docs/DESIGN.md        design guide
scripts/              build helpers (dark-mode palette generator)
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
`dialogueComplete`, and `question` (a general typed question, used by the
alphabet section). The alphabet lives in `content/alphabet/alphabet.json` and
`intro.md`.

### Writing for the audience

Set dialogues in the places expats actually are: the office, the team lunch,
the tram, the bakery on the way to work, the foreign police, the doctor.
Prefer vocabulary they'll need this month (*kolega, stravenka, polední menu,
předplatní jízdenka*) and explain the cultural context too (when to switch
from *vy* to *ty* at work, how tipping works).

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

**Data**: stored in IndexedDB (database `prazak`) in the learner's browser.
Settings has download/restore (JSON) and reset. Before the rename the database
was called `czech-for-english-speakers`; on first load the app copies its data
into `prazak` once and never deletes the old one (`src/db/migrate.ts`). Old
backup files still restore.

## Native review status

All Czech content was written carefully but **has not yet been checked by a
native speaker**; it is all marked `"nativeReviewed": false` and labelled in
the app. `content/REVIEW_NEEDED.md` lists the specific sentences and claims
that most need checking. When an item is verified, set `nativeReviewed` to
`true` on it and remove it from that list.
