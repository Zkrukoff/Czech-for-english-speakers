# Design guide

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

So the app should feel like a **well-made reference book crossed with a
calm work tool**, not a game.

## Principles

1. **Calm, not cheerful.** No streaks, points, badges, confetti, mascots,
   countdowns, sounds on success or guilt messages. Progress is shown as what
   you can do and how accurate you are.
2. **Czech is the hero.** Czech text is always the most prominent thing on
   the screen, set in its own typeface. The interface steps back.
3. **Colour carries meaning.** The interface itself is neutral ink and paper.
   Saturated colour appears only where it means something: the seven case
   colours, and the right / nearly right / wrong feedback states.
4. **Explain, don't just mark.** Every wrong answer shows why. Design every
   feedback state to make room for an explanation.
5. **One clear next step.** Each screen has at most one primary button.
   Everything else is secondary or a link.
6. **Honest about uncertainty.** Content not yet checked by a native speaker
   is labelled, never hidden.

## Voice and tone

- Plain, adult English. Short sentences. British spelling (*colour, practise*).
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
| Interface (English) | **Inter** (variable) | `font-sans`, the default |
| Czech text | **Source Serif 4** (variable) | Applied automatically to anything with `lang="cs"`, and to *italics* in explanations |

Both are self-hosted through `@fontsource-variable` packages, so there are no
requests to font services, the app works offline, and both cover every Czech
diacritic (including ď, ť, ů and capital Ď, Ť).

**Rule: mark Czech with `lang="cs"`.** It switches the typeface, helps screen
readers pronounce it, and lets browsers hyphenate correctly. In Markdown
explanations, write Czech examples in *italics*; they get the serif too.

Sizes (Tailwind classes):

| Role | Class |
|---|---|
| Page title | `text-3xl sm:text-4xl font-semibold tracking-tight` |
| Section heading | `text-xl font-semibold` |
| Eyebrow (small label above a title) | `.eyebrow` (uppercase, tracked, stone-500) |
| Czech prompt in an exercise | `text-2xl` |
| Body | `text-base`, explanations `leading-relaxed`, max width `max-w-3xl` |
| Secondary text | `text-sm text-stone-600` |

## Colour

### Interface: ink on paper

| Token (Tailwind) | Use |
|---|---|
| `stone-50` | page background (paper) |
| `white` | cards, inputs |
| `stone-200` / `stone-300` | borders, dividers |
| `stone-500` / `stone-600` | secondary text |
| `stone-900` | text, primary buttons (ink) |
| `sky-700` | links |
| `rose-700` | the Č in the wordmark: the only decorative colour |

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
| `.btn .btn-primary` | the one main action on a screen (ink) |
| `.btn .btn-secondary` | other actions (bordered) |
| `.btn .btn-quiet` | back / tertiary actions |
| `.card` | white surface with a border, rounded-xl, no shadow |
| `.eyebrow` | small uppercase label above a title |
| `.prose-cz` | Markdown explanations |

Patterns:

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
- Respect `prefers-reduced-motion`; the app uses almost no motion anyway.

## Checklist for a new screen

- [ ] Czech text has `lang="cs"`
- [ ] At most one `.btn-primary`
- [ ] No new colours outside the palette; no `dark:` classes
- [ ] Works at 390 px wide without sideways scrolling
- [ ] Works in dark mode
- [ ] Every state has text, not just colour
- [ ] Copy follows the voice rules: no hype, no guilt, no exclamation marks
- [ ] Content set in real expat situations
