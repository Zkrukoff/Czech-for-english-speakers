# Batch 5, part 3 of 3: Mock exam 1, the speaking models and the warm-up

18 items, roughly 58 minutes. Sheet: `batch-05-exam-mock-1-part-3.csv`. How to fill it in: docs/REVIEWERS.md.

For each row, put **OK**, **Fix** or **Unsure** in `verdict`. For Fix, write the corrected Czech in `corrected_czech` (or explain in `comment`). Put your initials in `reviewer`. Leave rows blank if you skip them.

## Questions we already have about this batch

### Round 3 · Step 4 The A2 exam track (*Zkouška A2*)

64 task sets in `content/exam/*.json` (16 task types × 2 practice sets + 1 in each of 2 mocks), all our own Czech in the official formats. **Please review in this order:**

1. **Mock 1** (`use: "mock1"` in every file): a learner's first full run.
2. **The speaking model answers** (`content/exam/speaking.json`): learners copy these aloud.
3. **The writing models** (`writing.json`), then the rest.

| Where | Text | Question |
|---|---|---|
| reading.json, listening.json | Notices, letters, adverts, dialogues and announcements, e.g. *Vážení nájemníci, v úterý 14. 4. … nepoteče teplá voda*, *Rychlík do Plzně přijede na druhou kolej, nástupiště číslo tři* | Natural? Like real Prague notices and announcements? |
| reading 4 (all sets) | Gap-fill choices that test endings, e.g. *Hledáme ___ do kuchyně* (kuchaře / kuchař / kuchařem / kuchaři) | Is exactly one option right each time? |
| reading 5, listening 5 | Accepted short answers, e.g. *ve 2. patře / 2. / ve druhém*, *v půl osmé / 19:30* | Anything a correct learner might write that isn't accepted? |
| writing.json | Situations and model answers, e.g. *Chtěla bych objednat stůl…*, *Omlouvám se, ale tento týden nepřijdu na kurz* | Natural A2 writing? Right register (vy/ty)? |
| speaking.json, task 1 | Questions and model answers, e.g. *Co rád/a jíte? – Rád jím ryby a zeleninu.* | Natural? What an examiner would ask? |
| speaking.json, task 2 | Role-play cards and model dialogues | Natural questions? |
| speaking.json, task 3 | Four past-tense stories, e.g. *Minulou sobotu jela Jana vlakem na hory…* | Natural? A2-level? |
| speaking.json, task 4 | Friend dialogues in *ty* | Natural tykání? |
| warmup.json | Ten past-tense choices and their explanations | Correct? |
| checklists (SelfAssessedTask.tsx) | e.g. "I used ty, not vy", "Joining the events (pak, potom, ale, proto)" | Fair self-checks for A2? |
