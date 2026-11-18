# Batch 8, part 1 of 9: The other word decks

150 items, roughly 60 minutes. Sheet: `batch-08-words-part-1.csv`. How to fill it in: docs/REVIEWERS.md.

For each row, put **OK**, **Fix** or **Unsure** in `verdict`. For Fix, write the corrected Czech in `corrected_czech` (or explain in `comment`). Put your initials in `reviewer`. Leave rows blank if you skip them.

## Questions we already have about this batch

### Round 3 · A7 Phrase deck (*Fráze*)

| Where | Text | Question |
|---|---|---|
| phrases/phrases.json | 48 phrases in 8 situations; 26 are entries from the official A1 inventory (NPI ČR), the rest from our lessons and guides | Natural as whole sentences? Right register (vy/ty)? |
| phrases | *Vystupujete?* (ours) | Is this what you say to get past someone to the door? |
| phrases | *Platím hotově.*, *Zaplatíme, prosím.*, *Je byt ještě volný?* | Natural? |
| situation names | *Když nerozumíte, Kavárna a pekárna, Placení, V práci, Telefon, U lékaře a v lékárně, Doprava, Byt* | Natural titles? |


### Round 3 · Step 3 Core vocabulary decks (*Slovíčka*)

About 1,240 words in 15 topic decks (`content/words/*.json`), each with an English gloss, gender or aspect, notes and, for the 300 most frequent, an example sentence. That's too many to check at once, so **please sample in this order:**

1. **Deck 1, *Základní slova*** (the little words: conjunctions, pronouns, prepositions with their case). The most frequent words and the easiest to get subtly wrong.
2. **The 300 example sentences** (the words with an `example` field). Natural? Is the English a fair translation?
3. **Everything else**, a deck at a time.

| Where | Text | Question |
|---|---|---|
| all decks | Glosses, e.g. *hodný* "kind, good (of people)", *volno* "time off", *brigáda* "part-time or summer job" | Is the gloss the meaning an expat needs first? |
| prepositions (deck 1) | Case notes, e.g. *k* + dative, *při* + locative, *proti* + dative, *nad/pod* + instrumental | Correct, and the right first case to teach? |
| nouns | Gender and animacy (*m-anim*, *m-inan*, *f*, *n*), e.g. *host* m-anim, *kolej* f, *pokladní* f (a man is *ten pokladní*) | Correct? |
| verbs | Aspect, and partners from `verbs.json`; pairs inside the decks such as *omlouvat se / omluvit se*, *mýt / umýt*, *prodávat / prodat* | Correct aspect? Right partner? |
| job titles | Feminine forms given as a note and accepted answer, e.g. *lékař* (woman: *lékařka*), *úředník* (*úřednice*), *zaměstnanec* (*zaměstnankyně*) | Right feminine forms? |
| synonyms | Words with the same gloss accept each other when typed: *vlevo/nalevo*, *vpravo/napravo*, *pokoj/místnost*, *patro/poschodí*, *pekárna/pekařství*, *poslat/odeslat*, *fotit/fotografovat*, *hezký/pěkný* | Close enough to count as the same answer? Or should the glosses tell them apart? |
| spoken vs written | Alternatives accepted, e.g. *chléb/chleba*, *dnes/dneska*, *brzo/brzy*, *moct/moci* | Is the headword the right one to teach first? |
| examples | e.g. *Volám, abych se objednal.*, *Při jídle nemluví.*, *Co dávají v kině?*, *Musím na odběr krve.* | Natural? A1-friendly? |


### Round 3 · Step 4 A2 vocabulary

About 420 more deck words (A2 pass), chosen by corpus frequency within the exam's topics, plus 79 new example sentences for words that moved into the 300 most frequent, e.g. *Až: Zavolám, až přijdu domů.*, *Prý bude stávka.*, *Zout se: Guests usually do, at home.* Please check the glosses, genders and aspects as for step 3.
