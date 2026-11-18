# Pražák design system

How Pražák looks, sounds and moves. The source of truth for values is
[`src/styles/tokens.css`](../src/styles/tokens.css); everything is visible at
**`/styleguide`**. The full brief is [PRAZAK_BRIEF.md](PRAZAK_BRIEF.md).

## Direction

A risograph zine made by a Prague design student who rides Line A every day.
Artistic, youthful, unmistakably human-made and unmistakably Prague. It is not a SaaS
dashboard and not a cartoon owl. Visual sources (inspiration, never
reproduction): the Line A station wall panels, 1970s metro wayfinding, Czech
Cubism, enamel street and house-number plates, tram tickets and validator
stamps, mid-century Czech posters and illustrated books.

### Hard rules (the anti-AI checklist)

| Never | Instead |
|---|---|
| Purple/blue gradients, mesh gradients, glassmorphism, glowing blobs | Flat colour, paper grain, risograph halftone |
| Inter, Poppins, Montserrat, Space Grotesk, DM Sans, Plus Jakarta Sans, system-ui as the visible font | The four faces below (a test fails if a banned family is loaded) |
| Identical rounded cards with soft blurred shadows in centred stacks | Solid offset shadows (`4px 4px 0 var(--ink)`), ink borders, one clipped "cubist" corner, a real grid, hairline rules, numbered sections, intentional asymmetry |
| Emoji or text glyphs as icons, ✨ sparkles, 3D/isometric art | The custom icon set; hand-drawn SVG line illustrations in the palette |
| "Welcome back! 👋", exclamation-point cheer, confetti | Wry, deadpan, warm microcopy; the ink stamp |
| Green check / red X feedback | Ink stamp for right; ink underline on the wrong ending + correction in Vltava + the case-lens explanation |

## Tokens

All raw values (colours, fonts, the type scale, radii, shadows, motion) are in
`tokens.css`. Components use them through Tailwind utilities (`bg-paper`,
`text-ink-2`, `border-rule`, `font-mono`…), mapped in `src/index.css`, or
`var(--…)`. Tailwind's default palette and fonts are **switched off**.
`tests/no-hex.test.ts` fails on any hex value outside `tokens.css`, any
default-palette class, or a banned font.

### Colour

| Group | Tokens | Rules |
|---|---|---|
| Base | `paper`, `paper-2`, `paper-3`, `surface`, `ink`, `ink-2`, `ink-3`, `rule`, `rule-strong` | Body text is `ink`; `ink-2` secondary, `ink-3` captions. `rule*` are never text |
| **Lines = levels** | `line-a` (A1–A2), `line-b` (B1–B2), `line-c` (C1–C2), `line-a-deep`, `line-c-deep` | They mean lines and levels only. `line-b` is a fill only, always with `on-fill-dark` text. `line-a`/`line-c` are for fills, badges and large text; small text uses the `-deep` variants |
| Accents | `vltava` (links, info, corrections), `vltava-tint`, `champagne` (stamps, rewards; fill only), `champagne-tint` | |
| Fixed | `on-fill-dark`, `on-fill-light`, `board`, `plate-red`, `plate-blue`, `ticket`, `ticket-void` | Do not change in dark mode: text on fills, departure boards, enamel plates, tickets (paper in both themes) |
| Stamp ink | `stamp-red`, `stamp-blue`, `stamp-blend` | Validator ink: day ink sinks into paper (multiply); at night it's lighter and sits on top. Tickets reset to day ink |
| Case lens | `case-1` … `case-7` | Text on paper/surface only. **Always with the number and name** (*4. pád · akuzativ*), never colour alone |
| Station tiles | `tile-01` … `tile-24` | Muted OKLCH tones (L 0.84, C 0.065), one per station, always `on-fill-dark` text (≥ 10:1) |

**Case colours** were chosen by a search over contrast and simulated colour
blindness: every colour is ≥ 4.87:1 on both papers, hues stay clear of the
three line colours, and the closest pair under protanopia, deuteranopia or
tritanopia is 0.043 apart in OKLab (the first draft had a pair at 0.008). The
`/styleguide` shows them under all three simulations.

**Contrast** is enforced by `tests/contrast.test.ts` for every pairing
components use, in both themes (AA: 4.5:1 text, 3:1 large text and fills).
Light text on `line-a` / `line-c` is only 4.4–4.6:1, so it must be large;
`LineBadge` switches to an ink letter on a coloured ring below 28 px.

**Dark mode, "noční tramvaj":** an ink background with paper-coloured text and
the same line colours; `vltava`, the `-deep` line colours and the case colours
get lighter dark-mode values (the brief's `--vltava` is 1.9:1 on ink). It
follows the device unless the learner picks Light or Dark in Settings.

### Type

| Role | Face | Use |
|---|---|---|
| Display | **Bricolage Grotesque** (OFL) | `h1`–`h3`, big numbers, hero moments. Big and tight: `opsz` 96, `wdth` 88, tracking −0.02em |
| UI and body | **Mluvka** (Jiří Krblich, OFL; v3.001) | Everything else. 16 px body, 17 px from tablet up, 1.5 leading |
| Labels, tables, timetables | **Azeret Mono** (Displaay, Prague; OFL) | `.label-board` / `.eyebrow`: uppercase, letter-spaced, like departure boards; conjugation grids, ticket stubs |
| Long reading | **Yrsa** (Rosetta, Brno; OFL) | Long-form guide articles only (`.prose-read`) |

- All four faces are self-hosted as WOFF2, Latin + Latin Extended subsets only (`src/styles/fonts.css`). `tests/fonts.test.ts` opens each file and checks the pangram *Příliš žluťoučký kůň úpěl ďábelské ódy*, every Czech letter (`Ř ř Ů ů Ě ě Ď ď Ť ť Ň ň`…) and Czech quotation marks.
- Fonts are referenced only through `--font-display`, `--font-ui`, `--font-mono` and `--font-read`, so dropping in Metron (Storm Type) or another face later is a one-line change.
- **Decision D5 is open:** Mluvka began as a fork of Plus Jakarta Sans. `/styleguide` shows it next to the brief's fallback (Bricolage at text optical size, `--font-ui-alt`).
- **Czech text** is marked `lang="cs"` (for screen readers and hyphenation) and set in the UI face in full `ink`. English explanations are a step smaller in `ink-2` (decision D10).
- **Scale** (ratio 1.25 from 1 rem; `sm` is the half step): `text-xs` 12.8 · `sm` 14.3 · `base` 16 · `lg` 20 · `xl` 25 · `2xl` 31 · `3xl` 39 · `4xl` 49 · `5xl` 61 · `6xl` 76 · `7xl` 95 px.

### Shape, depth and texture

- **Borders:** 2 px ink. **Radii** are small (3/6/10 px); pills only for badges.
- **Shadows** are solid offsets in `--shadow-ink` (`--shadow-offset`, `--shadow-offset-sm`), never blurred. Pressing a button pushes it onto its shadow.
- **Cubist corner:** `<Card corner="tr|tl|br|bl">` clips one corner; border and shadow follow the clipped shape.
- **Texture** (`src/styles/texture.css`):
  - Paper grain over the page at ~7%.
  - `.halftone` for large colour fields.
  - `.misreg-red|yellow|blue` misregistration for decorative drawings only, **never text**.

## Components (`src/components/ui`, `icons`, `brand`)

| Component | What it's for |
|---|---|
| `Button` | Primary (ink), secondary (paper), quiet. One primary per screen |
| `Card` | Paper card with ink border, offset shadow and optional cubist corner; `.card` / `.card-link` for simple ones |
| `EnamelPlate` | Labels and badges styled as street and house-number plates (red, blue, paper) |
| `LineBadge` | Circular A/B/C badge, after the 1970s wayfinding |
| `TileGrid` | **Signature pattern:** alternating convex and concave circles in one flat station tone, after the Line A wall panels. For section headers, loading states, stamp backgrounds and station screens |
| `Stamp` | Validator ink stamp for finished units, missions and correct answers |
| `Ticket` | Perforated ticket that holds stamps (the ticket wallet) |
| `DepartureBoard` | Split-flap text (mono, yellow on board) |
| `SectionNumber` | Numbered heading with an ink rule |
| `icons/*` | One style: 24 px grid, 1.75 px round stroke, `currentColor`, slightly imperfect. Tram, ticket, stamp, háček, beer, key, metro, speaker, arrows, done, open, terminus, review, settings, mic, pin, book, close |
| `brand/Wordmarks` | Wordmark **B (Kubismus)** in the header, favicon and app icons; A and C kept in `/styleguide` as the drafts |
| `GenderMark` | The one gender marker on every noun: mono Czech abbreviations (`m·živ`, `m·neživ`, `ž`, `s`) with the full name for screen readers |
| `CzechText` + `features/lens/*` | **Case lens.** Lens-annotated endings are underlined in their case colour; tap → bottom sheet on phones, popover from 640px. Shows case number + name, *why* (function), the pattern (vzor) and links. A word containing a blank is never tappable |
| `features/home/LineStrip` | The strip map: one straight line, names at −45°, done = ink, here = line-B yellow with a pin, výluka = dashed, milestone = double ring, transfers as small badges. Scrolls to "you are here" |
| `features/line/StationHeader` | Station screens: tile band, enamel-style name sign, line/level/position, transfers, *Nahoře* (above ground) |
| `FeedbackPanel` | Right: validator stamp + *Správně.* Wrong: wavy ink underline on the wrong part, the right part in Vltava, lens explanation, then the short *why*. No green/red |
| `UnitComplete` | The validator moment: ticket rises in, stamp punches it (≤250ms each) |

**Screens are assembled from these; every reusable pattern is shown live in
`/styleguide` § 8.**

**The háček (ˇ)** is the brand motif: in the wordmark and icon, as the bullet
in explanations (`.prose-cz ul`), as the loading tick, and as the "aha" mark
in grammar tips.

## Motion

Mechanical and short: 120–250 ms (`--dur-fast`, `--dur`, `--dur-max`), with
`--ease-mech`. Examples: a ticket being punched (`animate-punch`), a station
sliding past, split-flap characters. Every animation is removed under
`prefers-reduced-motion`; components that move also check
`useReducedMotion()` and render their final state.

## Voice and microcopy

Youthful, wry, a little deadpan, the way a Czech friend talks. Warm, never
saccharine. Czech words where context makes them clear (*Hotovo.* *Jedeme.*
*Ještě jedno?*); English for explanations. No exclamation-mark overload. Errors are friendly and
specific. Empty states have personality (*"Tady nic není. Like a tram stop at 3 a.m."*).

**The country's name.** In the app's own voice it's **Czechia** (the official short name since 2016; *Česko* in Czech). **The Czech Republic** is for the state itself and official things: institutions, documents, laws, forms, quotes and the 1993 founding. Page metadata says "Czechia (the Czech Republic)" once, for search. In lessons, *Česko* in everyday sentences, *Česká republika* in formal ones. `tests/country-name.test.ts` enforces it with an allowlist.

## Accessibility

- WCAG AA contrast for all text, tested in both themes.
- Visible 3 px Vltava focus ring; keyboard reachable everywhere; skip link.
- Touch targets ≥ 40 px (buttons are 44 px high).
- Never colour alone: cases carry their number, lines their letter, feedback its words.
- Phone first: designed at 375 px, then scaled up; no sideways scrolling except deliberate scroll areas (wide tables, the metro map, the strip map).
- Dialogs (the lens) take focus when opened, close on Escape or outside tap, and return focus to the word. After an answer, focus moves to *Continue*.

## Adding something new

- [ ] Uses tokens only (the tests will tell you)
- [ ] Line colours only for lines and levels; case colours only in the case lens
- [ ] Czech marked `lang="cs"`
- [ ] At most one primary button
- [ ] Works at 375 px, in light and noční tramvaj, and with reduced motion
- [ ] Added to `/styleguide` if it's a reusable piece
