# Design guide

> **Pražák redesign in progress.** This guide describes the current design. It will be
> rewritten in phase 2 of [PLAN.md](PLAN.md) for the new design system in
> [PRAZAK_BRIEF.md](PRAZAK_BRIEF.md). Until then, follow the brief where they disagree.

How the app should look, read and behave. Keep the code in line with this
guide, and update the guide when you change the design deliberately. The
tokens and shared styles live in `src/index.css` and
`src/styles/dark-palette.css`.

## Who it's for

English-speaking adults who have moved to Czechia for work: developers,
engineers, teachers, researchers, people in international companies. They:

- are busy and study in short sessions: on the tram, at lunch, in the evening
- are used to professional tools, and dislike being treated like children
- need Czech for concrete situations: colleagues, lunch, the commute, offices,
  the doctor, the landlord
- are motivated by being able to *do* things, not by points

So the app should feel like **Prague itself**: young, creative and a bit
cheeky on the outside, with the learning inside as clear and calm as a
well-made reference book. It is never a game.

## Principles

1. **A lively frame, a calm core.** The frame (home page, headers, guides,
   maps) is bold, colourful and playful. The core (exercises, explanations,
   tables) stays quiet so the Czech can be read without distraction.
   Never: streaks, points, badges, confetti, mascots, countdowns, sounds on
   success or guilt messages. Progress is what you can do and how accurately.
2. **Czech is the hero.** Czech text is always the most prominent thing on
   the screen, set in its own typeface. The interface steps back.
3. **Two colour systems that never mix.** The *Prague palette* (metro line
   colours, Vltava blue, tram cream) decorates the frame and marks the way
   (units as lines, the metro map). The *grammar colours* (one per case) and
   the *feedback colours* appear only in grammar tables and answer feedback.
   Never use a metro colour to mean a case, or a case colour as decoration.
4. **Explain, don't just mark.** Every wrong answer shows why. Design every
   feedback state to make room for an explanation.
5. **One clear next step.** Each screen has at most one primary button.
   Everything else is secondary or a link.
6. **Honest about uncertainty.** Content not yet checked by a native speaker
   is labelled, never hidden.

## The Prague identity

Everything decorative comes from the city:

| Motif | Where it comes from | Where it's used |
|---|---|---|
| **Metro stripe**: green · yellow · red | Lines A, B and C | Top of the header, footer, short bar above page titles (`.metro-stripe`, `MetroLineStripe`) |
| **Bubble wall**: a grid of coloured circles | The convex aluminium panels lining the line A and B stations | Home hero, guide cards, the alphabet's round letter tiles (`BubbleWall`) |
| **Lines and stops** | The metro map | Each unit is a "line" in its own colour; its lessons are stops and the unit check is the *Konečná* (terminus) |
| **Departure board**: yellow on near-black | Station and tram displays | The "Příští zastávka" (next stop) card, the unit-check terminus (`.board`) |
| **The wordmark** | The app's name | "Pražák" in the display face (interim, until the hand-lettered SVG wordmark in phase 2); the logo is three overlapping line colours (`MetroMark`) |
| **Sticker highlight** | Street posters and stickers | One highlighted word in a big headline (`.marker`) |

Small Czech touches belong in the frame, not just the lessons: *Ahoj, Praho!*,
*Příští zastávka*, *Konečná*. Always with English alongside where the meaning
matters.

## Voice and tone

- Plain, adult English with a light touch of wit. Short sentences. British
  spelling (*colour, practise*).
- Address the learner as *you*. Never "Great job!", "Oops!", "Awesome!".
- Correct: "Correct." / "Accepted, but check the diacritics." / "Not quite."
  followed by the reason.
- Describe the situation, not the feature: "You can order food from the
  menu", not "Complete 5 food exercises".
- Use real places and real situations: Prague, Brno, Olomouc; trams, meal
  vouchers, the daily lunch menu, *Lítačka*, the foreign police.
- No exclamation marks in interface copy. (Czech example sentences may have
  them, as real speech does.)

## Typography

| Use | Typeface | Notes |
|---|---|---|
| Display: page titles, section headings, big numbers, the wordmark | **Bricolage Grotesque** (variable) | `font-display`; applied automatically to `h1` and `h2`; extra-bold, tight tracking, slightly narrow |
| Interface (English) | **Inter** (variable) | `font-sans`, the default |
| Czech text | **Source Serif 4** (variable) | Applied automatically to anything with `lang="cs"`, and to *italics* in explanations |

All three are self-hosted through `@fontsource-variable` packages, so there are no
requests to font services, the app works offline, and both cover every Czech
diacritic (including ď, ť, ů and capital Ď, Ť).

**Rule: mark Czech with `lang="cs"`.** It switches the typeface, helps screen
readers pronounce it, and lets browsers hyphenate correctly. In Markdown
explanations, write Czech examples in *italics*; they get the serif too.

Sizes (Tailwind classes):

| Role | Class |
|---|---|
| Hero headline | `text-5xl sm:text-6xl font-extrabold leading-[0.95]` |
| Page title | `text-4xl sm:text-5xl font-extrabold tracking-tight` |
| Section heading | `text-3xl font-extrabold` (pages) / `text-2xl font-bold` (explanations) |
| Eyebrow (small label above a title) | `.eyebrow` (uppercase, tracked, stone-500) |
| Czech prompt in an exercise | `text-2xl` |
| Body | `text-base`, explanations `leading-relaxed`, max width `max-w-3xl` |
| Secondary text | `text-sm text-stone-600` |

## Colour

### Interface: ink on warm paper

| Token (Tailwind) | Light | Use |
|---|---|---|
| `paper` | `#faf7f0` | page background |
| `white` | | cards, inputs |
| `cream` | `#f6f0e4` | soft panels (why it matters, notes, chips) |
| `ink` | `#17130f` | headings, primary buttons, active nav pill |
| `stone-200`…`600` | | borders and secondary text |
| `vltava` | `#1f63c6` | links and focus rings |
| `night` / `night-text` | `#17130f` / `#faf7f0` | departure-board panels; stay dark in both themes |

### Prague palette (frame and wayfinding only)

| Token | Colour | Meaning |
|---|---|---|
| `metro-a` | `#1a9b4b` green | Line A; unit 1 |
| `metro-b` | `#f2b200` yellow | Line B; unit 2; highlights, the review count. Never as text on a light background |
| `metro-c` | `#d6213a` red | Line C; unit 3; the Č; the primary button's shadow |
| `vltava` | `#1f63c6` blue | unit 4; links |

Units cycle through these colours (`src/components/unitColours.ts`).

### Case colours (grammar)

One colour per case, used everywhere endings or cases appear: tables, case
labels, progress dots. Never use these colours for anything else.

| Case | Light | Dark |
|---|---|---|
| Nominative | `#57534e` | `#a8a29e` |
| Genitive | `#b45309` | `#f59e0b` |
| Dative | `#7c3aed` | `#a78bfa` |
| Accusative | `#be123c` | `#fb7185` |
| Vocative | `#0f766e` | `#2dd4bf` |
| Locative | `#1d4ed8` | `#60a5fa` |
| Instrumental | `#15803d` | `#4ade80` |

Defined as `--color-case-*`; use the classes `text-case-gen`, `bg-case-loc`
and so on (see `src/components/caseColors.ts`).

### Feedback states

| State | Colours | Wording |
|---|---|---|
| Correct | `emerald-50` / `emerald-300` | "Correct." |
| Accepted, diacritics slip | `amber-50` / `amber-300`, wrong letters highlighted `amber-200` | "Accepted, but check the diacritics." |
| Wrong | `rose-50` / `rose-300` | "Not quite." + answer + why |
| Not native-reviewed | `amber-50` badge | "Not yet native-reviewed" |

Colour is never the only signal: every state has a text label.

### Dark mode

The app follows the device setting by default; learners can force light or
dark in Settings (stored in `localStorage`, applied before first paint in
`index.html`).

Dark mode works by **mirroring the colour scales** (50 ↔ 950, 100 ↔ 900…,
500 unchanged), generated from Tailwind's own palette by
`scripts/gen-dark-palette.mjs` into `src/styles/dark-palette.css`. So:

- write components with light-mode classes only (`bg-white`, `text-stone-900`);
  **don't add `dark:` variants**
- `paper`, `cream`, `ink` and `vltava` get dark values from the same script;
  the metro colours stay the same; `night` panels stay dark on purpose
- stick to the scales the script mirrors (stone, sky, emerald, amber, rose,
  red, violet) plus `white`/`black` and the case colours; add a scale to the
  script before using a new one
- re-run the script after upgrading Tailwind

## Layout and spacing

- Content column: `max-w-5xl` with `px-4` gutters; prose `max-w-3xl`.
- Vertical rhythm: `mb-8`/`mb-10` between page sections, `gap-4` in grids,
  `p-5` inside cards.
- Grids collapse to one column on phones; nothing may scroll sideways at
  390 px wide except deliberately scrollable rows (the main nav, wide tables
  inside their own `overflow-x-auto`).
- The header is sticky and translucent; on phones the nav becomes one
  horizontally scrollable row under the wordmark.

## Components

Shared classes in `src/index.css`:

| Class | Use |
|---|---|
| `.btn .btn-primary` | the one main action on a screen: an ink pill with a red "platform edge" shadow that lifts on hover |
| `.btn .btn-secondary` | other actions: outlined pill |
| `.btn .btn-quiet` | back / tertiary actions |
| `.card` | white surface, 1px border, `rounded-2xl` |
| `.card-link` | add to clickable cards: lifts and gains a soft shadow on hover |
| `.board` | departure-board panel (always dark) |
| `.chip` | small rounded label on cream |
| `.eyebrow` | small uppercase, widely tracked label above a title |
| `.metro-stripe`, `.marker` | see *The Prague identity* |
| `.prose-cz` | Markdown explanations; its rules skip anything inside `.not-prose`, and only text is limited to reading width, so embeds (tables, the timeline, the metro map) can use the full page |

Patterns:

- **Interactive embeds** in explanations: ```` ```timeline <guide> ```` (a
  scroll-driven history timeline: events grow and reveal *why it matters*
  as they reach the middle of the screen) and ```` ```metro <guide> ````
  (the interactive metro map). Both have full static alternatives: the
  timeline opens everything under reduced motion or "Show everything"; the
  map has a station list for keyboard and screen-reader users.
- **Exercise card:** label (e.g. "Translate into Czech"), Czech prompt large,
  answer field, on-screen Czech keyboard. Enter checks, Enter continues.
  Feedback appears *below* the card, so the question stays visible.
- **Dialogue:** chat bubbles, alternating sides by speaker, Czech line large
  with a listen button, English below (can be hidden).
- **Tables:** stem in ink, ending in its case colour; a faint ∅ for a zero
  ending; row labels show the case dot, name and number.
- **Listen button:** a speaker icon, only shown if the device has a Czech
  voice or a recording exists. Never autoplay.
- **Goal list:** ○ not yet, ✓ done (emerald). Goals are completed only in
  unit checks.
- **Counts:** the number of due reviews appears as a small neutral pill in
  the nav and as a card on the home page. Never red, never a notification.

## Interaction

- Typing is the main input. The answer field has autocorrect, autocapitalise
  and spellcheck off, with `lang` set so mobile keyboards can offer Czech.
- The on-screen keyboard inserts at the cursor and keeps focus in the field.
- Answers are forgiving about capitals, punctuation and spacing, and flag
  (rather than fail) missing diacritics unless the learner opts into strict mode.
- A missed exercise comes back once at the end of the session, marked
  "another try". Sessions can be left at any time without penalty.

## Accessibility

- Text contrast at least WCAG AA in both themes (the mirrored scales keep the
  same contrast pairs).
- Visible focus ring (`sky-600`) on everything interactive; a "Skip to
  content" link.
- Touch targets at least 40 px (buttons use `min-h-11`; keyboard keys
  `h-10 w-10`; listen buttons `h-9 w-9` with negative margin).
- Feedback panels use `role="status"` / `aria-live` so screen readers announce
  the result.
- Respect `prefers-reduced-motion`: the global CSS rule stops all transitions
  and animations, and components with scroll effects (`useReducedMotion`)
  show their final state instead.
- Motion is short and purposeful: content rising into place on load
  (`animate-rise`), cards lifting on hover, timeline events growing into
  focus. Nothing loops except the small "live" dot on the departure board.

## Checklist for a new screen

- [ ] Czech text has `lang="cs"`
- [ ] At most one `.btn-primary`
- [ ] No new colours outside the palettes; Prague colours never mean grammar; no `dark:` classes
- [ ] The frame may play; the exercise and explanation areas stay calm
- [ ] Works at 390 px wide without sideways scrolling
- [ ] Works in dark mode
- [ ] Every state has text, not just colour
- [ ] Copy follows the voice rules: no hype, no guilt, no exclamation marks
- [ ] Content set in real expat situations
