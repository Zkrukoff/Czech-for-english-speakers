# Pražák

***Mluv jako Pražák.*** Czech for people who actually live here.

A *Pražák* is a Prague local. Pražák is a web app that teaches Czech to
**English speakers who have moved to Czechia for work**, from absolute beginner towards CEFR A2.

**The course is a metro map.** Prague's three metro lines are the three CEFR
levels: **Linka A** (green) is A1–A2, **B** (yellow) B1–B2, **C** (red) C1–C2.
Units are real stations in their real order (checked against PID open data),
transfer stations are milestones, and a finished station gets an ink stamp on
your ticket. No confetti.

- **No streaks, points, leagues, hearts or guilt notifications.** Progress is
  what you can do: can-do goals passed at each station, stamped tickets and
  missions done in real life.
- **The case lens.** Underlined endings in lessons can be tapped: the case
  (number, name and colour), *why* it's used here, and the model noun (vzor) it
  follows. Every annotated form is checked against generated declensions.
- **Cases by function, in order of usefulness** (nominative → accusative →
  locative → genitive → instrumental → dative → vocative), with early
  survival phrases flagged as "learn it as a phrase for now".
- **Vzory, aspect pairs, motion verbs, numbers**: each model noun has a page
  and a drill; aspect is taught in pairs; motion verbs live in the transit guide;
  *1 pivo, 2 piva, 5 piv* is its own skill.
- **Vykání and tykání** as a social skill, including *Můžeme si tykat?*
- **Spoken Czech**: "how Pražáci actually say it" notes (*dobrej, mlíko, seš*).
- **Typed answers that explain mistakes**: the wrong ending underlined, the
  right one shown, and the case lens explaining why.
- **Spaced repetition (FSRS)** for words, exercises, *ending patterns* and
  *case uses*.
- **Pronunciation with real speakers only** for core sounds (recordings pending:
  see [docs/AUDIO.md](docs/AUDIO.md)).
- **Today's name day** (*Dnes má svátek…*) on the home screen.
- **Guides linked to lessons**: Doprava (Prague transport), Kultura (culture,
  history, holidays) and Zabydlení (settling in), each linking the lessons that
  teach their Czech.

Live: https://zkrukoff.github.io/Czech-for-english-speakers/ (moving to
`https://zkrukoff.github.io/prazak/` when the repo is renamed; see
[deploy/legacy-redirect](deploy/legacy-redirect/README.md)).

**Naming:** the display name is always *Pražák*, with both diacritics. Code
identifiers, file names, package names, database names and URLs use the ASCII
form `prazak`.

The redesign is planned in [docs/PLAN.md](docs/PLAN.md), from the brief in
[docs/PRAZAK_BRIEF.md](docs/PRAZAK_BRIEF.md).

## Course

Linka A, west to east (station: content):

| # | Station | Content |
|---|---|---|
| 1 | Nemocnice Motol | Pronunciation and the alphabet |
| 2 | Petřiny | Unit 1 · Meeting people at work |
| 3 | Nádraží Veleslavín | Unit 2 · Coffee and lunch near the office |
| 4 | Bořislavka | Unit 3 · Getting around and commuting |
| 5 | Dejvická | Unit 4 · People at work |
| 6 | Hradčanská | Unit 5 · Vy, or ty? |
| 7–8 | Malostranská, Staroměstská | *výluka*: still being written |
| 9–10 | Můstek, Muzeum | **Václavák**: review, then the A1 can-do check |
| 11–17 | Náměstí Míru … Depo Hostivař | *výluka*; Depo Hostivař is the A2 check |

Lines B and C are on the map but not yet in service. The grammar reference
(cases, vzory, aspect pairs, numbers) and the verb lookup are available at any time.

| Guide | Contents |
|---|---|
| **Kultura**: Czech culture and traditions | Everyday life and work, history and where to see it in Prague, holidays; phrase practice |
| **Doprava**: Getting around Prague | The metro map, tickets, signs and announcements, motion verbs and aspect in context |
| **Zabydlení**: Settling in | The flat, offices, bank and bills, doctors and pharmacies, post; no legal advice |

Transport prices, free travel and the Petřín funicular were checked against
pid.cz on 17 November 2026. Re-check them yearly.

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

The design system, its rules and its tests are in **[docs/DESIGN.md](docs/DESIGN.md)**,
and everything is visible at **`/styleguide`**: tokens (in one file, enforced
by a no-hex test), four Czech-complete fonts (tested with the pangram), contrast
checked in both themes (*noční tramvaj* is the dark mode), the case lens, the
strip map, stamps and tickets. Phone first (375 px), keyboard accessible,
reduced-motion safe, Lighthouse accessibility 100.

## Project layout

```
content/              course content (JSON + Markdown). See content/SCHEMA.md
  lines/              the course map (lines, stations, milestones)
  lexicon/            nouns for the case lens
  grammar/            case pages, tables, functions.json (why a case is used)
  calendar/           name days (bundled, with source and licence)
  audio/              manifest of real-speaker recordings
docs/                 brief, plan, design system, audio guide
scripts/              pid_stations.py: re-check stations against PID open data
public/audio/         recordings listed in content/audio/manifest.json
src/
  content/            schemas (zod), loader, cross-reference and lens checks
  lib/lens/           lens markup parser, declension generator, SRS keys
  lib/drills/         number and vzor drills generated from the lexicon
  lib/answers/        answer patterns and answer checking
  lib/srs/            FSRS scheduler wrapper, review items
  db/                 IndexedDB (Dexie v2): progress, reviews, profile, missions, stamps
  components/         design-system components (ui/, icons/, brand/)
  features/           screens: home, line, onboarding, lessons, lens, review,
                      grammar, verbs, guides, progress (wallet), settings, styleguide
tests/                Vitest (content, lens, contrast, fonts, no-hex, migration, progress survival…)
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

### Offline check

The build ships a small service worker (`build/serviceWorker.ts`) that precaches
the app, so the emergency cards work without a signal. To check it:

```bash
npm run build && npm run check:offline
```
