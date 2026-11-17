# Pražák: audit and plan

Plan for [PRAZAK_BRIEF.md](PRAZAK_BRIEF.md). Written 17 November 2026 on branch
`redesign/prazak`. **No code has been changed yet.** The decisions in section 2
need your answers before phase 1 starts.

---

## 1. Audit

### 1.1 Stack

| Area | What's there |
|---|---|
| App | React 19 + TypeScript 5.9, built with Vite 8. Single-page app, no backend, no accounts |
| Routing | React Router 7, lazy-loaded routes (`src/routes.tsx`), `basename` from Vite's `BASE_URL` |
| Styling | Tailwind CSS v4 (CSS-first). Tokens in `@theme` in `src/index.css`; utility classes inline in components; a few shared classes (`.btn`, `.card`, `.board`, `.chip`, `.marker`, `.prose-cz`). No component library |
| Dark mode | `scripts/gen-dark-palette.mjs` generates `src/styles/dark-palette.css` by mirroring Tailwind's colour scales; theme choice in `localStorage` (`theme`) |
| Fonts | Self-hosted via `@fontsource-variable`: Inter (UI), Bricolage Grotesque (display), Source Serif 4 (all Czech text, via `:lang(cs)`) |
| Learner data | IndexedDB via Dexie 4, database `czech-for-english-speakers`, schema version 1 |
| Content | JSON + Markdown in `/content`, validated by zod schemas (`src/content/schema.ts`) at load and in tests |
| SRS | FSRS via `ts-fsrs` 5.4 (`src/lib/srs/scheduler.ts`) |
| Audio | Browser text-to-speech behind a `SpeechProvider` interface; `RecordedAudioProvider` plays `public/audio/<id>.mp3` when present (none exist yet) |
| Tests | Vitest, 106 tests (answer checking, SRS, mastery, content validation, metro/timeline data, backup). Browser checks were ad-hoc Playwright scripts, not in the repo |
| Hosting | GitHub Pages via `.github/workflows/deploy.yml` (tests → build with `BASE_PATH=/<repo>/` → deploy) on every push to `main` |
| Size | ~5,200 lines of TS/TSX; ~480 KB of content |

**Not present:** no web manifest, no favicon or app icons, no onboarding, no
e-mails or notifications, no native or app-store builds. So there is **no
bundle ID or package name to protect**; the brief's ⚠️ about store IDs doesn't apply.

### 1.2 Current name: everywhere it appears

| Where | Current value |
|---|---|
| `index.html` | `<title>Čeština: Czech for English speakers at work</title>`, meta description |
| `src/components/AppShell.tsx` | Wordmark "Čeština" + "for English speakers at work"; footer copy |
| `content/course.json` | `"title": "Czech for English speakers working in Czechia"` |
| `README.md` | Title "Čeština for English speakers at work", live URL |
| `package.json` / `package-lock.json` | `"name": "czech-for-english-speakers"` |
| `src/db/db.ts` | IndexedDB name `czech-for-english-speakers` |
| `src/db/backup.ts` | Backup file id `app: 'czech-for-english-speakers'`; download name `czech-progress-<date>.json` |
| `src/routes.tsx` | Comment mentioning `/Czech-for-english-speakers/` |
| GitHub | Repo `Zkrukoff/Czech-for-english-speakers`; site `https://zkrukoff.github.io/Czech-for-english-speakers/` |
| `docs/DESIGN.md` | Describes the current identity |
| `localStorage` | key `theme` (generic, but un-namespaced) |

### 1.3 Current screens

| Route | Screen |
|---|---|
| `/` | Home: hero, "next stop" card, units drawn as coloured lines, guides |
| `/alphabet` | 42 letters, pronunciation guide, 4 practice sets |
| `/guides`, `/guides/:id` | Guides index; Culture (incl. scroll timeline), Prague transport (incl. metro map) |
| `/units/:unitId` | Unit as a vertical line of lessons + goals |
| `/lessons/:lessonId` | Lesson: Grammar → Vocabulary → Dialogue → Practice |
| `/units/:unitId/check` | Unit check (can-do goals) |
| `/grammar`, `/grammar/:pageId`, `/grammar/tables` | Case pages, overview, declension tables |
| `/verbs`, `/verbs/:pageId`, `/verbs/lookup`, `/verbs/lookup/:lemma` | Verb track and lookup (83 verbs) |
| `/review` | SRS session |
| `/progress` | Goals, review counts, mastery per case/topic/guide |
| `/settings` | Diacritics, spoken forms, appearance, voice, data export/restore/reset |

### 1.4 Data model

**Content** (`/content`, validated by zod):

- `course.json` → units (`units/<slug>/unit.json`: id, title, situation, can-do goals, lesson order, unit check)
- `lesson.json`: vocab items (gender, aspect, partner, spoken form, notes), dialogue lines, exercises
- Exercise types: `translate`, `fillEnding`, `caseSelect`, `conjugate`, `dialogueComplete`, `question`. Answers are patterns (`[optional]`, `{a|b}`), with targeted `hints` and a required `why`
- **Skill tags** on exercises: `case:<case>`, `verb:<topic>`, `vocab:<id>`, `alphabet`, `guide:<id>`
- Grammar: Markdown pages + `grammar/tables/*.json` (forms written `stem|ending`; all 14 model nouns ("vzory") exist as tables)
- `verbs/verbs.json`: conjugation, aspect, partner(s), motion pair
- `alphabet/alphabet.json`, `guides/*/guide.json` (+ timeline, metro data)
- **Every Czech item carries `nativeReviewed: false`**; doubtful items are in `content/REVIEW_NEEDED.md`

**Learner data** (Dexie v1): `settings`, `attempts` (every answer, with skills), `cards` (FSRS state, keyed `ex:<exerciseId>` / `vocab:<vocabId>`), `lessonProgress`, `goalProgress`.
Progress is keyed by **exercise, vocab, lesson and goal ids**; as long as those
ids survive, learner history survives.

### 1.5 Where the current app conflicts with the brief

| Brief rule | Current state | Change |
|---|---|---|
| Inter banned as brand font | Inter is the UI font | Replace (phase 2) |
| No green/red right/wrong | Feedback uses emerald/rose | Ink stamp / ink underline + Vltava (phase 4) |
| No soft shadows, identical rounded cards | `.card-link` hover shadow, `rounded-2xl` cards everywhere | Offset shadows, clipped corners, grid (phase 2/4) |
| No emoji/glyphs as icons | Text glyphs used as icons: ✓ ★ → ↗ ⇧ ○ ∅ | Custom SVG icon set (phase 2) |
| Line colours mean levels only | Units currently cycle through line colours | Line colour = CEFR line (phase 3) |
| No hex in components | One component (`MetroMap.tsx`) has a hex; colours otherwise via Tailwind palette, not semantic tokens | Semantic tokens + automated check (phase 2) |
| Case order: nom → acc → loc → gen → ins → dat → voc | Unit 1 teaches vocative (lesson 4) and *z* + genitive (lesson 3) early | Re-sequence (phase 5, see D9) |
| Real-speaker audio for core sounds | TTS only; no recordings | Needs recordings (D6) |
| Units = real metro stations | Units are abstract; station names exist only in the metro-map data, from my own knowledge, **not verified against PID** | Verify against PID open data (phase 3) |

---

## 2. Decisions I need from you

These change what gets built. My recommendation is first in each.

**D1. Repo and URL.** Renaming the repo to `prazak` changes the site URL to
`zkrukoff.github.io/prazak/`. As far as I know, GitHub doesn't redirect project
Pages sites after a rename; I'll verify before acting. Learner data is
**not** at risk either way: IndexedDB belongs to the origin `zkrukoff.github.io`,
and the path isn't part of the origin.
- (a) **Rename the repo to `prazak`, and you create a tiny repo under the old name** that only redirects to the new URL. Old links keep working. *(Recommended)*
- (b) Rename without a redirect: old bookmarks break.
- (c) Keep the repo name; rename the display only.

**D2. Database name.** The brief wants ASCII `prazak` identifiers, but renaming
an IndexedDB database means copying data.
- (a) **New database `prazak`, with a one-time copy from the old one on first load. The old database is never deleted**, so a failed copy loses nothing. Tested with a fixture of real v1 data. *(Recommended)*
- (b) Keep the old internal name forever, with a comment explaining why.

**D3. The line structure.** Real station order puts the transfer stations in
the middle of each line, close together (verified against PID in phase 3;
these are the orders I currently have):

| Line | Stations | Transfers (position) |
|---|---|---|
| A | 17 | Můstek (9), Muzeum (10): adjacent |
| B | 24 | Můstek (13), Florenc (15) |
| C | 20 | Florenc (8), Muzeum (10) |

On Line A the two milestones are back to back. They are the two ends of
**Wenceslas Square**, so I propose one **double milestone, "Václavák"**: a
review at Můstek, then the A1 can-do check at Muzeum. Line A runs west to east
(Nemocnice Motol → Depo Hostivař) so the home diagram reads left to right like
the real map. Which way you ride is your call.

**D4. How much new content in this project.** Line A has 17 stations. Existing
content covers about 5 of them (pronunciation + 4 units). Options:
- (a) **Build the full structure, move existing content onto Line A, and add the double milestone, the pronunciation station and one new station as a model.** The remaining stations appear as *výluka* ("under construction") until written, and Lines B and C are visible but not yet in service. *(Recommended: honest, and keeps content quality reviewable)*
- (b) Write all of Line A now. It's roughly three times the current content, and all of it needs native review.

**D5. UI font.** **Mluvka** (Jiří Krblich, OFL) is real, but its repository says
it **started as a fork of Plus Jakarta Sans**, which the anti-AI checklist bans.
It has since been modified (v2, with Text/Mono/Condensed variants).
- (a) **Test Mluvka in `/styleguide` next to the brief's fallback (Bricolage Grotesque at text optical size); you choose.** *(Recommended)*
- (b) Use Mluvka as specified.
- (c) Use the fallback.

**D6. Real-speaker audio.** I can't record Czech speakers, and the brief rules
out TTS-only for core sounds.
- (a) **You provide recordings.** I'll define the file list, naming and a manifest, and the pronunciation exercises switch on when files exist. TTS stays only as a clearly labelled fallback for non-core phrases. *(Recommended)*
- (b) I look for openly licensed recordings (e.g. Wikimedia Commons), checking the licence of each file, and attribute them on an audio-credits page.
- Until then, listen-and-type and minimal-pair exercises for core sounds stay hidden.

**D7. Name-day calendar.** Is there one official list? I'm not certain.
Calendars and apps differ for some days.
- (a) **A bundled JSON calendar compiled from a source I'll cite (with date), checked by your native speaker.** Works offline, no tracking. *(Recommended)*
- (b) A third-party API at runtime (an extra dependency, no offline use, and privacy questions).

**D8. Speaking prompts.** No speech recognition (accuracy for learners is poor,
and it would mean sending audio off the device).
- (a) **Record yourself in the browser, play it back next to the reference, and self-assess. Nothing is uploaded.** *(Recommended)*
- (b) Skip speaking prompts.

**D9. Case order vs. early survival phrases.** The brief's order puts genitive
4th and vocative last, but Unit 1 needs *Jsem z Anglie* and *Ahoj, Petře* in
week one.
- (a) **Teach them early as fixed chunks** (the case lens labels them "you'll learn why at station X"), with the formal teaching in the brief's order. *(Recommended)*
- (b) Remove them from the early units.

**D10. How Czech text is marked.** Today, all Czech text is set in a serif so
it stands apart from English explanations. The brief's type system has no
Czech-text role (Yrsa is only for long guide articles).
- (a) **Czech in Mluvka (or the D5 winner), one step larger and in full ink, with English in a smaller secondary colour.** The `lang="cs"` marking stays for screen readers. *(Recommended)*
- (b) Keep a serif for Czech (Yrsa).

**D11. Wordmark.** I'll draw three hand-lettered SVG options as the brief asks.
Honest caveat: they'll be good vector sketches, not the work of a professional
letterer. You may want a designer to refine the chosen one.

**D12. "Real-text" reading.** I'll recreate signs, menus and announcements as
original SVG/HTML illustrations in our style, without copying operators'
logos or real brand artwork.

---

## 3. Phases

Each phase ends with: tests, a production build, a browser check at 375 px and
desktop in both themes, and a commit on `redesign/prazak`. Nothing merges to
`main`, and so nothing deploys, until you approve. I'll open a PR at the end.

### Phase 1: Rename

| Change | Files |
|---|---|
| Display name, tagline, meta tags (title, description, Open Graph), `lang` | `index.html`, `src/components/AppShell.tsx`, `content/course.json`, `README.md`, `docs/DESIGN.md` |
| Web manifest (`name: "Pražák"`, `short_name`, colours) | `public/manifest.webmanifest` *(new)* |
| Favicon and app icons (placeholder from the háček mark until the D11 wordmark is chosen) | `public/favicon.svg`, `public/icons/*` *(new)* |
| Package and identifiers → `prazak` | `package.json`, `package-lock.json` |
| Database rename + copy migration (D2) | `src/db/db.ts`, `src/db/migrate.ts` *(new)*, `tests/migration.test.ts` *(new)* |
| Backup files: new id `prazak`, still accept old backups | `src/db/backup.ts`, `tests/backup.test.ts` |
| `localStorage` key → `prazak:theme`, still reading the old key | `index.html`, `src/lib/theme.ts` |
| Pages base path / redirect stub (D1) | `.github/workflows/deploy.yml`, README; the stub repo is created by you |
| Unicode audit: UTF-8 meta, JSON encoding, `localeCompare(…, 'cs')` for every user-visible sort, Czech-aware search | `src/lib/text.ts`, lists in guides/verbs/vocab |

**Risks:** the URL change (D1); the database migration (mitigated: copy, never
delete; fixture test; manual check in a browser with real v1 data).

### Phase 2: Design system

| Change | Files |
|---|---|
| All tokens in one file: brief palette, case colours (4.1), station tiles (4.2), spacing, radii, offset shadows, the 1.25 type scale; a "noční tramvaj" dark set with its own checked values (the brief's `--vltava` is 1.9:1 on ink, so dark mode needs a lighter variant) | `src/styles/tokens.css` *(new)*; `src/index.css` maps tokens into Tailwind `@theme` |
| Fonts behind CSS variables, self-hosted WOFF2 (Latin + Latin Extended-A): Bricolage Grotesque, Azeret Mono, Yrsa (via Fontsource or the OFL sources); Mluvka vendored from GitHub with its `OFL.txt`, converted to WOFF2 with fonttools. Remove Inter and Source Serif | `src/styles/fonts.css` *(new)*, `src/assets/fonts/*`, `package.json` |
| Base components: Button (offset shadow), Card (one clipped "cubist" corner), EnamelPlate (labels/badges), LineBadge, TileGrid (Otruba-style concave/convex circles; replaces BubbleWall), Stamp, Ticket, DepartureBoard text (Azeret Mono, flip motion), HáčekMark (bullet, loader, "aha" tip), hairline Rule, SectionNumber | `src/components/ui/*` *(new)* |
| Custom SVG icon set, one stroke style: tram, ticket, stamp, háček, beer glass, key, metro, speaker, arrow, back, settings, review | `src/components/icons/*` *(new)*; replaces the ✓ ★ → ↗ ⇧ ○ ∅ glyphs |
| Texture: paper grain and risograph halftone (SVG filters/patterns), misregistration on decorative elements only | `src/styles/texture.css` *(new)* |
| `/styleguide`: tokens, swatches (incl. station tiles), contrast table, type specimens with *Příliš žluťoučký kůň úpěl ďábelské ódy* and `Ř ř Ů ů Ě ě Ď ď Ť ť Ň ň` at every weight used, components, patterns, icons, motion | `src/features/styleguide/*` *(new)*, `src/routes.tsx` |
| Automated checks: contrast test for every token pair used; test that fails on hex values in components; font glyph-coverage test (reads the WOFF2 files' cmaps for the Czech set) | `tests/contrast.test.ts`, `tests/no-hex.test.ts`, `tests/fonts.test.ts` *(new)* |
| Remove the scale-mirroring dark mode | `scripts/gen-dark-palette.mjs`, `src/styles/dark-palette.css` *(removed)* |
| Rewrite the design guide | `docs/DESIGN.md` |

**Risks:**
- **The biggest mechanical change in the project.** Every component currently uses Tailwind's `stone-*`/`sky-*` classes and must move to semantic tokens. That's 36 component files; I'll do it as a pass with the no-hex and contrast tests as guard rails.
- Font coverage and kerning (tested, D5).
- Texture effects must never sit under body text.

### Phase 3: Learning-experience architecture

**Content model**

| Addition | Files |
|---|---|
| **Lines and stations** (single source of truth, replacing the metro data in the transport guide): lines A/B/C with CEFR level and token colour; stations with ASCII slug, Czech name, order, `kind: unit \| milestone \| planned`, unit link, "above ground" note, tile colour, and `verified: {source, date}`. Station names and order **checked against PID open data (GTFS), with the source and date recorded** | `content/lines/lines.json` *(new)*, schema, loader |
| **Units become stations.** Existing units keep their ids (`u01`…), so progress is kept. The alphabet becomes the pronunciation station; the alphabet reference page stays | `content/units/*/unit.json` (+ `station`), `content/course.json` |
| **Noun lexicon:** lemma, gender, animacy, vzor, irregular forms, gloss; linked to the existing vzor tables | `content/lexicon/nouns.json` *(new)* |
| **Case-lens markup in Czech strings.** Proposed syntax `[[kávu\|káva\|acc\|object]]` (form, lemma, case, *function*). The function comes from a controlled list (`object`, `location-v-na`, `after-do`, `with-s`, `quantity-5plus`, `addressing`…) with its explanation | `content/grammar/functions.json` *(new)*, parser in `src/lib/lens/*` |
| Validation: every lens token's lemma is in the lexicon; the form is checked against the vzor table (a warning, not an error, for irregular nouns) | loader, tests |
| Aspect drills (`aspectChoice`), motion-verb families (`family` on verbs), number + noun agreement drills (generated from lexicon forms, so no invented forms) | `verbs.json`, schema |
| New exercise types: `listenType`, `chooseEnding`, `buildSentence`, `aspectChoice`, `minimalPair`, `speak`, `readReal` | schema, `src/features/exercises/types/*` *(new)* |
| **Missions** per station: task, useful phrases, self-report | unit/station data |
| **Name days:** bundled calendar with source and date (D7) | `content/calendar/namedays.json` *(new)* |
| **Guides ↔ lessons:** guide sections list the lessons that teach their language; back-links are generated automatically, and both directions are validated. New guide **Zabydlení** (settling in): structure in phase 3, content in phase 5 | `guides/*/guide.json`, loader |

**Learner data: Dexie version 2.** Additive only: existing tables untouched.

| New table | Contents |
|---|---|
| `profile` | Who you are, level, home station, ty/vy intro seen. **Existing users get a profile inferred from their progress, so they're never forced through onboarding** |
| `missions` | Mission done + date |
| `stamps` | Ticket wallet: unit, milestone and mission stamps, idempotent |

New SRS card keys sit alongside the existing `ex:`/`vocab:` cards, which are
untouched: `pattern:<vzor>:<case>.<number>` and `fn:<function>`, scheduled from
lens-annotated answers.

**Navigation**

Linka (home map) · Opakování (review) · Mluvnice (grammar) · Slovesa (verbs) ·
Průvodce (guides: Doprava, Kultura, Zabydlení) · Jízdenky (ticket wallet) ·
Nastavení (settings). Czech labels with English subtitles where needed. Old
routes (`/units/:id`, `/progress`) redirect so bookmarks keep working.

**Risks:**
- The lens markup is a big authoring job (phase 5).
- Generated number drills must only use forms that exist in the lexicon.
- The schema migration (additive, tested with v1 fixtures).

### Phase 4: Screens

Mobile first at 375 px, then up. Each screen is built from phase-2 components
only and added to `/styleguide` as a pattern.

| # | Screen | Main files |
|---|---|---|
| 1 | Onboarding: who you are, level, *vykání* intro, home station | `src/features/onboarding/*` *(new)* |
| 2 | Home: strip map of your line (you-are-here, next station), *Dnes má svátek…*, next lesson, reviews due | `src/features/home/*` |
| 3 | Lesson player: all exercise types, the case lens (tap any annotated ending), feedback: an ink stamp for correct; an ink underline on the wrong ending, the right one in Vltava, plus the lens explanation | `src/features/lessons/*`, `src/features/exercises/*`, `src/features/lens/*` *(new)* |
| 4 | Unit complete: the ticket punch / validator stamp moment (≤250 ms, reduced-motion safe) | `src/features/lessons/UnitComplete.tsx` *(new)* |
| 5 | Review session | `src/features/review/*` |
| 6 | Grammar reference: functions-first case pages, vzory with a cross-case drill, aspect pairs; all linked from the lens | `src/features/grammar/*` |
| 7 | Verb lookup: conjugation, aspect partner, motion family, examples | `src/features/verbs/*` |
| 8 | Guides index + article template with linked lessons | `src/features/guides/*` |
| 9 | Transit guide (Doprava): announcement listening exercise, motion verbs in context | content + guide components |
| 10 | Profile: ticket wallet of stamps, stats (no streaks) | `src/features/progress/*` → `wallet` |
| 11 | Settings: noční tramvaj, spoken-Czech toggle, audio | `src/features/settings/*` |
| 12 | `/styleguide` (from phase 2, kept current) | `src/features/styleguide/*` |

**Risk:** the case lens has to stay readable on a 375 px phone (popover vs.
bottom sheet; I'll prototype both in the styleguide).

### Phase 5: Content pass and QA

**Content**
- Re-sequence the case teaching to the brief's order (D9).
- Add lens annotations to all existing Czech strings: about 240 exercises, about 135 dialogue lines and all example sentences. I'll do it in batches, with validation.
- Spoken-Czech variants where relevant.
- A *vykání/tykání* social-skills lesson, including recognising *Můžeme si tykat?*
- The pronunciation station, built around recordings (D6).
- A numbers + case agreement skill.
- Aspect pairs taught as pairs; motion verbs moved into the transit context.
- Missions for each built station.
- "Above ground" notes for every Line A station.
- The Zabydlení guide: practical, dated, no legal advice.
- Re-check the transport facts on pid.cz and date them.
- Everything new is marked `nativeReviewed: false` and listed in `REVIEW_NEEDED.md`. Uncertain grammar or cultural facts are flagged in comments and in the PR, not guessed.

**QA (definition of done)**
- Pangram test passes for every font and weight.
- Contrast test passes for every used pair, in both themes.
- No-hex test passes.
- Keyboard-only run-through of every screen.
- Reduced-motion run-through.
- 375 px screenshots of every screen.
- A **progress-survival test**: a fixture database captured from the current app is migrated, and lessons, goals, review cards and settings are checked afterwards.
- Lighthouse accessibility audit.
- `docs/DESIGN.md` updated.

---

## 4. Proposals the brief asked for

### 4.1 Case colours (draft, to be validated in phase 2)

These are kept away from the three line colours. They're always shown with the
case number and name (*4. pád · akuzativ*) and never as colour alone. All pass
4.5:1 as text on `--paper`. In phase 2 I'll check them under protanopia,
deuteranopia and tritanopia simulation, and add dark-mode variants. Some pairs
(e.g. 1 and 7) may need a second cue such as a dot pattern.

| Pád | Case | Colour | On paper |
|---|---|---|---|
| 1. | nominative | `#5B5048` warm grey | 6.8:1 |
| 2. | genitive | `#A35A00` ochre | 4.6:1 |
| 3. | dative | `#7A3E9D` violet | 6.1:1 |
| 4. | accusative | `#B0306A` magenta | 5.3:1 |
| 5. | vocative | `#00727A` teal | 5.0:1 |
| 6. | locative | `#2E5AAC` blue | 5.8:1 |
| 7. | instrumental | `#5C6B00` olive | 5.2:1 |

### 4.2 Station tile colours

Muted flat tones generated in OKLCH: fixed lightness (~0.80) and low chroma, so
every tile sits quietly on `--paper` and always takes `--ink` text. Hues are
spread around the wheel and skip the exact line hues. One tile per station, with
a swatch page in `/styleguide` for you to approve or hand-pick. (The real
panels' colours vary by station; I won't claim to reproduce them.)

### 4.3 Mascot (concept only, not built)

An original scruffy, wire-haired mongrel with one ear up, who rides the tram
with a commuter's patience and watches the stops go by. Flat colour,
mid-century illustrated-book line, no resemblance to existing Czech characters.
I'd avoid names already tied to famous Czech characters.

---

## 5. Verified vs. not yet verified

**Checked during this audit**
- The brief's contrast figures (all correct), plus three problems the brief doesn't mention:
  - Paper or white text on the green and red fills is 3.8–4.6:1, so small text on line badges fails AA. Badges need large/bold text, or ink text on a lighter tint.
  - `--vltava` on the dark background is 1.9:1.
  - The deep line colours on `--paper-2` are 4.9:1. That passes, with less margin.
- Mluvka exists, is OFL according to listings and is by Jiří Krblich, but it is a Plus Jakarta Sans fork (D5). I'll read its `OFL.txt` before vendoring.
- Azeret Mono (Displaay, Prague) and Yrsa (Rosetta) exist and are on Google Fonts. Full Czech coverage isn't confirmed by a source, so phase 2 tests it.

**Not yet verified** (will be checked and dated, or flagged)
- Station names and order against official PID data.
- Whether GitHub Pages redirects after a repo rename.
- The name-day source.
- That the Line A wall panels are by Jaroslav Otruba, as the brief says. I'll cite this or soften the wording before it appears in the app.
- Current PID ticket rules and prices.
- That Metron (Storm Type) is licensable as described. It only matters if you license it later; fonts sit behind CSS variables either way.
