# Batch 1: Emergency cards and phrases

39 items, roughly 16 minutes. Sheet: `batch-01-emergency.csv`. How to fill it in: docs/REVIEWERS.md.

For each row, put **OK**, **Fix** or **Unsure** in `verdict`. For Fix, write the corrected Czech in `corrected_czech` (or explain in `comment`). Put your initials in `reviewer`. Leave rows blank if you skip them.

## Questions we already have about this batch

### Round 2 · A5 Emergency cards

| Where | Text | Question |
|---|---|---|
| emergency/cards.json | All six cards (doctor, pharmacy, police, locked out, lost, accident): the "show to a Czech" messages and every phrase | Natural, polite enough for a stranger, and right for the situation? |
| emergency/cards.json | Masculine/feminine pairs (*Zabouchl / Zabouchla jsem si dveře*, *Ztratil / Ztratila jsem…*); the show messages use the masculine form | Should the show screens offer both? |
| pharmacy | "Prescriptions are electronic (eRecept)" | Still accurate? Not yet verified against an official page. |
| ShowMode.tsx | Label *Ukažte to* on the single-screen show mode | Natural? |
| verified | 112, 150, 155, 158 (portal.gov.cz, mv.gov.cz) and 156 (mv.gov.cz); DPP line and lost-and-found office (pid.cz), checked 17 Nov 2026 | Re-check yearly. |
