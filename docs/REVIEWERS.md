# Checking the Czech in Pražák: a guide for reviewers

Thank you for helping. Pražák teaches Czech to English speakers who live in Prague, from their first *Dobrý den* to the A2 exam for permanent residence. Every Czech sentence in it was written by non-native authors, so **none of it has yet been checked by a native speaker**. That's what we need you for.

## What you'll get

- **A spreadsheet** (a `.csv` file; open it in Excel, Google Sheets or Numbers) with one row per item: a word, a dialogue line, an exercise or a task.
- **A short note** with the same name ending in `.md`. It says what the batch is and lists questions we already have about it.
- A batch takes **about an hour**. Do as much as you like: blank rows are simply skipped.

## How to fill in a row

| Column | What it is |
|---|---|
| `czech` | The Czech to check. For an exercise, this includes the accepted answers. |
| `english` | The English the learner sees: a meaning, a prompt or the options. |
| `context` | Where it appears: the lesson, who's speaking, the situation. |
| `check` | What to look for in this kind of item. |
| **`verdict`** | **OK**, **Fix** or **Unsure**. This is the column that matters. |
| **`corrected_czech`** | For **Fix**: the Czech as it should be, written out in full. |
| **`comment`** | Anything else: why, a better alternative, a note on register. |
| **`reviewer`** | Your initials. |

Please don't change the first columns (`key` to `check`). The import uses them to find the item, and skips any row whose Czech was changed.

**OK** means a native speaker in Prague would say or write it like this, in this situation. It doesn't have to be the only way.

**Fix** means it's wrong, or nobody would say it. Write the corrected Czech. If the fix is complicated (an exercise, a whole text, several words that depend on each other), describe it in `comment` instead; a person will apply it.

**Unsure** means you're not certain, or it depends. Tell us why in `comment`.

## House rules

- **The level is A1–A2.** Simple and natural beats rich and rare.
- **Prague Czech as people speak it, taught in its standard form.** Where the spoken form differs (*dneska*, *jsem nevěděl*, *velký → velkej*), the lesson usually notes it. Tell us if a "standard" sentence would sound stiff, or if a spoken form is missing.
- **Vy or ty** as the lesson sets it: colleagues and strangers *vy*, friends and family *ty*. Flag any mix-up.
- **Exercises:** check that every accepted answer is correct Czech, and tell us about natural, correct answers we'd wrongly reject.
- **Explanations** (the English "why" lines): if one is wrong about Czech, say so.
- **Real places, prices and rules** (tram lines, offices, fees) are checked separately against official sources, so you can skip those.

## What happens next

The sheet is imported with one command:
- **OK** items are marked as reviewed.
- **Simple fixes** (a word or phrase on its own) are applied straight away.
- **Anything more complex** goes on a list for a person to apply.

The app shows how much has been checked, and the count goes up as batches come back.

## Credit

If you'd like, we'll credit you in the app (Settings → Sources) by name or initials, as you prefer. We record only the initials you put in the sheet, never contact details.
