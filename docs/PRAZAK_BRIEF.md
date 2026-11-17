# Pražák: rename, learning experience and redesign brief

You're working on my Czech-learning app for English-speaking expats in Prague. This brief covers three things: **renaming the app to Pražák**, **rebuilding the learning experience around how Czech actually works**, and **a complete visual redesign**. Read the whole brief before you change anything.

## 0. How I want you to work

1. **Audit first.** Explore the repo and summarize the stack, the current app name and everywhere it appears, the current screens, the data model for lessons and vocab, and how styling is done (Tailwind, CSS modules, a component library, etc.).
2. **Write a plan** to `docs/PLAN.md` that maps this brief onto the existing code. Split it into phases (below), list the files each phase touches, and flag anything risky. **Stop and wait for my approval before you write code.**
3. Work on a new branch (`redesign/prazak`). Commit after each phase with a clear message.
4. Don't break existing user data or progress. If the schema changes, write a migration.
5. When you're unsure about Czech grammar or a cultural fact, say so in a code comment or in the PR. Don't make things up. I'll have a native speaker review the content.

**Phases:** (1) Rename → (2) Design system: tokens, fonts, base components → (3) Learning-experience architecture: data model and navigation → (4) Screen-by-screen redesign → (5) Content pass and QA.

---

## 1. Rename to Pražák

- **Display name:** `Pražák`, always with the diacritics (ž and á). A Pražák is a Prague local. The app's promise is that you stop being a tourist and become one.
- **Tagline:** *Mluv jako Pražák.* ("Speak like a Pražák.") English subline: *Czech for people who actually live here.*
- **Code identifiers, slugs, package names, URLs:** `prazak` (ASCII). Never put diacritics in identifiers, file names or bundle IDs.
- Update the app title, `<title>`/meta tags, the web manifest, the README, the splash/onboarding, emails/notifications, the favicon and app icons, and any hard-coded strings.
- ⚠️ If the app is already published to the App Store or Play Store, **don't change the bundle ID or package name**. Change only the display name, and flag it for me.
- Make sure every font, input field and database column handles `ž`, `á`, `ř`, `ů`, `ě` correctly (UTF-8 throughout, correct sorting with `localeCompare(…, 'cs')`).

---

## 2. The learning experience

### 2.1 Core idea: the curriculum is a metro map

Prague has three metro lines: **A (green), B (yellow), C (red)**. By lucky coincidence, the CEFR language levels are also **A, B, C**. So:

| Metro line | Color | CEFR level | What it covers |
|---|---|---|---|
| **Linka A** | green | A1–A2 | Survival Czech, sounds, core grammar, everyday Prague |
| **Linka B** | yellow | B1–B2 | Full case system, verb aspect, real conversations, spoken Czech |
| **Linka C** | red | C1–C2 | Nuance, idioms, media, bureaucracy, fluency |

- **Units are stations.** Use real station names in real order from each line (verify against official PID/DPP data; don't guess). Each station gets a short "above ground" note about its neighborhood, which ties culture into the learning.
- **Transfer stations are milestones.** Můstek (A↔B), Muzeum (A↔C) and Florenc (B↔C) are checkpoint reviews that combine everything learned so far.
- The **home screen is a stylized line diagram** showing where the learner is and what's next. It should look like a metro strip map, not a gamified winding path.
- Progress means "riding the line." A finished unit gets an **ink stamp on a ticket** (a nod to the yellow ticket validators). Use the stamp, not confetti.

### 2.2 What Duolingo gets wrong, and what we do instead

Czech is hard for English speakers in specific, predictable ways. Each one gets a dedicated mechanic:

1. **Seven cases.** Teach cases by *function* ("where you are", "what you want", "who you're with"), not as abstract tables. Introduce them in order of usefulness: nominative → accusative → locative (*v Praze*) → genitive → instrumental → dative → vocative (*Pane!*). Build a **"case lens"**: every noun ending in every exercise can be tapped to show the case, why it's used and the pattern it follows. Color-code endings by case consistently across the app.
2. **Declension patterns (vzory).** Czech grammars teach nouns through model words (*pán, hrad, muž, stroj, předseda, soudce; žena, růže, píseň, kost; město, moře, kuře, stavení*). Make these first-class: each new noun is linked to its pattern, and learners can drill a pattern across cases.
3. **Gender and animacy.** Masculine animate vs. inanimate changes endings. Show gender visibly on every noun (small consistent marker, not just color).
4. **Verb aspect.** Teach perfective/imperfective **pairs** together (*dělat/udělat, kupovat/koupit*) with clear "finished vs. ongoing" situations. Duolingo largely ignores this.
5. **Verbs of motion.** *jít/chodit, jet/jezdit*, plus prefixes (*přijít, odjet, vystoupit*). Teach these **inside the transit module** (see 2.4).
6. **Numbers and case agreement.** *1 pivo, 2–4 piva, 5+ piv.* Drill this as its own skill. It comes up constantly (prices, tram numbers, time).
7. **Spoken vs. written Czech.** Expats hear *obecná čeština* (*dobrej*, *mlíko*, dropped *jsem*) but textbooks teach only the standard language. Show a "how Pražáci actually say it" toggle on relevant phrases.
8. **Formal vs. informal "you" (vykání/tykání).** This is a social skill, not just grammar. Teach when to use which, and how to recognize the offer to switch to *ty*.
9. **Pronunciation.** A dedicated early unit on ř, ch, length marks (čárka, kroužek), háček sounds, first-syllable stress and vowel-less words (*strč prst skrz krk*). Use audio from real speakers, never TTS-only for core sounds.

### 2.3 Learning mechanics

- **Spaced repetition (SRS)** for vocabulary **and for endings/patterns**, not just words. If an SRS exists in the code, extend it. If not, implement an SM-2-style scheduler or FSRS.
- **Exercise types:** listen-and-type, choose the correct ending, build-the-sentence, case-lens explanations, aspect-choice in context, minimal-pair listening (*byt/bít*), short speaking prompts, and real-text reading (signs, menus, announcements).
- **Mistakes teach.** A wrong answer shows *which* ending was wrong and *why*, using the case lens, never just "incorrect."
- **"Mise" (missions):** optional real-world tasks tied to units, e.g. order *ještě jedno* at a hospoda, buy a ticket at a machine, ask a neighbor a question with *vykání*. Learners self-report and earn a stamp.
- **Daily hook: name days (jmeniny).** Show today's Czech name day on the home screen ("Dnes má svátek …") with a one-line explanation. Use a verified data source for the calendar.

### 2.4 Guides, linked to lessons

The guides are content sections, but **every guide article links to the lessons that teach its vocabulary, and every lesson links back to the guide context.** Language and life are one product.

- **Getting around (Doprava):** PID tickets and the Lítačka app, validating tickets, trams vs. metro vs. buses, night trams, the metro announcement *"Ukončete, prosím, výstup a nástup, dveře se zavírají"* as a listening exercise, station vocabulary, motion verbs. (Check current ticket rules and prices against pid.cz; put a "last verified" date on anything that can change.)
- **Culture and traditions (Kultura):** holidays and customs (Mikuláš, Christmas carp, Easter, name days, the national holidays), pub etiquette, home etiquette (shoes off, slippers), greetings, Czech humor.
- **Settling in (Zabydlení):** bureaucracy basics, doctors, landlords, shops, neighbors. This section should be practical with dated facts, and it shouldn't give legal advice.
- **Grammar reference (Mluvnice):** browsable case tables, vzory, aspect pairs, verb conjugation classes, all cross-linked from the case lens.
- **Verb lookup (Slovesa):** search any verb and see its conjugation, aspect partner, motion-verb family and example sentences.

---

## 3. Visual design

### 3.1 Direction

**Artistic, youthful, unmistakably human-made, unmistakably Prague.** Picture a risograph zine made by a Prague design student who rides Line A every day. Not a SaaS dashboard, and not a cartoon owl.

Visual references to draw from (inspiration, never reproduction):
- **Prague metro Line A wall tiles:** the anodized aluminium panels by Jaroslav Otruba, with alternating concave/convex circles in a different color for each station. Use this as a **signature pattern**: a grid of circles/half-circles in flat color for section headers, the loading state, the stamp backgrounds, and the background of each station screen (each station gets its own tile color).
- **1970s Prague metro wayfinding:** Jiří Rathouský's signage system. It suits bold line numbers, circular line badges and wayfinding-style headings.
- **Czech Cubism** (e.g. the House of the Black Madonna): angular, faceted shapes for dividers, cards with one clipped corner, and illustration accents.
- **Enamel street signs and the two house-number plates on Czech buildings:** use enamel-plate styling for labels and badges.
- **Tram tickets and validator stamps** for progress, rewards and streaks.
- **Czech poster and illustrated-book tradition** (mid-century): flat color, confident line, a slightly naive hand.

### 3.2 The anti-AI checklist (hard rules)

**Never use:**
- Purple/blue gradients, mesh gradients, glassmorphism, glowing blobs
- Inter, Poppins, Montserrat, Space Grotesk, DM Sans, Plus Jakarta Sans, or system-ui as the visible brand font
- Identical rounded cards with soft drop shadows in centered stacks
- Emoji as icons; ✨ sparkles; generic 3D or isometric illustrations
- "Welcome back! 👋" style copy, exclamation-point cheerfulness, or confetti explosions
- Green check / red X traffic-light feedback (it fights the metro-line color system; see 3.4)

**Do instead:**
- **Flat color plus solid offset shadows** (e.g. `4px 4px 0 var(--ink)`), not blurred shadows
- **Visible structure:** a real grid, hairline rules, numbered sections, intentional asymmetry
- **Texture:** subtle paper grain and risograph-style halftone on illustrations and large color fields, with occasional slight color misregistration on decorative elements only (never on text)
- **Hand-drawn SVG line illustrations**, with a consistent stroke, slightly imperfect and limited to the palette
- **Custom icons** drawn in one stroke style (a tram, a ticket, a stamp, a háček-hook, a beer glass, a key). If a library is needed as a base, restyle it to match.
- **The háček (ˇ) as a brand motif.** Use it in the logo, as a bullet, as a loading tick, and as the "aha" mark in grammar tips.
- **Motion with mechanical character:** a ticket getting punched, a station sliding past, departure-board character flips. Keep it short (≤250 ms), and respect `prefers-reduced-motion`.

### 3.3 Typography

All fonts must fully support Czech diacritics. **Test every font** with the Czech pangram *Příliš žluťoučký kůň úpěl ďábelské ódy* and with `Ř ř Ů ů Ě ě Ď ď Ť ť Ň ň` at all weights used. Self-host fonts as WOFF2 with the Latin + Latin Extended-A subsets. Don't load them from Google's CDN at runtime.

| Role | Font | Why |
|---|---|---|
| **Wordmark** | Custom-drawn SVG, not a font | The "Pražák" logo should be hand-lettered. Make the háček on ž a distinctive shape that can stand alone as the app icon. Give me 3 options. |
| **Headlines and display** | **Bricolage Grotesque** (Google Fonts, OFL, variable) | Quirky, youthful grotesque with character and optical-size/width axes. Use it big and tight. |
| **UI and body** | **Mluvka Grotesk** (Jiří Krblich, OFL, on GitHub) | Made by a Czech designer, and its name comes from the Czech word for talking. Clean, high x-height UI sans. If it has glyph or kerning problems in testing, fall back to Bricolage Grotesque at text optical size and tell me. |
| **Labels, tables, timetables, conjugation grids** | **Azeret Mono** (Displaay, Prague; Google Fonts, OFL) | From a Prague foundry. Perfect for departure-board labels, ticket stubs, case tables and line numbers. |
| **Long reading (culture guides)** | **Yrsa** (Rosetta, Brno; OFL) | *Optional.* A warm text serif built with care for Czech diacritics. Use only for long-form guide articles. |

Premium upgrade I may license later (design so these can drop in): **Metron** by Storm Type Foundry, the digitized Prague metro typeface by Jiří Rathouský, for headings and wayfinding; and Displaay's retail fonts (e.g. **Perfektta**). Keep fonts behind CSS variables so swapping is one change.

Type scale: use a clear modular scale (e.g. 1.25). Display sizes go big (48–96 px on hero moments) with tight leading. Body text is 16–18 px with 1.5 leading. Labels in Azeret Mono are uppercase and letter-spaced, set like departure boards.

### 3.4 Color

Keep the three metro-line colors, but refine them and build a full system around them. Define everything as CSS custom properties / design tokens in one file (`src/styles/tokens.css` or the stack's equivalent) and use tokens everywhere. **No hard-coded hex values in components.**

```css
:root {
  /* Base */
  --paper:        #F5EFE3; /* warm sandstone off-white: main background */
  --paper-2:      #EAE1D0; /* slightly darker paper for cards/sections */
  --ink:          #1C1A17; /* warm near-black: text, rules, offset shadows */

  /* Metro lines = CEFR levels */
  --line-a:       #0E8A50; /* Linka A green: fills, large type, badges */
  --line-a-deep:  #0B6E40; /* green for small text/links on paper */
  --line-b:       #F5BE18; /* Linka B yellow: FILL ONLY, always with ink text */
  --line-c:       #D93A2B; /* Linka C red: fills, large type, badges */
  --line-c-deep:  #B52A1E; /* red for small text on paper */

  /* Accents */
  --vltava:       #1F4E63; /* deep river blue-teal: info, links, cool balance */
  --champagne:    #C8A464; /* Line A aluminium-tile gold: stamps, rewards, premium */
}
```

**Contrast rules (I checked these; enforce them):**
- `--ink` on `--paper`: 15:1. Use it for all body text.
- `--line-b` yellow on paper is only 1.5:1, so **never use it for text or thin lines on light backgrounds.** Use it only as a fill with `--ink` text (10:1).
- `--line-a` and `--line-c` on paper are about 3.9:1, which is fine for large text, badges and fills, **not small text**. Use `--line-a-deep` / `--line-c-deep` (5.5:1) for small text and links.
- `--champagne` is a fill with `--ink` text only.
- Add an automated contrast check (a small script or test) for the token pairs used in components.

**Color meaning:**
- Line colors **mean levels and lines only.** Content on Line A is green-accented, and so on.
- **Correct answer:** ink stamp mark plus a short positive line. **Wrong answer:** the wrong ending gets a hand-drawn ink underline and the correct ending appears in `--vltava`, with the case-lens explanation. Don't use red/green for right/wrong.
- **Case colors** (for the case lens) need their own small, distinct set that works for colorblind users. Always pair the color with the case number/label (1.–7. pád), never rely on color alone. Propose a set in the plan.
- **Station tile colors:** each station unit gets one flat tile color, a nod to the Line A wall panels. Generate a harmonious set of muted tones that sits well on `--paper`, and show me a swatch page.
- **Dark mode** ("noční tramvaj", night tram): `--ink`-based background with paper-colored text and the same line colors. Recheck contrast for this mode.

### 3.5 Voice and microcopy

Youthful, wry, a little deadpan, the way a Czech friend talks. Warm, never saccharine. Sprinkle in Czech words where context makes them clear (*Hotovo.* *Jedeme.* *Ještě jedno?*). Use English for explanations. No exclamation-point overload. Errors are friendly and specific. Empty states have personality (*"Tady nic není. Like a tram stop at 3 a.m."*).

### 3.6 Mascot (optional; propose, don't build yet)

If we want a character: an **original** illustrated dog that rides the tram. Dogs riding Prague public transport is a real, beloved local sight. It must be an original design. **No existing Czech cartoon characters** (Krtek etc. are copyrighted).

---

## 4. Screens to design (phase 4)

1. Onboarding: who you are, your level, *vykání* intro, pick your "home station"
2. Home: metro-line progress map, today's name day, next lesson, SRS reviews due
3. Lesson player: all exercise types, the case lens, feedback states
4. Unit complete: ticket stamp moment
5. Review (SRS) session
6. Grammar reference: case tables, vzory, aspect pairs
7. Verb lookup
8. Guides index plus article template (with linked lessons)
9. Transit guide (Doprava)
10. Profile/progress: your "ticket wallet" of stamps, stats
11. Settings: dark mode, spoken-Czech toggle, audio
12. A `/styleguide` route that shows all tokens, type, components, patterns and illustrations. Build this first in phase 2 and keep it current.

## 5. Definition of done

- Every screen uses tokens and the type system, with no stray hex values or default fonts
- Czech diacritics render correctly everywhere (run the pangram test)
- WCAG AA contrast for all text; keyboard navigable; `prefers-reduced-motion` respected
- Works well on a 375 px phone first, then scales up
- Existing user progress survives the update
- A short `docs/DESIGN.md` documents the system so future work stays consistent
- I can look at any screen and it couldn't belong to any other app
