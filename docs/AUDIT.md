# Pražák polish audit

*18 November 2026, on `main` at `589ad00` (round 2 merged and live).
No code was changed for this audit; everything below is a finding with a
proposed fix, waiting for approval.*

## How to read this

- **Severity:** **Critical** (wrong, broken, or undermines the app's purpose),
  **Important** (noticeable to users or a real risk), **Nice to have** (polish).
- **Effort:** **S** under a day · **M** 1–3 days · **L** 1–2 weeks ·
  **XL** more than two weeks or needs people we don't have yet (native
  reviewers, voice talent).
- **How it was checked:** automated sweeps (22 screens at 320, 375, 430, 768
  and 1280 px; a crawl of all 287 internal pages; 49 external links; Lighthouse
  on the production build), code and content reads, and the existing test
  suite (242 tests, all passing). Scripts were run from a scratch folder, not
  committed.

## Summary

| # | Finding | Severity | Effort |
|---|---|---|---|
| C1 | None of the Czech has been reviewed by a native speaker (0 of 1,219 items) | Critical | XL |
| C2 | There is no real audio: listening and minimal-pair exercises are switched off, pronunciation is taught silently | Critical | XL |
| C3 | Daily logic (ticket, holidays, name days) uses the device's time zone, not Europe/Prague; no DST or travel tests | Important | M |
| I1 | The header uses `backdrop-blur` (glassmorphism, banned by the brief) and the timeline a gradient | Important | S |
| I2 | Home is crowded: 11+ blocks for a brand-new learner, most of them empty on day one | Important | M |
| I3 | Overlapping sections: holidays in three places, emergencies in two, three separate "practice" entry points | Important | M |
| I4 | Home's pronunciation station and the station wall disagree about when Motol is "done" | Important | S |
| I5 | Touch targets: menu items are 40 px, strip-map stations 36 px, metro-map labels 20 px (brief and request: 44 px) | Important | M |
| I6 | "Show to a Czech" is `aria-modal` but doesn't trap focus | Important | S |
| I7 | Home overflows at 320 px (the "Whole line" button) | Important | S |
| I8 | The course chunk (661 kB, 202 kB gzipped) loads on every screen; LCP 3.6–5.4 s on slow 4G | Important | M |
| I9 | Culture guide, holiday customs, settling-in specifics and the name-day data were never verified | Important | M |
| I10 | Due counts include cards whose exercise no longer exists | Important | S |
| N1 | Off-scale type sizes (10, 11 px, 0.65 and 0.7 rem) and an `rgb()` shadow the hex test can't see | Nice to have | S |
| N2 | Pages without the Czech subtitle (lesson, unit check, grammar topics, aspect pairs, verb detail, numbers); the guide page shows it in a different style | Nice to have | S |
| N3 | "Not found" and route-error screens predate the design system | Nice to have | S |
| N4 | Fonts: `swap` without preload or fallback metrics | Nice to have | S |
| N5 | The new-user path has two competing first steps ("Next stop" and "First: the sounds of Czech") | Nice to have | S |
| N6 | Lighthouse SEO 91 was robots.txt (now fixed); Home itself has never been measured (a fresh profile is redirected to onboarding) | Nice to have | S |

What's in good shape and should stay as it is: no stray hex values (test-enforced),
contrast pairs tested in both themes, Lighthouse accessibility and best
practices 100 on every screen measured, no console errors anywhere, no dead
internal or external links, no broken images, the Czechia rule (test-enforced),
offline emergency cards (automated check), migrations v1→v3 with backup
round-trips (tests), and diacritics in all four fonts (pangram test) and in the
exported images (checked visually).

---

## 1. Design consistency

**What passes.** `tests/no-hex.test.ts` finds no hex value outside the tokens
and no banned font. Feedback never uses green/red. Offset shadows, ink borders
and the cubist corner are used consistently by the shared `Card`, `Button`,
`Ticket` and `EnamelPlate` components. English menu labels with Czech tooltips
are consistent. The Czechia / Czech Republic rule is enforced by a test with an
allowlist of five state-level uses.

**I1 · Glassmorphism and a gradient (Important, S).**
`AppShell.tsx:40` gives the sticky header `bg-paper/85 backdrop-blur-md`: a
frosted-glass effect, which the brief's checklist bans by name.
`guides/Timeline.tsx:78` draws the history timeline as a green-yellow-red
`bg-gradient-to-b`, also banned. *Fix:* a solid `bg-paper` header with the
existing ink rule; the timeline as three flat line-coloured segments.

**N1 · Off-scale sizes and an untested colour (Nice, S).** The type scale stops
at `text-xs` (12.8 px), but there are `text-[10px]` (ride, strip map, vertical
line), `text-[11px]` (tagline, gender mark, compact strip), `text-[0.65rem]`
(wall labels) and `text-[0.7rem]` (small enamel plates). The alphabet tiles use
`shadow-[inset … rgb(0 0 0/0.06)]`, a colour the hex test can't see. *Fix:* add
a `text-2xs` token if 11 px is genuinely needed, otherwise move to `text-xs`;
extend the no-hex test to `rgb()`/`hsl()`.

**What looks like a different designer.**
- The **"not found" and route-error screens** (`NotFound.tsx`, `RouteError`) are
  plain centred text with no PageHeader, no voice, no metro stripe (N3).
- The **guide page** shows its Czech name as a small grey span next to the
  status badge, where every other page puts it large under the title (N2).
- The **round-2 cards on Home** (ticket, wall, words, idiom, emergency) are each
  styled slightly differently: board, card, ticket, plate. Individually fine;
  stacked in one column they read as a feed rather than one designed screen (I2).
- The **Overheard and Idiom cards on the Guides page** look like guides but
  aren't, which blurs what a guide is (I3).

**N2 · Czech subtitles missing (Nice, S):** lesson pages (eyebrow "Lekce 2/4"
only), unit check, grammar topic pages, aspect pairs, verb detail, numbers. The
vzor page title is itself Czech, so that one is fine.

**Voice.** Microcopy is consistent (wry, deadpan, no exclamation cheer). The one
exclamation in UI copy is a Czech greeting (*Všechno nejlepší k svátku!*), which is
correct Czech.

## 2. Information architecture

**Menu.** Seven items: Home · Review · Sounds · Grammar & verbs · Guides ·
Ticket wallet · Settings. It scrolls sideways on phones (by design), and every
destination is clear.

**I3 · Overlaps (Important, M).**
| Topic | Where it lives now |
|---|---|
| Holidays | Kultura guide (`holidays.md`), `/holidays` prep lessons, Home countdown |
| Emergencies | `/emergency` cards, Zabydlení → health → "Emergencies" |
| Listening | Sounds → Overheard, plus an Overheard card on Guides |
| Practice | Review, Today's ride (a review session sized by stops), Moje slova |
| Idioms | Home card, `/idioms`, a card on Guides |

Five features (Words, Ride, Holidays, Emergency, Idioms) are reachable only
from Home cards, the footer, or a card on Guides.

**Proposed structure (same seven menu items):**
- **Home:** next stop, today's review count, the ticket. Everything else
  moves.
- **Practice** (*Procvičování*, replaces Review): due reviews; a "ride-length"
  switch on the same screen; Moje slova as a tab. (One place, three ways in.)
- **Sounds:** unchanged.
- **Grammar & verbs:** unchanged.
- **Guides:** Doprava · Kultura (the holiday lessons become its "Svátky" tab;
  the countdown links there) · Zabydlení (with *V nouzi* as its first tab, still
  linked from the footer) · Sport · Idiomy (as a guide with an archive).
  Overheard leaves Guides (it's in Sounds).
- **Ticket wallet, Settings:** unchanged.
- Routes stay; old ones redirect, so no progress or bookmarks break.

**One-tap next lesson.** Yes: the "Příští zastávka · Next stop" board is the
first card after the line map and opens the next lesson directly. But for a
brand-new learner it competes with **"First: the sounds of Czech"** lower down
(N5), and is surrounded by **I2**: ride set-up, "Nothing due", an empty wall,
Moje slova, name day, idiom, emergency and the not-in-service lines, all
before they've finished a lesson.

**Onboarding, first launch to first finished lesson** (walked through at
375 px). Four screens: *What brings you to Czech?* → level → a three-question
vy/ty quiz (Next stays disabled until all three are answered) → home station.
About 10 taps, then Home. Lesson 1 runs explanation → vocabulary → dialogue →
practice (8 exercises): roughly 15–20 more taps; my estimate is 8–10 minutes for a beginner (not timed with real users). It works,
and the vy/ty quiz is a good, memorable first contact with the culture. Two
issues: the quiz gates progress on knowledge the learner doesn't have yet (no
harm, but it's a test on screen two), and nothing after onboarding says "start
here" in one sentence. *Fix (with I2):* a new-learner Home with exactly three
things: the next-stop board, one line on what a station is, and the sounds as an
optional first step.

## 3. Connections between features

| Pair | Status |
|---|---|
| Holiday prep ↔ countdown | **Works.** Same `holidays.json`; the countdown links the prep lesson when it's coming and today's lesson on the day. Dates are verified against mzv.gov.cz (2026). |
| Your own words ↔ review queue | **Works.** Each word creates an `own:<id>` card, counted in "due now" and shown in Review with its own row; resetting progress keeps the words and re-creates their cards. |
| Station wall ↔ progress | **Mostly works.** Circles use the same rule as the wallet's "lessons done" (`completedAt`), and frames use the same stamps. **I4:** the Home line map marks Motol (pronunciation) done as soon as *any* lesson is practised; the wall fills it only after pronunciation practice. One rule for both. |
| Guides ↔ linked lessons | **Works.** The loader rejects any section that links a missing lesson; back-links are generated. |
| Ticket ↔ session length | **Works but isn't connected in the UI.** Any answer validates the day, so a ride counts. The ride screen doesn't mention the ticket and vice versa; a one-line link is enough. |
| Due count ↔ review screen | **I10:** `dueSummary` counts every due card. Review deletes `ex:` cards whose exercise was removed, but deliberately keeps `pattern:` and `fn:` cards that can't be turned into an exercise. Those keep counting, so the badge can say "4 due" when a session holds 2. *Fix:* count only cards that resolve; add a test that every card key a full run of Line A creates resolves. |

## 4. Correctness and robustness

**C3 · Time zone (Important, M).** `dayKey` (ticket), `holidaysOn`,
`nextHoliday` and the name day all use the device's local time. For someone
in Prague that is right; for someone travelling (or a phone set to UTC), the
04:00 boundary, today's holiday and today's name day move. Daylight saving is
handled correctly for local time, because the code uses wall-clock arithmetic,
but there are **no tests** for it. *Fix:* one `pragueNow()` helper
(`Intl.DateTimeFormat` with `timeZone: 'Europe/Prague'`) used by all daily
logic. Tests to add:
- ticket across the March and October DST changes;
- a learner in New York and one in Tokyo answering at local midnight;
- the 04:00 boundary;
- holidays and name days on 1 January and 31 December;
- the countdown across a year end;
- the SRS scheduler with intervals over a DST change.

Existing tests cover the rest: streak (7), SRS (12), holidays (10), name days,
ride.

**States.**
- **Loading:** most screens render nothing until IndexedDB answers, typically
  under 50 ms. The wallet used to jump; that's fixed (CLS 0.28 → 0.01).
- **Empty:** Review, Words, the wall, the ticket and the ride all have
  written empty states.
- **Error:** one `RouteError` for the whole app (N3). There is also a
  `ContentErrorScreen` for content validation failures.
- **Offline:** `npm run check:offline` passes on the production build; the
  whole app is precached. Audio is not precached, but there is no audio yet.

**Data survival.** Dexie v1 → v2 → v3 are additive. Tests cover legacy
migration, v2/v3 tables, backup export/import of v1, v2 and v3 files, and
"progress survives" scenarios. Cards that point to removed exercises are
skipped safely (but see I10).

**No console errors, dead links or broken images.** Crawled 287 internal pages:
no "doesn't exist" pages, no broken images, no console errors at five widths.
All 49 external links returned HTTP 200 on 18 November 2026.

**Diacritics.** The font test opens every WOFF2 and checks the pangram *Příliš
žluťoučký kůň úpěl ďábelské ódy* and all Czech letters; the exported wall and
idiom images were inspected and render *Pražák, Ř, ě, ů* correctly (the canvas
waits for the fonts).

## 5. Accessibility and mobile

**Passes.**
- Lighthouse accessibility 100 on every screen measured.
- Contrast pairs tested in both themes.
- Visible focus ring and a skip link.
- Lens dialogs return focus to the word that opened them.
- Animations stop under `prefers-reduced-motion` (CSS, plus
  `useReducedMotion` in five components).
- Station wall squares have spoken labels ("Petřiny: 2 of 4 lessons done,
  stamped"); the Home preview is a single labelled link.

**I5 · Touch targets (Important, M).** Measured at 375 px:
- menu items are 40 × 40 px (the design doc says "≥ 40"; you asked for 44);
- strip-map stations on Home are 44 × 36 px;
- the metro map's station labels are about 50 × 20 px;
- the wallet's mastery links are 17–24 px tall;
- footer links are small.

*Fix:* 44 px minimum height for menu items and footer links; enlarge the hit
areas (not the drawings) on the strip and metro maps; update the design doc to
44.

**I6 · Focus trap (Important, S).** "Show to a Czech" is a full-screen
`aria-modal` dialog, but Tab can move to the page behind it. *Fix:* make the
rest of the page `inert` while it's open.

**I7 · 320 px (Important, S).** Home is 345 px wide at 320 px: the "Whole line"
button on the vertical line map is `whitespace-nowrap`. Everything else is fine
at 320, 375, 430, 768 and 1280 px.

**Not yet checked by hand:** a real screen reader on a phone (VoiceOver and
TalkBack). The labels are there; whether the reading order of the line maps
makes sense needs a person. *Effort M.*

## 6. Performance

Lighthouse 12.6, mobile preset (slow 4G, 4× CPU), production build:

| Screen | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS | Transfer |
|---|---|---|---|---|---|---|---|---|---|
| Onboarding (fresh profile at `/`) | 83 | 100 | 100 | 91* | 3.4 s | 3.6 s | 0 ms | 0.00 | 405 kB |
| Emergency | 65 | 100 | 100 | 91* | 3.3 s | 4.8 s | 445 ms | 0.03 | 615 kB |
| Sounds | 69 | 100 | 100 | 91* | 3.1 s | 5.4 s | 250 ms | 0.00 | 663 kB |
| Sport guide | 74 | 100 | 100 | 91* | 3.3 s | 4.5 s | 221 ms | 0.00 | 480 kB |
| Idioms | 62 | 100 | 100 | 91* | 3.4 s | 4.8 s | 522 ms | 0.03 | 619 kB |
| Wallet (after the CLS fix) | 75 | 100 | — | — | 3.2 s | 3.8 s | 325 ms | 0.01 | 415 kB |

\* robots.txt was missing; it's added (not yet re-measured). After the first
visit the service worker serves everything locally, so repeat visits are
much faster than these cold-load numbers.

**I8 · The course chunk (Important, M).**
- `content-*.js` is 661 kB (202 kB gzipped): every lesson, guide, idiom and
  name day is validated in the browser on every cold start. That validation
  is most of the 250–520 ms of blocking time.
- *Fix:* validate at build time (the tests already do), ship content
  pre-validated, and split it per section, so Home loads the line and
  today's data and lessons load their own unit.
- Expected effect: LCP under 2.5 s on slow 4G for most screens.

**Other sizes.**
- Main JS 280 kB (89 kB gzipped).
- Markdown renderer 167 kB (only on guide and grammar pages).
- CSS 62 kB.
- Fonts 448 kB in 9 files: each face needs both its Latin and Latin Extended
  subset for Czech, and the Bricolage Latin file alone is 132 kB.
- No raster images except the icons; no audio yet.

**N4 · Fonts (Nice, S).** `font-display: swap` is set, but nothing is preloaded
and there are no `size-adjust` fallback metrics, so headings can reflow when
Bricolage arrives (it didn't register as CLS in these runs). *Fix:* preload the
two display files, and add metric overrides for the fallback.

## 7. Content

### Time-sensitive facts

Everything that carries a date was checked on 17 or 18 November 2026, so
nothing is older than six months. The question is what was **never** verified:

| Area | Verified | Never verified (flag) |
|---|---|---|
| Holidays: dates, shop closures | mzv.gov.cz, coi.gov.cz · 17 Nov 2026 | — |
| Lines and stations | PID open data · 17 Nov 2026 | — |
| Transport guide | pid.cz · 18 Nov 2026 (prices, free travel, funicular, night lines, airport, request stops, validation) | Ticket-inspection surcharge amount; app activation delay |
| Emergency numbers, lost and found | mv.gov.cz, portal.gov.cz, pid.cz · 17 Nov 2026 | eRecept wording on the pharmacy card |
| Ticket tiers | pid.cz · 18 Nov 2026 | — |
| Sport guide | Club, city and ČTK pages · 18 Nov 2026 | "In the stadium" tips (labelled in the text) |
| Idioms | SSČ/SSJČ via ÚJČ · 18 Nov 2026 | — |
| Overheard | Bus request-stop announcement (pid.cz) | Metro door and stop announcements |
| **Culture guide** | — | **No sources and no check date at all:** history timeline, customs, life-and-work norms (I9) |
| **Holiday prep lessons** | Dates only | **Customs** (carp, Ježíšek, pomlázka, the 28 October honours…) (I9) |
| **Zabydlení** | "language and general practice" | Bank, post office and doctor specifics: registration, referrals, fees (I9) |
| **Name days** | — | The calendar data's source (parsed from a package; six names flagged) (I9) |
| Lesson explanations | — | Tipping norms (u02-l04) and other cultural asides |

*Fix (I9, M):* give the culture guide sources and a check date; mark the holiday
customs and the Zabydlení specifics as checked or flagged, like the transport
guide; source the name-day calendar or say it's unverified. Then a calendar
reminder every six months, because PID changes timetables and prices
at least yearly.

### C1 · Native review (Critical, XL)

**0 of 1,219** flagged Czech items have been reviewed. On top of those are the
guide pages, the lesson explanations and the grammar pages: Markdown with no
per-item flag. By area:

| Area | Unreviewed |
|---|---|
| Units (lessons, dialogues, exercises) | 540 |
| Guides (phrases, practice) | 174 |
| Lexicon (generated declensions) | 115 |
| Alphabet | 87 |
| Verbs | 85 |
| Calendar (holidays, lessons) | 80 |
| Overheard | 51 |
| Emergency | 39 |
| Grammar functions | 26 |
| Idioms | 21 |
| Lines | 1 |

`content/REVIEW_NEEDED.md` lists the specific questions (180 table rows, grouped
by feature). For an app that teaches a language, this is the single biggest
risk: a learner can't tell a mistake from a rule. It's also the one thing code
can't fix. *Proposal:* pay one native-speaker teacher of Czech as a foreign
language to review in priority order:
1. Line A units;
2. emergency cards;
3. alphabet;
4. grammar pages;
5. everything else.

Show "reviewed" badges as each part passes (the badge component already
exists).

### C2 · No audio (Critical, XL)

`course.audio.size` is **0**:
- the 3 listening exercises and the 4 minimal pairs are switched off;
- the 7 speaking exercises have no model to compare against;
- the pronunciation guide is text only;
- Overheard in Prague uses the browser's synthetic voice.

This is covered in depth in PEDAGOGY_REVIEW.md; here it's listed because it
makes several screens look broken (empty listening sections, "recordings
pending"). *Proposal:* record the alphabet, the minimal pairs and the Line A
dialogues first (about 400 short clips), with one female and one male native
voice.
