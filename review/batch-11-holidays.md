# Batch 11: Holidays and name days

80 items, roughly 50 minutes. Sheet: `batch-11-holidays.csv`. How to fill it in: docs/REVIEWERS.md.

For each row, put **OK**, **Fix** or **Unsure** in `verdict`. For Fix, write the corrected Czech in `corrected_czech` (or explain in `comment`). Put your initials in `reviewer`. Leave rows blank if you skip them.

## Questions we already have about this batch

### Phase 3: course map, lexicon, missions, name days

| Where | Text | Question |
|---|---|---|
| lines.json | Station *aboveGround* notes (moved from the transport guide) | Still accurate? |
| lines.json | Flora: no Line A service in the PID feed for 16–29 Nov 2026 | Temporary closure? For how long? Update the status note. |
| lexicon | All 88 nouns, especially the overrides: *Angličané, učitelé, ředitelé, manželé, synu, dceři, přátelé, kolegyň, přítelkyň, nástupišť, center, muzeí, roce / roku, let / roků, košil* | Correct? |
| lexicon | *máma* gen. pl. (*mam / mám*); *mléko* loc. (*mléce / mléku*); *brambory* feminine vs masculine | Marked uncertain: which forms should the app teach? |
| lexicon | *pan* (title) plural *páni / pánové*; *paní* singular is the same in every case | Correct? |
| functions.json | The 26 explanations and example sentences | Accurate and natural? Anything missing (e.g. *genitive after negation* as a recognition-only item)? |
| missions | Phrases: *Jsem nový kolega / nová kolegyně*, *S sebou, prosím*, *Zaplatím kartou*, *Jede to na Anděl?*, *Kde mám vystoupit?*, *Můj bratr je vysoký a má krátké vlasy* | Natural? |
| name days | Days flagged in `calendar/namedays.json` → `verify` (1 Jan, 1 May, 8 May, 26 Jul, 28 Sep, 25 Dec), and the calendar as a whole | Check against a current Czech calendar. |
| speak exercise | Buttons *Zvládl/a jsem to* · *Ještě ne* | Natural? |
| exercise types | Number drills generated from the lexicon: *jeden/jedna/jedno*, *dva/dvě* + nom. pl., 5+ + gen. pl. | Rules as stated OK for learners? |


### Home: holidays and navigation

| Where | Text | Question |
|---|---|---|
| calendar/holidays.json | The one-line descriptions, greetings (*Šťastný nový rok!, Veselé Velikonoce!, Veselé Vánoce!*) and which days large shops close (from the culture guide) | Accurate and current? |
| home | *Dnes · úterý 17. listopadu*, *Státní svátek*, *Příští svátek*, *za 37 dní / za 2 dny / zítra* | Natural? |
| page titles | Czech names under English titles: *Mluvnice, Slovesa, Vyhledávání sloves, Průvodce, Jízdenky, Nastavení, Opakování, Česká abeceda, Skloňování* | OK? |


### Round 2 · A3 Holiday prep lessons

| Where | Text | Question |
|---|---|---|
| calendar/holiday-lessons.json | All nine lessons: customs (lentils and no poultry at New Year; pomlázka, ribbons, a shot for adults; kissing under a blossoming cherry, Mácha's statue on Petřín; carp, Ježíšek, golden piglet, apple, walnut-shell candles), greetings, etiquette tips, vocabulary | Accurate, current, not stereotyped? |
| greetings | *Všechno nejlepší do nového roku!*, *Hezký prodloužený víkend!*, *Krásné svátky!* | Natural? |
| 28 Oct | "the president awards state honours at Prague Castle" | Accurate? |
| verified | Dates (mzv.gov.cz) and shop closures (coi.gov.cz), checked 17 Nov 2026 | Re-check yearly. |
