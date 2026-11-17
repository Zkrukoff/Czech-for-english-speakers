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

### Phase 1: Rename ✅ done

**Outcome:** display name, tagline, metadata, manifest, placeholder háček
icons, `prazak` identifiers, database rename with copy migration, backup
compatibility, namespaced theme key, Czech collation and Unicode tests,
redirect stub, README. Tested end to end: progress made in the current
production build (answers, review cards, goals, lessons, settings, theme)
appeared intact in the new build on the same origin, and the old database was
left untouched.

**Deferred to merge time (by design):** renaming the GitHub repo. Renaming it
now would move the live site before the redesign ships. GitHub confirms that
project Pages sites are *not* redirected after a rename, so
`deploy/legacy-redirect/` holds the redirect files and step-by-step
instructions. No splash screen, onboarding, e-mails or notifications existed
to rename; onboarding arrives in phase 4.


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

### Phase 2: Design system ✅ done

**Outcome:** tokens in `src/styles/tokens.css` (the only place hex values appear; enforced by `tests/no-hex.test.ts`); four self-hosted WOFF2 faces, checked for every Czech letter by `tests/fonts.test.ts`; contrast for every pairing tested in both themes (`tests/contrast.test.ts`); texture, icons, UI primitives, three wordmark drafts and `/styleguide`. All existing screens migrated to tokens. **The case colours are a v2 set that supersedes §4.1** (the draft failed contrast on paper-2 and was 0.008 apart under protanopia; v2 is ≥ 4.87:1 and 0.043). Open: D5 (UI font), D11 (wordmark), approval of the station tiles. See [DESIGN.md](DESIGN.md).


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

### Phase 3: Learning-experience architecture ✅ done

**Decisions recorded:** D5 Mluvka · D11 wordmark B (Kubismus) · station tiles approved.

**Outcome**
- `content/lines/lines.json` is the single source for lines and stations, checked against the PID GTFS feed (valid 16–29 Nov 2026) with `scripts/pid_stations.py`: all three lines match in names and order. **Flora** is still in PID's stop list but has no Line A service in that feed window; it's recorded as a dated, unverified service note instead of a guess.
- Line A: Nemocnice Motol = pronunciation, Petřiny → Dejvická = units 1–4, Hradčanská → Staroměstská = výluka, Můstek + Muzeum = the **Václavák** double milestone, Depo Hostivař = the A2 check. Lines B and C are "not yet in service".
- Lexicon of 88 nouns with forms generated from the vzor tables (the generator reproduces every table), 26 case functions, and validated `[[form|lemma|case|function]]` markup. `CzechText` hides the markup everywhere today.
- Seven new exercise types with schema, checking and basic UI. Listening types stay hidden until recordings exist (`docs/AUDIO.md`).
- Missions (one per built station), motion-verb families, number drills generated only from lexicon forms, name days bundled with source and licence (six days flagged for checking), guide↔lesson links, and a draft Zabydlení guide (hidden until phase 5).
- **Dexie v2** (additive): `profile`, `missions` and `stamps`. Existing learners get an inferred profile and back-dated station stamps, so they're never sent through onboarding. Tested from real v1 and legacy fixtures. Backups are now v2, and v1 still imports.
- New review cards `pattern:<vzor>:<case>.<number>` and `fn:<id>`, scheduled from lens markup and reviewed through rotating example exercises.
- Navigation: *Linka · Opakování · Mluvnice · Slovesa · Průvodce · Jízdenky · Nastavení*. Stations live at `/line/A/<slug>`; `/units/:id` and `/progress` redirect. Wordmark B and new icons.


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

### Phase 4: Screens ✅ done

**Outcome:** all twelve screens built from the phase 2 components:
- onboarding (who, level, a *vy/ty* intro with three quick questions, home station);
- home (strip map with "you are here", next stop on a departure board, reviews, *Dnes má svátek*, Lines B and C not in service);
- station screens (tile band, name sign, lessons as stops, the check as terminus, missions with self-report stamps);
- the lesson player (case lens, stop-line progress, stamp / ink-underline feedback with the lens explanation, guide back-links);
- the unit-complete ticket punch;
- review as a departure board (words, exercises, endings, case uses);
- grammar (cases by function in the brief's order, 14 vzory each with a page and a drill, aspect pairs);
- verb lookup (motion family, examples from the lessons);
- guides index and article template (lessons sidebar, Zabydlení shown as *výluka*);
- transit practice (announcement listening, which waits for a recording, plus a next-station board and an exit sign);
- the ticket wallet (stamped tickets, mission stamps, stats, no streaks);
- settings (*noční tramvaj*, spoken Czech, audio, profile);
- `/styleguide` § 8 with the screen patterns.

**Lens on a phone:** prototyped as a bottom sheet below 640px and a popover above; kept both, responsively.

**Content annotated so far:** only u02-l01, as the model. Annotating the rest is phase 5.

**QA:** checked every route at 375px light and 1280px dark (no overflow, no console errors), keyboard access to the lens (Tab / Enter / Escape, focus returned), focus on *Continue* after answering, and reduced motion (static stamp and split-flap board).


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

### Phase 5: Content pass and QA ✅ done

**Content**
- **Case lens on every lesson:** 97 annotations across units 1–4, plus the new unit. Every form is checked against generated declensions, and the lexicon has grown to 115 nouns.
- **Case order (D9):** cases are formally taught in the brief's order. A new `grammarPreview` field marks earlier uses (genitive and vocative in unit 1, instrumental in unit 2) as phrases, and the lens says where each is taught properly. Unit 3 now starts with the locative. Lesson ids are unchanged, so progress is unaffected.
- **New station, Hradčanská (unit 5, "Vy, or ty?"):** two lessons, a check and a mission, plus *tykat* / *vykat* in the verb lookup.
- **Pronunciation:**
  - 7 speaking exercises and 6 listening exercises (minimal pairs and dictation), built around recordings.
  - Core sounds never fall back to a synthetic voice.
  - `docs/AUDIO.md` lists the 14 recordings needed.
- **Numbers + case:** `/grammar/numbers` with a drill generated from the lexicon.
- **Aspect and motion in the transit guide:** 4 aspect choices in the past tense (no ambiguous present-for-future items) and 3 *jet/jezdit*, *jít/chodit* items.
- **Other content:**
  - Spoken-Czech variants on 5 more dialogue lines.
  - "Above ground" notes for all 17 Line A stations; the Veleslavín note is corrected.
  - The Zabydlení guide, written and published (sections, phrasebook, practice, official sources).
- **Transport facts re-checked on pid.cz (17 November 2026):** prices, free travel, and the Petřín funicular, where the earlier text wrongly implied normal tickets were valid. The inspector surcharge and the app activation delay weren't on those pages and remain unverified.

**QA**
- A progress-survival test runs a realistic old-version database through the copy, the v2 upgrade and profile inference, then checks settings, lessons, goals, stamps, review cards (all still resolve to exercises) and the answer history.
- Keyboard sweep of 24 screens: every focus stop is visible and has a ring. This added a focus ring to the metro map stations.
- Lighthouse accessibility scores 100 on every audited page. This meant fixing small text on line fills in the metro map, ticket link names, the alphabet definition list, and empty table headers in markdown (fixed in the renderer).
- 375px screenshots of all 28 screens; long station names now wrap.
- The pangram, contrast and no-hex tests all pass.


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

---

## 6. Round 2: new features and changes (approved)

**Ground rules for this round**
- Everything follows the brief: tokens only, the four fonts, the anti-AI checklist, the voice.
- Every fact that can change is stored with `verified: { source, url, date }`. Anything I can't verify against an official source is marked `unverified` and listed in `content/REVIEW_NEEDED.md` instead of being guessed. All new Czech is `nativeReviewed: false`.
- I build in the order below and commit after each feature, with tests, a 375 px light and dark check, and Lighthouse accessibility.
- **Database:** the changes stay additive. One new Dexie version (v3) adds an `ownWords` table, and everything else is derived from existing tables. There's a migration test from v2 fixtures, and backups move to version 3, with versions 1 and 2 still importing.

### 6.1 Changes that affect several features

These come out of the items below. I'm listing them first because they change the plan.

1. **Offline support (needed by A5).** The app has no service worker today, so "works fully offline" means adding one. I'd use `vite-plugin-pwa` (Workbox) to precache the app shell, every page chunk, the fonts and the content. When an update is available, the app shows a small "Nová verze · reload" notice rather than swapping content mid-lesson. Side effect: **the whole app** then works offline, not just the cards.
2. **A multiple-choice type (needed by B11, and reused by A1 and A3).** A new `multipleChoice` exercise type: `prompt`, `options[]`, `answers[]`, and an explanation per wrong option, so a wrong pick teaches something. The existing `hints` mechanism already supports per-answer explanations, so this reuses it.
3. **One image-export utility (A6 and A8).** It renders SVG to a canvas, then to PNG. The image downloads, or opens the system share sheet where the Web Share API can share files. Only the image is shared: no tracking, no upload.
4. **Day boundary at 04:00 (A7, A3).** A "day" runs until 4:00 the next morning, the way PID day tickets do: the pid.cz ticket page I fetched on 17 Nov lists the family ticket as "1 den (do 4:00 následujícího dne)". That means a late-night practice session counts for the evening it belongs to. I'll re-verify this when I build A7.

### 6.2 A1 · Overheard in Prague (*Zaslechnuto v Praze*)

- **Approach:** short scenes, each with:
  - a transcript in two versions, standard and spoken, with a toggle (the spoken version is the existing "Jak to říkají Pražáci" setting, per scene);
  - an English translation (toggle);
  - 2–3 multiple-choice comprehension questions with teaching wrong answers;
  - case-lens markup in the standard transcript.

  First set: a tram announcement, a metro announcement, a supermarket checkout, ordering at a pub (*Ještě jedno?*), and a pharmacy visit.
- **Audio:** each line has `audio: { status: 'placeholder' | 'recorded', id? }`.
  - Placeholder lines play the browser's Czech text-to-speech voice, with a fixed, visible label: "Placeholder voice: not a real recording".
  - Recorded lines play the file listed in `content/audio/manifest.json`, the same mechanism as the pronunciation work. Swapping in a real recording is a data change only.
  - `docs/AUDIO.md` gets the full list of lines to record.
  - No scraped or third-party audio.
- **Facts:** announcement wording is checked against dpp.cz / pid.cz pages, or marked unverified (for example, the exact wording of tram stop announcements).
- **Files:**
  - `content/overheard/*.json` (new) with a schema in `schema.ts` and loading in `loader.ts`;
  - `src/features/overheard/*` (new: list, player, transcript toggle);
  - routes;
  - placed in the new Sounds section (B10).
- **Data:** no new table. Answers are logged as attempts with the new context `overheard`, and questions join reviews like any exercise.
- **Open question:** shops and pubs vary. I'll keep the scenes generic, with no chain names. OK?

### 6.3 A2 · Your own words (*Moje slova*)

- **Approach:** an "Add a word" sheet, reachable from Home, Review and the word list.
  - **Fields:** Czech (required), English (optional), note, where you saw it (free text plus an optional station or place), and a photo (optional).
  - **Photos:** the browser camera or file picker, scaled down to at most 1280 px JPEG on the device, stored as a Blob in IndexedDB, and never uploaded.
- **Linking to a vzor or verb:**
  - First, look the word up in the lexicon, including every generated form, so *kávu* finds *káva* → vzor *žena*.
  - Otherwise, look it up as a verb, by infinitive or by any conjugated form, using the existing verb search.
  - If neither finds it, the learner can pick a gender and vzor themselves. I'll offer a suggestion from the word's ending, clearly labelled "a guess: check it".
  - Linked words show the gender marker and link to the vzor page or verb page.
- **Reviews:** each word becomes a card `own:<id>` in the same review queue.
  - With an English meaning, it's reviewed English → Czech, typed, using the existing checker.
  - Without one, a new "recall" card shows the Czech, photo and note, then *Vím / Ještě ne* (I know it / not yet), self-graded.
- **Files:** `src/db/db.ts` (v3, `ownWords`), `src/db/ownWords.ts`, `src/features/words/*` (new), `src/lib/srs/reviewItems.ts`, `src/db/backup.ts`.
- **Data:** `ownWords { id, cs, en?, note?, place?, photo?: Blob, link?: { kind: 'noun' | 'verb', lemma, vzor? }, createdAt }`.
- **Open question:** backups include photos as base64 by default, which can get large. Should that be a checkbox ("include photos", on by default)?

### 6.4 A3 · Holiday prep lessons

- **Approach:** one mini-lesson per holiday or holiday cluster, nine in all: New Year; Easter (Good Friday and Easter Monday together); 1 May; 8 May; 5–6 July together; 28 Sep; 28 Oct; 17 Nov; Christmas (24–26 Dec together).
  - **Content:** 6–8 key words, "what people actually do", greetings and wishes, 2–3 etiquette tips, and 4–6 exercises (typed for language, multiple choice for customs).
  - **Home:** from 7 days before the holiday until the day itself, the *Dnes* panel shows "Prep lesson open" next to the countdown, linking to it.
  - **Afterwards:** each lesson stays in the culture guide's Holidays tab.
- **Facts:** holiday dates come from the law (Act 245/2000 Coll.), checked on e-sbirka.cz. Shop closing (Act 223/2016 Coll.) is checked the same way. Both are stored with a date. Customs that can't be sourced are marked unverified.
- **Files:**
  - `content/calendar/holiday-lessons/*.json` (new), with schema and loader;
  - `src/features/home/Today.tsx`;
  - `src/features/holidays/HolidayLesson.tsx` (new), reusing the lesson player;
  - culture guide links.
- **Data:** none new. Progress uses `lessonProgress` with ids like `hol-vanoce`.
- **Open questions:**
  1. Should lessons be **locked** before the 7-day window, or just **highlighted** then and always open? I recommend highlighted: locking something you could prepare early feels artificial.
  2. Should I also cover well-loved non-public days (Mikuláš on 5 Dec, *Čarodějnice* on 30 Apr, *Dušičky* on 2 Nov), marked "not a public holiday"?

### 6.5 A4 · Session length in tram stops

- **Proposed mapping:** **1 stop ≈ 3 exercises ≈ 1½–2 minutes.**
  - The time per exercise comes from the learner's own answer log (the median time between answers in a session), so after a few sessions "3 stops" matches how fast *you* actually go. Until there's enough data, it uses 3 exercises per stop.
  - I won't claim a real-world tram stop interval: I haven't found an official DPP figure for average time between stops. If I find one on dpp.cz I'll cite it; otherwise the copy says "about".
- **Settings, "Your usual ride":** quick picks of 3 / 5 / 8 / 12 stops, *or* pick two metro stations and the app counts the stops from the verified line data (Flora → Můstek = 4 stops). It's labelled "metro stops on your ride".
- **Where it shows:**
  - a new **"Today's ride"** session on Home: reviews first, then new practice, sized to your ride;
  - review sessions sized the same way (instead of a fixed 20);
  - lesson cards with "≈ 4 stops";
  - the runner's progress line, already drawn as stops, so one dot is one stop.
- **Files:** `src/db/db.ts` (`Settings.rideStops`, a field addition only), `src/lib/ride.ts` (new), `SettingsPage`, `ReviewPage`, `HomePage`, `ExerciseRunner`, and the unit and station pages.
- **Open question:** on the home screen, should "Today's ride" replace the separate Reviews card, or sit next to it?

### 6.6 A5 · Emergency phrase cards (*V nouzi*)

- **Cards:** doctor, pharmacy, police, locked out, lost items, accident. Each card has:
  - the situation in English;
  - 5–8 phrases (Czech and English) with case-lens markup;
  - what to expect;
  - **"Show to a Czech"** mode: full screen, very large Czech text in `--on-fill-dark` on `--ticket` (about 13:1, the same in both themes), one sentence per screen with large next and back buttons, and the screen kept awake (Wake Lock API, where supported).
- **Numbers:** 112, 155 (ambulance), 150 (fire), 158 (police), 156 (city police), verified against gov.cz / policie.cz / mvcr.cz and stored with dates. Each card has tap-to-call `tel:` links. The pharmacy and doctor cards explain *pohotovost* (out-of-hours service) without listing specific addresses unless they can be verified.
- **Offline:** service worker (§ 6.1). It's tested by loading the cards with the browser offline in Playwright.
- **Where:** a calm, always-visible "Emergency · *V nouzi*" link in the header on every page, plus the home screen and the Zabydlení guide. No red alarm styling: the enamel red plate.
- **Files:** `content/emergency/cards.json` (new) with schema and loader, `src/features/emergency/*` (new), `vite.config.ts` (PWA), `AppShell`.
- **Open question:** is a header link on every page OK, given the header is already full on phones? The alternative is a link in the footer and on Home only.

### 6.7 A6 · Your own station wall (*Tvoje stěna*)

- **Approach:** a wall of convex and concave circles (the `TileGrid` look), in the tile colours of your stations.
  - Each station is a block; each practised lesson fills one circle of its block, and a finished (stamped) station's block is completed with its stamp.
  - Lessons filling circles is an addition to your idea. With five built stations, a wall that only grows per station would stay nearly empty for weeks; this way it grows every time you practise.
- **Export and share:** a PNG of the wall, framed with the wordmark, "Linka A", your station count and the date. It downloads, or uses the system share sheet where supported.
- **Where:** the ticket wallet (top) and a small preview on Home.
- **Files:** `src/features/wall/*` (new), `src/lib/exportImage.ts` (new), `ProgressPage`, `HomePage`.
- **Data:** none, derived from stamps and lesson progress.
- **Note:** earlier, the brief's attribution of the Line A panels to Jaroslav Otruba wasn't verified. The app keeps saying "inspired by the Line A wall panels" unless I can cite a source.

### 6.8 A7 · Ticket-based streaks (*Jízdenky*) — conflict to resolve first

**There's a conflict here.** Your original spec, and the app's own copy since then, say *"No streaks, points, leagues, hearts or guilt notifications"* (README; onboarding; the wallet header "not how many days in a row you opened the app"). The Pražák brief, on the other hand, lists tram tickets "for progress, rewards and streaks". I can build this in a way that stays guilt-free, but the copy promising "no streaks" has to change, so I need your explicit go-ahead.

**The design I'd propose (if you confirm):**
- **Tiers should mirror real PID products, verified on pid.cz:**
  - **24 hours:** you practised today.
  - **72 hours** (instead of a 7-day pass): the 72-hour ticket exists, and I didn't see a 7-day pass on the pid.cz page I checked. Using real tickets keeps the theme honest.
  - **Monthly pass:** 30 days.
  - **Quarterly pass:** 90 days.
  - **Annual Lítačka:** 365 days.

  If you'd still rather have "7-day pass", I'll check whether PID sells one and, if not, call it something that doesn't pretend to be a product.
- **A missed day:** the ticket *expires*, and the copy is light: *"Platnost vypršela. It happens: the tram still runs. Validate a new one with one exercise."* The expired ticket goes into the wallet, stamped with its length ("Your longest: 23 days"), so nothing earned is taken away.
- **Freezes, as planned closures (*výluka*):** you can announce a *výluka* in advance for days you know you'll be away, and a missed day uses one automatically if you have one. You get one per 72-hour tier reached, up to 3 at a time.
- **No notifications.** The app has none and won't get any.
- **Settings:** "Show my ticket" on/off (default: on, if you approve this).
- **Files:**
  - `src/lib/streak.ts` (new: derived from the answer log with the 04:00 day boundary);
  - `src/db/db.ts` (*výluka* days in `meta`, no new table);
  - wallet, home and settings;
  - README and onboarding copy.

### 6.9 A8 · Idiom of the week (*Idiom týdne*)

- **Approach:** chosen by ISO week number, deterministically, so everyone sees the same idiom that week. Each idiom has:
  - the Czech;
  - a word-for-word literal translation;
  - the real meaning;
  - an example sentence (case-lens marked);
  - the closest English equivalent, only if there is a real one.

  It shows as a card on Home, with an archive at `/idioms`.
- **Sharing:** a PNG card (enamel plate style), a link to `/idioms/<id>`, and the system share sheet. No third-party share widgets.
- **Sourcing:** only idioms I can find in an authoritative source, recorded per idiom:
  - the Czech Academy of Sciences' language reference sites (Internetová jazyková příručka, prirucka.ujc.cas.cz; SSJČ, ssjc.ujc.cas.cz);
  - or a documented dictionary entry.

  I'll start with about 20 (for example *mít máslo na hlavě*, *chodit kolem horké kaše*, *házet hrách na stěnu*, *nosit dříví do lesa*, *kupovat zajíce v pytli*, *v tom je zakopaný pes*). Any I can't find in a source are dropped, not kept.
- **Files:** `content/idioms/idioms.json` (new) with schema and loader, `src/features/idioms/*` (new), `HomePage`.

### 6.10 A9 · Sports in Czechia (*Sport*)

- **A new guide with these sections:**
  - hockey (the extraliga, the national team, big tournaments in Prague);
  - football;
  - chants;
  - going to a game (tickets, getting there, etiquette, beer, colours and sections, rivalries);
  - vocabulary.

  It links to lessons: numbers and scores (u02-l03), motion verbs on the way to the stadium (u03-l02), and the vocative for cheering (u01-l04). It has a phrasebook and a practice set.
- **Chants:**
  - Only chants that are widely used and documented in mainstream Czech media (ČT sport, iRozhlas, major newspapers), with lyrics, a literal translation and when they're used.
  - Candidates I'm fairly sure are mainstream and harmless: *Kdo neskáče, není Čech, hop hop hop!*, *Češi, do toho!*, *Do toho!*, *My chceme gól!*. Each will be sourced or dropped.
  - Club ultras' chants are left out (that's where offensive material lives). Anything I can't source stays out, even if I believe it's common.
  - All chants are flagged for native review.
- **Facts verified at build:**
  - venues and how to get there (pid.cz / dpp.cz for lines; O2 arena at Českomoravská);
  - club colours and stadiums (the clubs' official sites);
  - ticket sales (the clubs' and the hockey association's official sites);
  - the 2024 IIHF World Championship in Prague and Ostrava (iihf.com).

  Etiquette and beer culture stay general and are flagged where there's no source.
- **Files:** `content/guides/sports/*` (new), `content/lexicon/nouns.json` (sports nouns), plus tests.
- **Open question:** should sports also get a **station** on Line A (a short unit about watching a game with colleagues), or stay a guide only for now? Guide only is my recommendation for this round.

### 6.11 B10 · Alphabet and pronunciation: recommendation

**I recommend its own section, as you lean towards, called "Sounds" (*Výslovnost*), and folding Verbs into Grammar to keep the menu the same length.**

- **Why its own section:**
  - Pronunciation is the foundation of every station, not a grammar topic.
  - It's also where all the **listening** lives: the alphabet, the pronunciation practice, the minimal pairs, and the new Overheard in Prague (A1).
  - Hidden inside Grammar, it would be invisible to the people who need it most, and today the alphabet is only reachable from the home page and the Nemocnice Motol station.
- **Why merge Verbs into Grammar:**
  - The menu has seven items, which already scroll on a phone.
  - The Grammar page already has a Verbs section (aspect pairs, the verb track, lookup), and the case lens links into both. "Grammar & verbs" is one reference shelf to learners.
  - The menu would then be: **Home · Review · Sounds · Grammar & verbs · Guides · Ticket wallet · Settings** (still seven).
- **Routes:** `/sounds` (with `/alphabet` redirecting), `/sounds/overheard`; Verbs pages stay at their URLs but are filed under Grammar & verbs in the menu.
- **Files:** `AppShell`, routes, `AlphabetPage` (it becomes the Sounds hub), `GrammarIndex`, `StationPage` (the Motol link).

### 6.12 B11 · Multiple choice for practical knowledge

**The rule:** knowledge *about* Czechia (transport, customs, history, social conventions) is multiple choice, while producing Czech (endings, translation, spelling, writing a Czech word) stays typed. A test enforces it: no `question` exercise may expect an English typed answer.

**To convert (26):**

| Id | Question | Notes on the wrong options I'd write (all facts verified at build) |
|---|---|---|
| tr-n7 | Trolleybus from the airport to line A | 59 ✓; the wrong options are other airport routes, each with what it really is (e.g. the bus to Zličín, the Airport Express) |
| tr-n8 | Where you validate a paper ticket for the metro | entrance to the metro ✓; on the platform / on the train / at the exit, each explained |
| tr-n1, tr-n2 | Which line is yellow / red | A, B, C with their colours |
| tr-n3, tr-n4, tr-n5 | Transfer stations | Můstek / Muzeum / Florenc plus a near-miss (e.g. Náměstí Republiky, "one stop short of Florenc") |
| tr-n6 | Night tram numbers | 91–99 ✓ vs day ranges and night buses (verified) |
| tr-h4 | *Zastávka na znamení* | press the button ✓ / the tram stops anyway / tell the driver |
| tr-h6 | *výluka* | planned closure ✓ / strike / delay |
| tr-h8 | *za 4 min* | in 4 minutes ✓ / 4 stops away / every 4 minutes |
| tr-read-next | *Přestup na linku B* | change to line B ✓ / line B is closed / last stop |
| tr-read-exit | *VÝSTUP* | exit ✓ / entrance (*vstup*) / transfer (*přestup*): the near-misses teach the related words |
| cul-c5 | Who brings the cake | the person celebrating ✓ / colleagues / the boss |
| cul-x6 | PF | *pour féliciter* ✓ / … |
| cul-h1, h2, h3, h4 | 17 Nov, 1918, St Wenceslas, Jan Hus | dates, years and names with neighbouring events as distractors |
| st-5 | 3+kk | 3 rooms, kitchenette ✓ / 3+1 / 4 rooms |
| alpha-r1 | Which syllable is stressed | first ✓ / second / last |
| alpha-r7 | Vowels in *strč prst skrz krk* | 0 ✓ / 1 / 4 (the r works as the vowel) |
| u05-l01-e1, e2; u05-c1, c2 | vy or ty | two options, with the social reason |
| u05-l02-e3 | Who offers *ty* | older ✓ / younger / whoever is the man |

Kept typed, because they produce Czech: the alphabet letters, letter names and spelling (`alpha-s*`, `alpha-n*`, `alpha-l*`, `alpha-r2–r6`), the culture vocabulary (*kapr*, *pomlázka*, *kraslice*, *čarodějnice*, *o nás bez nás*), and the transit Czech words (*Výstup*, *náhradní doprava*).

- **Files:** `schema.ts` (`multipleChoice`, plus optional `options` on `readReal`), the exercise runner (reusing `ChoiceInput`), the content files above, `SCHEMA.md`, and tests.

### 6.13 C12 · "Czech Republic" or "Czechia"?

- **Official status:**
  - **Czech Republic** (*Česká republika*) is the formal name and stays so.
  - **Czechia** (*Česko*) is the official **short** name. The Czech government approved it in 2016, and it was registered with the UN that year.
  - Both are correct, and they aren't interchangeable in tone: "Czechia" is like "France", "the Czech Republic" like "the French Republic".
  - I'll cite the Ministry of Foreign Affairs (mzv.gov.cz) and UN sources when applying the change.
- **What people say and search:** in everyday English, "Czech Republic" is still the more familiar name, and expats search with it, for example "Czech Republic visa" and "work permit Czech Republic". I believe this is true, but I can't measure search volume from here, so it's flagged as a judgement, not data.
- **Bureaucracy:** residence permits, visas and contracts use the formal name. The Ministry of the Interior's English pages and Czech passports ("CZECH REPUBLIC") use it too, as far as I know; I'll verify that before citing it.

**Recommended rule:**
1. **In the app's own voice, "Czechia":** headings, lessons, guides and UI ("living and working in Czechia"). It's the official short name, it's shorter, and it's what the country itself promotes.
2. **"The Czech Republic":**
   - when naming official things: institutions (*Embassy of the Czech Republic*), documents, laws and forms;
   - in the Zabydlení paperwork sections and the emergency cards;
   - wherever we quote an official text.
3. **Discoverability, both:** the page `<title>`, meta description, web manifest and any app-store text say "Czechia (Czech Republic)" once, so search engines and people who only know one name find it.
4. **Czech in lessons:** *Česko* in everyday sentences (*Bydlím v Česku*) and *Česká republika* in formal ones, with a short note in the lesson that both exist, because learners will hear both.

Today the app's content and code say "Czechia" in 9 places and "Czech Republic" in 3. Once you approve, I'll apply the rule everywhere, list every change, and add a test that flags "Czech Republic" outside the allowed contexts.

### 6.14 C13 · Other things I'd do differently, or conflicts

1. **Streaks vs. "no streaks" (A7):** see § 6.8. This needs your decision.
2. **Placeholder voices (A1) vs. "never text-to-speech for core sounds" (D6):** I think the clips can use placeholder text-to-speech, since they're about understanding, not core sounds. But the browser's voice can't do spoken Czech convincingly (*dobrej*, *seš*), so the spoken-Czech toggle will change the transcript but the voice will still read it in a textbook accent. The label says so, and real recordings fix it.
3. **Offline (A5):** this makes the whole app a PWA (§ 6.1). There's a small risk of stale content after a deploy, which the update notice handles.
4. **The wall (A6):** it fills per lesson, not only per station, so it isn't empty for weeks (§ 6.7).
5. **Session length (A4):** I'd calibrate from the learner's own pace rather than fixing a number, and avoid claiming real-world stop intervals I can't source.
6. **Holiday prep (A3):** highlighted, not locked (open question in § 6.4).
7. **"Today" is getting full:** the Home *Dnes* panel would gain the holiday prep and the idiom of the week. I'd keep the panel to holiday, name day and countdown, and give the idiom its own small card below it, so Home doesn't turn into a dashboard.
8. **Build order:** you asked for A1–A9, then B10, B11, C12. Two shared pieces have to come first: the multiple-choice type (B11), because A1 and A3 use it, and the service worker (§ 6.1). I'll build them **as part of the first feature that needs them**, so the order and the one-commit-per-feature rule still hold. The B11 *content conversion* stays in its place.

### 6.15 Decisions (approved)

1. **A7:** ticket streaks approved as designed (72-hour tier, *výluka* freezes, "no streaks" copy updated).
2. **A3:** open all year; highlighted, and featured on the home page, in the 7 days before each holiday. Public holidays only for now.
3. **A5:** Emergency link in the footer and on Home only.
4. **A4:** "Today's ride" is a daily commute option: the learner picks a start and an end station, and the session is that many stops long.
5. **A2:** text only for now (word, meaning, note, where seen). No photos, so backups stay small; the data model leaves room to add them later.
6. **A9:** guide only.
7. **B10:** "Sounds" as its own section; Verbs folded into "Grammar & verbs".
8. **C12:** naming rule approved.

### 6.16 Questions as asked

1. **A7:** go ahead with ticket streaks as designed, including changing the "no streaks" copy? And 72-hour ticket or "7-day pass"?
2. **A3:** highlighted or locked? And add the non-public days (Mikuláš, Čarodějnice, Dušičky)?
3. **A5:** an Emergency link in the header on every page, or footer and Home only?
4. **A4:** should "Today's ride" replace the Reviews card on Home, or sit beside it?
5. **A2:** include photos in backups by default?
6. **A9:** guide only, or a sports station too?
7. **B10:** OK with Sounds as its own section and Verbs folded into "Grammar & verbs"?
8. **C12:** OK with the naming rule?
