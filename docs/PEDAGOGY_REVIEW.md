# Is Pražák teaching Czech the best way it can?

*An honest review of the teaching method, 18 November 2026. No code has been
changed; the recommendations wait for approval.*

## How to read this

Every claim is labelled with how well it's supported:

- **[Strong]** replicated experiments or meta-analyses;
- **[Moderate]** several studies, or a consensus in the field, with caveats;
- **[Weak]** influential but contested, or little direct evidence;
- **[Data]** measured in our own content for this review;
- **[Official]** from a Czech government or examining body, checked on the date
  given;
- **[Opinion]** my judgement, including where I think we made a mistake.

Severity and effort use the same scale as AUDIT.md: **Critical / Important /
Nice to have**; effort **S** (< 1 day), **M** (1–3 days), **L** (1–2 weeks),
**XL** (> 2 weeks, or needs native speakers or voice talent).

## The short version

Pražák's *architecture* is good and in places better than the big apps:
- a functional order for the cases;
- the case lens, which explains every ending in context;
- spaced repetition that covers ending patterns, not just words;
- typed production with diagnostic feedback;
- chunks before analysis;
- vykání taught as a social skill.

Those choices match the research on adult learners of inflected languages.

The *content* is the problem: there isn't enough of it in the forms that
matter most.

1. **There is almost no listening.** [Data]
   - The app has zero audio recordings, so its listening exercises are switched
     off.
   - Pronunciation is taught from text.
   - The only listening is five Overheard scenes in a synthetic voice.

   Adults learn to understand speech by hearing a lot of it at a level they can
   follow. [Moderate] The A2 exam is 40% oral, plus a 40-minute listening paper.
   [Official]
2. **The vocabulary is too small for the level we claim.** [Data] Line A ends
   at an "A2 check", but its word lists cover **16% of the official A1 word
   inventory** and **3% of A2**. Counting every word that appears anywhere in
   the lessons, it's still only 18%.
3. **Practice is mostly English→Czech translation** (111 of 329 exercises).
   [Data] Translation is useful practice, but this much, with so little input,
   is the profile of a grammar course, not a course that gets people talking.
   [Opinion, consistent with Moderate evidence]
4. **Round 2 went mostly into motivation and practical extras before the core
   was finished.** [Opinion]
   - The station wall, the ticket, idioms, the sports guide and holiday prep
     each have some value.
   - But together they cost about as much work as recording Line A and doubling
     its vocabulary would have.
   - I recommended and built them; that was the wrong order.

The fix is **not** a restructure. The line-and-station structure, the lens,
the review system and the progress model can all stay. What's needed is a
**listening layer, a vocabulary layer and a speaking layer** added inside the
existing units, plus an **exam track** for the A2 permanent-residency test.
Existing progress survives all of it (details in § 6).

---

## 1. What a learner actually does today

[Data: counted from the content on `main` at `589ad00`.]

**Path.**
1. **Onboarding:** who you are, your level, a vy/ty quiz, your home station.
2. **Line A, the only line in service.** It has 17 stops: a pronunciation
   station (Motol), five unit stations, closed stations (*výluka*), and
   milestone checks at Můstek, Muzeum and Depo Hostivař. The units:

   | Unit | Topic | Lessons |
   |---|---|---|
   | u01 | Meeting people at work | 4 |
   | u02 | Coffee and lunch | 4 |
   | u03 | Getting around | 4 |
   | u04 | People at work | 4 |
   | u05 | Vy or ty? | 2 |

   Each unit has a mission done in real life and a unit check for its can-do
   goals.

**A lesson.** Explanation (with grammar previews) → vocabulary (4–14 items) →
a dialogue (5–10 lines, read, not heard) → practice (6–9 exercises, missed
ones retried at the end).

**Topic order for grammar** (by the skills tags on exercises):
- **u01:** the verb *být*, the present tense, reflexives (*jmenovat se*);
  genitive and locative met as chunks (*z Anglie, v Praze*); the vocative.
- **u02:** accusative (*kávu*), the conditional as a chunk (*chtěl bych*), the
  instrumental (*s mlékem*), modals; aspect and the past met in "the bill".
- **u03:** locative, genitive, motion verbs, the imperative.
- **u04:** nominative adjectives, accusative, the dative (*je mi 30*).
- **u05:** vy/ty forms and the vocative.

**Exercises, across the whole app (329):**

| Kind | Count | Share | What the learner does |
|---|---|---|---|
| Translate EN→CS | 111 | 34% | types Czech |
| Translate CS→EN | 25 | 8% | understands written Czech |
| Multiple choice (knowledge, vy/ty) | 59 | 18% | recognises |
| Question (typed Czech) | 36 | 11% | types Czech |
| Fill the ending | 33 | 10% | types an ending |
| Dialogue complete | 20 | 6% | types a line |
| Conjugate | 19 | 6% | types a form |
| Case select | 13 | 4% | chooses a case |
| Speak (self-graded, no model audio) | 7 | 2% | speaks |
| Aspect choice | 4 | 1% | chooses |
| Read real texts | 2 | <1% | reads a sign |
| Listening, minimal pairs | 3 + 4 | hidden | none, no recordings |

**Balance:**
- **Input** (listening and reading for meaning): the 18 dialogues (about 130
  lines), 25 CS→EN items, 5 Overheard scenes in a synthetic voice, and the
  guides (mostly in English with Czech phrases). **Listening: effectively
  zero.**
- **Output:** about 220 typed-Czech items (67%), 7 speaking items.
- **Drills** (endings, forms): about 65 items, plus the endless pattern
  reviews.

**Review.** FSRS spaced repetition over:
- words (`vocab:`);
- exercises (`ex:`);
- **ending patterns** (`pattern:<vzor>:<case>`), so *kávu* and *vodu* review
  "žena, accusative singular" together;
- **case functions** (`fn:`, e.g. "object", "after *z*").

Sessions mix all kinds in due order. Learners can add their own words. Today's
ride sizes a session by metro stops.

**Vocabulary** [Data]:
- 237 items in lessons, of which 72 are multi-word chunks;
- 115 nouns with generated declensions;
- 85 verbs with conjugations.

## 2. The method against the research

### 2.1 Comprehensible input: not enough, and none of it heard — Critical

- **The evidence.**
  - Krashen's claim that comprehensible input is *sufficient* is contested.
    [Weak] (Krashen 1982)
  - That large amounts of input at the right level are *necessary* for
    comprehension and fluency is the mainstream view. [Moderate]
  - Learners need to know about 95–98% of the words in a text to understand
    it, which means thousands of word families for real speech.
    [Moderate–Strong] (Nation 2006; Hu & Nation 2000)
  - Listening is a separate skill that only develops by listening, including
    to the speed and reductions of real speech. [Moderate] (Vandergrift & Goh
    2012)
- **What we do.**
  - About 130 lines of written dialogue across Line A.
  - Zero recordings.
  - Synthetic speech only in Overheard and the listen buttons.
  - No graded reading beyond the dialogues.

  [Data]
- **Assessment.** This is the biggest gap. A learner can finish Line A having
  never heard Czech in the app. For the residency exam, listening plus the oral
  is 65 of 110 points. [Official]
- **The "real speakers only" rule** (decision D6) was right for pronunciation
  models but wrong as a reason to have no listening at all. [Opinion]
  - Modern Czech TTS is intelligible.
  - Clearly labelled synthetic audio for *comprehension* practice is far better
    than silence.
  - Recordings can replace it item by item later.

### 2.2 Retrieval, spacing and interleaving: our strongest area — keep

- **The evidence.**
  - Practising recall beats re-reading. [Strong] (Roediger & Karpicke 2006)
  - Spacing beats massing. [Strong] (Cepeda et al. 2006)
  - Interleaving related problem types helps learners tell them apart,
    including for L2 grammar. [Moderate] (Nakata & Suzuki 2019; Pan et al.
    2019, Spanish verb conjugation)
- **What we do.**
  - Every exercise is recall: typed, not recognised.
  - FSRS schedules words, exercises, *ending patterns* and *case functions*.
  - Review interleaves kinds.
  - Missed items are retried within a lesson.
- **Assessment.** Better than most apps: spacing grammar patterns (not just
  words) is unusual and well-founded. [Opinion on uniqueness; Strong on
  principle]
- **Two weaknesses.**
  - Lesson practice is *blocked*: every exercise is from that lesson.
  - Unit checks only test their own unit.

  Mixing 20–30% of earlier material into each lesson would apply interleaving
  where it matters most, *while* the new pattern is fragile. [Moderate]

### 2.3 Explicit grammar vs exposure: right balance for adults — keep, add exposure

- **The evidence.**
  - For adults, explicit instruction (rules, plus practice with feedback)
    produces larger gains than implicit exposure alone, and the gains last.
    [Strong] (Norris & Ortega 2000; Spada & Tomita 2010; Goo et al. 2015)
  - The effect is clearest for features that are hard to notice, such as
    inflectional endings, which is exactly Czech. [Moderate] (DeKeyser 2005; N.
    Ellis 2006 on "learned attention")
  - Explicit knowledge needs a lot of meaningful use before it becomes
    automatic. [Moderate] (DeKeyser 2007, skill acquisition)
- **What we do.** Short explanations, the lens on every annotated ending, and
  lots of form practice.
- **Assessment.** Right for Czech and for adults. What's missing is the second
  half: lots of meaningful input where those endings recur (2.1), so the rules
  have something to work on. [Opinion]

### 2.4 Frequency: half right — Important

[Data] Vocabulary ranked against the Czech National Corpus SYN2015 lemma list
(Křen et al., ÚČNK; 126,973 lemmas):

| Our single-word vocab (165) | Share |
|---|---|
| In the top 500 lemmas | 27% |
| In the top 2,000 | 52% |
| Beyond 10,000, or absent | 18% |

The "beyond 10,000" words are mostly holiday words (*kraslice, pomlázka,
přípitek*) and some words common in speech but rare in writing (*čau,
spropitné*).

- **What's missing.** Core lemmas from the top 400 are never taught as
  vocabulary: *protože, když, který, člověk, čas, peníze, týden, hodina,
  měsíc, dnes, škola, jméno, muž, žena, auto, ulice, cena, práce* (via
  *pracovat* only), among others.
- **The better yardstick for our learners** is the exam's own word list.
  [Official, checked 18 Nov 2026] NPI ČR publishes a *Soupis lexikálních
  jednotek* for the residency exam: 1,455 A1 entries (1,204 single words) and
  1,682 A2 entries. Against it:

  | Measure | Coverage |
  |---|---|
  | A1 single words in our vocabulary lists | **194 of 1,204 (16%)** |
  | A2 single words in our vocabulary lists | **38 of 1,369 (3%)** |
  | A1 words appearing in any lesson text (exact forms) | 221 (18%) |
- **The caveat.**
  - Written-corpus frequency underrates spoken words. The CNC's ORAL corpus
    would be a better guide for a speaking-first course.
  - Exact-form matching undercounts inflected uses a little.

  Neither changes the conclusion: Line A teaches roughly a fifth of A1
  vocabulary. [Data]
- **What follows.**
  - Labelling Line A "A1–A2" with an "A2 check" at the end overclaims. A learner
    who finishes it is a strong early A1 in grammar and a weak A1 in
    vocabulary. [Opinion]
  - Either relabel it, or add the vocabulary.

### 2.5 Chunks before analysis: good — keep

- **The evidence.**
  - Formulaic sequences make up a large part of fluent speech.
  - Learning them as wholes speeds early fluency and later helps learners
    notice the grammar inside them.

  [Moderate] (Wray 2002; Boers & Lindstromberg 2012)
- **What we do.**
  - 72 of 237 vocabulary items are chunks: *Dobrý den, Těší mě, Máte vybráno?,
    chtěl bych, Jak se máte?*
  - Cases appear first inside chunks (*z Anglie, v Praze, s mlékem*) and are
    analysed later.
- **Assessment.** Well done.
- **A gap.** There's no chunk *review deck* that drills them by situation
  ("at the bakery", "on the phone").
- **About the example in your brief.** The vocabulary has *kartou* and *Máte…?*
  separately, but *Můžu platit kartou?* is not a vocabulary item. [Data] It
  should be: it's precisely the kind of high-value chunk the research supports.

### 2.6 Speaking practice and feedback quality: weak — Important

- **The evidence.**
  - Producing language pushes learners to notice gaps. [Moderate] (Swain 1985,
    2005)
  - Interaction with feedback helps. [Moderate–Strong] (Long 1996; Mackey &
    Goo 2007)
  - Corrective feedback works, and more explicit feedback works better for
    beginners. [Strong] (Li 2010; Lyster & Saito 2010)
  - For pronunciation, perception training with many voices transfers to
    production. [Moderate] (high-variability phonetic training: Logan, Lively &
    Pisoni 1991; Thomson 2018)
- **What we do.**
  - *Written* feedback is a real strength: the wrong ending is underlined, the
    right one shown, and the lens explains why. [Opinion, aligned with Strong
    evidence]
  - *Spoken:* 7 exercises; the learner records themselves and grades
    themselves with no model to compare against.
- **Assessment.** Speaking is nominal.
- **What would help at our scale (no server, no human tutor):**
  - **Shadowing** (listen, repeat, compare with a recording of yourself),
    once there's audio.
  - **Exam-style speaking prompts** with model answers.
  - **Minimal-pair perception training** with real recordings.

  Automatic pronunciation scoring for Czech in the browser isn't reliable
  enough to promise. [Opinion]

### 2.7 Motivation and retention: the ticket, stamps and wall

- **The evidence.**
  - Gamification's effects on *engagement* are generally positive but
    context-dependent. [Moderate] (Hamari, Koivisto & Sarsa 2014)
  - The evidence that it improves *learning* is thinner. [Weak]
  - Self-determination theory suggests rewards for competence and progress
    support motivation; rewards for mere activity can undermine it. [Moderate]
    (Ryan & Deci 2000)
  - Regular practice is good for spaced retrieval. [Strong]
  - A streak keeps practice regular, but it only helps learning if it's tied
    to the reviews being *due*. [Opinion]
- **What we have.**
  - **Stamps** for can-do goals passed in unit checks: competence-based,
    good.
  - **Station wall:** fills per finished lesson. Progress-based; fine.
  - **Ticket:** one answer validates the day. Activity-based; the weakest of
    the three for learning.
- **Assessment.**
  - Keep all three, but make the ticket count a *review session* (or all due
    items, whichever is smaller) rather than any single answer. Then the
    habit and the spacing reinforce each other.
  - Build no more engagement features until the learning core is complete.

  [Opinion]

## 3. The hard parts of Czech, one by one

| Topic | What we do | Verdict | Severity |
|---|---|---|---|
| **The seven cases: order** | Functional and need-driven: genitive and locative appear early as chunks, accusative is taught first as a system, then the locative, genitive, instrumental and dative; the vocative comes early because names matter at work | **Keep.** Teaching by need is what most Czech-for-foreigners courses do. No order is "proven"; the evidence favours meaningful contexts plus explicit rules over a fixed sequence [Moderate]. Our order is defensible [Opinion] | — |
| **Function vs tables** | Both: lens explanations by function, plus full tables (`/grammar/tables`, vzor pages) | **Keep both.** Function for meaning, tables for patterns; learners need both [Opinion, consistent with explicit-instruction evidence] | — |
| **Vzory, gender, animacy** | One gender mark on every noun (m·živ, m·neživ, ž, s), vzor pages, generated declensions for 115 nouns, ending-pattern review | **Strong.** Make gender visible on every new noun in the dialogues too, not only in vocabulary | Nice |
| **Aspect** | A grammar page, an aspect-pairs list, and 4 aspect-choice exercises; aspect met first in "the bill" (*zaplatit*) | **Too thin.** Aspect is introduced but barely practised. Pairs should be learned as pairs in vocabulary (*platit / zaplatit*), with more contrast exercises in the past and future | Important · M |
| **Motion verbs and prefixes** | A grammar page; *jít / jet / chodit / jezdit* in u03; transport guide exercises | **Adequate for A1.** Prefixes (*při-, od-, vy-, pře-*) aren't taught; the transport context is the ideal place (*vystoupit, přestoupit*) | Nice · M |
| **Numbers and case** | Numbers page (1 / 2–4 / 5+ with the noun forms); prices in u02 | **Good.** Needs much more practice: prices, times, ages, dates are top A2 exam content [Official, syllabus areas] | Important · S |
| **Word order and clitics** | No dedicated page. Clitics are mentioned in the pages on *být*, the past, reflexives and the conditional; the `buildSentence` exercise type exists, but **no exercise uses it** [Data] | **Missing.** Second-position clitics (*jsem, se, si, mi, ho*) and their order are a well-known stumbling block for English speakers. Topic-focus word order (new information last) is never named | **Important · M** |
| **Reflexive verbs** | A grammar page; *jmenovat se* in lesson 1 | **Fine for A1.** *se/si* placement depends on the clitic topic above | — |
| **Pronunciation** | Alphabet with 42 letters, a guide, minimal pairs; **no audio** | **Critical gap** (see 2.1). ř, vowel length (*být/bit*, *pas/pás*) and first-syllable stress need hearing. Perception practice before production is the evidence-based order [Moderate] | Critical · XL |
| **Spoken vs standard** | "How Pražáci say it" notes from lesson 1 (*dobrej, mlíko, seš*), receptive only; production is standard Czech | **Right call.** Recognise spoken forms early, produce standard. That's what Prague learners need [Opinion]. Keep notes receptive until A2 | — |
| **Vykání / tykání** | A whole unit, the onboarding quiz, *Můžeme si tykat?*, who offers | **Excellent,** better than any app I know of [Opinion]. Keep | — |

## 4. How Czech is taught elsewhere

### Czech-for-foreigners course books

**[Official] The exam body's recommendations.** NPI ČR recommends course books
for the residency exam (checked 18 Nov 2026):
- **A1:** *Česky, prosím I* (Cvejnová); *Čeština expres 1–2* (Holá &
  Bořilová); *Česky krok za krokem 1* (Holá); *Česky v Česku I–II* (Štindlová,
  ÚJOP UK); *Basic Czech I*; *Easy Czech Elementary*; *Čeština pro cizince
  A1/A2*.
- **A2:** *Česky, prosím I–II*; *Čeština expres 1–4*; and others.

**[Moderate, from the books' published descriptions; Opinion where
generalised] What they share:**
- **Communicative units by situation:** greeting, shopping, the doctor, the
  office. We do the same.
- **Grammar introduced by need.** Cases come in early and in functional order,
  usually the accusative early with *mít / chtít / dát si*, then the locative
  with *v / na*. Close to ours.
- **Every dialogue is recorded,** with pronunciation exercises from the start.
  We have neither.
- **Much more vocabulary per unit,** organised by topic and matching the A1/A2
  lists. We teach a fraction.
- **Reading and listening texts** beyond dialogues.
- **Speaking tasks with a partner,** which an app can only approximate.

The textbooks are the right benchmark for *coverage*. Pražák beats them on
explanations at the point of need (the lens), review and context. It loses on
audio, vocabulary and volume of practice.

**ÚJOP UK** (Charles University's Institute for Language and Preparatory
Studies) runs intensive courses, typically 20+ hours a week, and co-authored
*Česky v Česku*. [Moderate: describes the institute generally. I didn't verify
course hours on ujop.cuni.cz for this review; treat the number as approximate.]

**How long it takes.** The US Foreign Service Institute puts Czech in its
"hard" category (about 1,100 class hours to professional proficiency for
English speakers). [Moderate: FSI's published categories; not CEFR-calibrated]
The NPI recommends at least a 50-hour course before the A2 residency exam
[Official], which assumes active classroom hours plus homework.

### Apps

What strong Slavic-language apps and methods do differently from Duolingo
[Opinion, from public product descriptions]:
- **Audio-first courses** (e.g. Pimsleur, which has a Czech course): spaced
  oral recall, no reading at first. Strong for listening and speaking; weak on
  grammar explanation.
- **Cloze-in-context drills** (e.g. Clozemaster): high-frequency words in real
  sentences. Pure frequency-driven input and recall.
- **Reading-and-listening platforms** (e.g. LingQ): large graded input with
  lookup. Strong on input, weak on structure.
- **Duolingo's Czech course:** translation-heavy sentence practice with
  gamified streaks. Its own research reports progress on reading and listening
  in some languages (Jiang et al., Duolingo research reports). [Weak: vendor
  research]

Pražák is closest to a course book with better feedback. The missing pieces
are exactly what the audio-first and input-first apps do well.

## 5. The residency exam

**[Official, checked on cestina-pro-cizince.cz and in the NPI ČR notice of 15
October 2025, on 18 November 2026]**

- **Level:** A2 (CEFR). A new format applies from **11 April 2026**: some
  writing and speaking tasks changed, with more weight on interaction,
  initiative and A2 vocabulary for everyday situations.
- **Format, one day:**

  | Part | Time | Points |
  |---|---|---|
  | Reading | 40 min | 25 |
  | Writing | 25 min | 20 |
  | Listening | about 40 min | 25 |
  | Oral: answering questions, talking about pictures | about 15 min | 40 |

- **Pass:** 60% of the written parts (42 of 70) **and** 60% of the oral (24 of
  40).
- **The exam body's own advice:** "You don't need to know grammar well, but you
  must understand and communicate in basic everyday situations"; the oral is
  "the most important part"; at least a 50-hour course.
- **Materials:** model tests (old and new format), the A1/A2 *Soupis
  lexikálních jednotek* (word inventory), and the *Referenční popis* (the
  syllabus).

**Would Pražák prepare someone today? No.** [Opinion, based on the Data above]

| Exam part | Pražák today |
|---|---|
| Reading (25) | Partly: short dialogues and signs, but texts far shorter than the exam's |
| Writing (20) | Partly: typed sentences, never a short message or form |
| Listening (25) | **Not at all** |
| Oral (40) | **Not at all** beyond self-graded repetition |
| Vocabulary | About a fifth of A1, against an exam built on A1 + A2 |
| Grammar | More than enough: the exam says it doesn't need perfect grammar |

So we over-teach the part the exam cares least about and under-teach the
parts that decide a pass.

**Proposal: an exam track, "Linka A2 · Zkouška"** (Important, L), built on the
existing pieces:
- **Vocabulary by exam topic:** the official inventory's A1 and A2 words, as
  spaced-repetition decks per syllabus chapter (family, housing, health, work,
  shopping, transport, offices). It reuses the vocabulary cards. *L.*
- **Listening papers:** exam-format tasks (announcements, short dialogues,
  multiple choice and matching), TTS first, recordings later. Reuses the
  Overheard player and multiple choice. *L.*
- **Reading papers:** exam-format texts with multiple choice and matching.
  Reuses `readReal` and multiple choice. *M.*
- **Writing tasks:** a short message or form in the exam's format (check the
  current word limits in the new-format model test), with a model answer and a
  checklist. Self-assessed; no automatic grading promised. *M.*
- **Oral practice:** the exam's question types and picture descriptions, timed,
  with model answers to listen to and a recording to compare against. *M.*
- **A mock exam** with the real timing and points, scored automatically for
  reading and listening. *M.*
- **Copyright:** we write our own tasks *in the official formats*. We link the
  official model tests; we don't copy them.

## 6. Recommendations

### Keep

| What | Why |
|---|---|
| Functional case order, chunks first | Matches how adults learn inflection best: meaningful contexts plus explicit rules [Moderate–Strong] |
| The case lens and diagnostic feedback | Explicit, targeted feedback is among the best-supported interventions [Strong] |
| FSRS review including ending patterns and case functions | Spacing and retrieval [Strong]; spacing grammar patterns is unusual and well-founded |
| Typed production | Recall beats recognition [Strong] |
| Vykání / tykání as a unit | Real social need, taught well |
| Spoken forms as receptive notes | Prepares for Prague without confusing production |
| Stamps for can-do goals | Rewards competence, not activity [Moderate] |
| Missions in real life | Transfer to real use; cheap; motivating [Opinion] |

### Change

| # | Change | Why (evidence) | Effort | Affects progress? |
|---|---|---|---|---|
| P1 | **Turn listening on now with labelled TTS**, for dialogues, listening exercises and minimal pairs; replace with recordings item by item | No listening at all is the biggest gap [Moderate]; the exam is 65/110 listening + oral [Official] | M | No |
| P2 | **Relabel Line A honestly:** "A1 · part 1"; move the A2 check label to where A2 content actually is | Vocabulary is ~20% of A1 [Data] | S | No (labels only) |
| P3 | **Rebalance practice:** cut EN→CS translation from 34% to about 20%; add CS→EN, listening, reading-for-meaning and dialogue-response items | Input and comprehension practice are under-supplied; translation alone over-trains one skill [Moderate] | M | No (new exercises join the queue as unseen) |
| P4 | **Interleave lessons:** 20–30% of each lesson's practice from earlier lessons | Interleaving helps with L2 grammar [Moderate] | S | No |
| P5 | **Make the ticket reward review**, not one answer | Ties the habit to spacing [Strong on spacing; Opinion on design] | S | The ticket's day rule changes going forward; past days stay |
| P6 | **Learn aspect as pairs;** more aspect exercises | Aspect is introduced but barely practised [Data] | M | No |

### Add

| # | Addition | Why | Effort | Affects progress? |
|---|---|---|---|---|
| A1 | **Recordings:** the alphabet, minimal pairs, all Line A dialogues and vocabulary (about 400 clips, two voices) | Pronunciation and listening need real speech [Moderate] | XL (needs voice talent) | No |
| A2 | **A core-vocabulary layer:** the official A1 inventory (about 1,200 words) as topic decks in spaced review, with each Line A unit pointing at its decks | Coverage from 16% toward 80%+ of A1 [Data]; frequency drives acquisition [Moderate] (N. Ellis 2002) | L | Adds cards; nothing lost |
| A3 | **Word order and clitics:** a grammar page plus `buildSentence` exercises in every unit from u01 (*Jmenuju se…*, *Jsem z…*, *Dal jsem mu ho*) | A known difficulty for English speakers; currently untaught [Data] | M | No |
| A4 | **Speaking:** shadowing with model audio, exam-style prompts with model answers, self-recording comparison | Output plus feedback [Moderate–Strong]; the oral is 40/110 [Official] | M (after A1) | No |
| A5 | **The exam track** (§ 5) | The goal many expats actually have [Official] | L | Separate track; no change to Line A progress |
| A6 | **Graded reading:** one short text per lesson (50–150 words), built from known words plus 2–5% new | Input at the right level [Moderate] | L | No |
| A7 | **A chunk deck by situation,** including *Můžu platit kartou?* | Formulaic language for early fluency [Moderate] | S | Adds cards |
| A8 | **Native review** of all Czech (see AUDIT C1) | A language app can't ship unreviewed Czech indefinitely | XL (a person) | No |

### Stop

- **New engagement or practical-extra features** (more guides, more games)
  until P1–P3 and A1–A3 are done. [Opinion]

### Is a major restructure justified?

**No.** The structure is sound: the line, the stations, units with goals and
missions, the lens, review, the progress model. The problems are *missing
layers* and *proportions*, not the skeleton. Everything above fits inside it:
- **Listening, reading and speaking** become additional steps or exercises
  inside existing lessons.
- **Vocabulary decks** attach to units.
- **The exam track** is a new line (*Linka A2*). The metro metaphor even fits:
  Line A gets you around, the exam line gets you a permanent residence permit.
- **Labels** change honestly.

**Migration path** (existing progress is safe throughout):
1. **New exercises and steps are additive.** Completed lessons stay completed,
   the new items appear as unseen in review, and stamps stay.
2. **New vocabulary decks create new cards**, nothing more; your own words are
   untouched.
3. **Relabelling Line A** changes text only.
4. **The ticket rule change** applies from the day it ships; past days and old
   tickets are kept.
5. **If units gain lessons,** finished units keep their stamps. The new lessons
   show as open circles on the wall (honest, and an invitation), not as lost
   progress.

### Suggested order

1. **P1, P2, P4, P5, A7.** Small, immediate gains: TTS listening on, honest
   labels, interleaving, a ticket that rewards review, the chunk deck. *About
   one week.*
2. **A3, P3, P6.** Word order, rebalanced practice, aspect. *About two weeks.*
3. **A2.** The core-vocabulary layer from the official inventory. *Two weeks.*
4. **A5.** The exam track, using steps 1–3. *Two to three weeks.*
5. **A1 and A8, in parallel and continuously.** Recordings and native review:
   people we need to hire or recruit, so start finding them now.

## Where I think we made mistakes

- **Feature order (my recommendation, your approval).** Round 2 was
  mostly motivation and practical extras: the ticket, wall, idioms, sports,
  holiday prep and ride. Meanwhile the course had no audio and a fifth of A1
  vocabulary. Each feature is fine on its own; together they were the wrong
  priority.
- **"Real speakers only" (D6), applied too widely.** It was right for teaching
  ř; wrong for leaving the app silent.
- **The A1–A2 label on Line A.** It promises more than the content delivers.
- **The ticket rewards one answer.** Easy to fix.
- **Not designing against the exam from the start.** Many of our users have a
  concrete, official goal with a published syllabus and word list, and we
  didn't use either.

## Sources

**Second-language acquisition and learning science**
- Boers, F., & Lindstromberg, S. (2012). Experimental and intervention studies
  on formulaic sequences in a second language. *Annual Review of Applied
  Linguistics*, 32, 83–110.
- Cepeda, N. J., et al. (2006). Distributed practice in verbal recall tasks.
  *Psychological Bulletin*, 132(3), 354–380.
- DeKeyser, R. (2005). What makes learning second-language grammar difficult?
  *Language Learning*, 55(S1), 1–25.
- DeKeyser, R. (2007). Skill acquisition theory. In VanPatten & Williams
  (eds.), *Theories in SLA*.
- Ellis, N. C. (2002). Frequency effects in language processing. *Studies in
  Second Language Acquisition*, 24(2), 143–188.
- Ellis, N. C. (2006). Selective attention and transfer phenomena in L2
  acquisition. *Applied Linguistics*, 27(2), 164–194.
- Goo, J., et al. (2015). Implicit and explicit instruction in L2 learning:
  Norris & Ortega (2000) revisited and updated. In Rebuschat (ed.), *Implicit
  and Explicit Learning of Languages*.
- Hamari, J., Koivisto, J., & Sarsa, H. (2014). Does gamification work? *Proc.
  HICSS-47*.
- Hu, M., & Nation, I. S. P. (2000). Unknown vocabulary density and reading
  comprehension. *Reading in a Foreign Language*, 13(1).
- Krashen, S. (1982). *Principles and Practice in Second Language Acquisition*.
- Li, S. (2010). The effectiveness of corrective feedback in SLA: A
  meta-analysis. *Language Learning*, 60(2), 309–365.
- Logan, J. S., Lively, S. E., & Pisoni, D. B. (1991). Training Japanese
  listeners to identify English /r/ and /l/. *JASA*, 89(2).
- Long, M. (1996). The role of the linguistic environment in SLA. In Ritchie &
  Bhatia (eds.), *Handbook of SLA*.
- Lyster, R., & Saito, K. (2010). Oral feedback in classroom SLA: A
  meta-analysis. *SSLA*, 32(2), 265–302.
- Mackey, A., & Goo, J. (2007). Interaction research in SLA: A meta-analysis.
  In Mackey (ed.), *Conversational Interaction in SLA*.
- Nakata, T., & Suzuki, Y. (2019). Mixing grammar exercises facilitates
  long-term retention. *Modern Language Journal*, 103(3), 629–647.
- Nation, I. S. P. (2006). How large a vocabulary is needed for reading and
  listening? *Canadian Modern Language Review*, 63(1), 59–82.
- Norris, J., & Ortega, L. (2000). Effectiveness of L2 instruction: A research
  synthesis and quantitative meta-analysis. *Language Learning*, 50(3),
  417–528.
- Pan, S. C., et al. (2019). Does interleaved practice enhance foreign language
  learning? *Journal of Educational Psychology*, 111(7).
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning.
  *Psychological Science*, 17(3), 249–255.
- Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the
  facilitation of intrinsic motivation. *American Psychologist*, 55(1).
- Spada, N., & Tomita, Y. (2010). Interactions between type of instruction and
  type of language feature: A meta-analysis. *Language Learning*, 60(2),
  263–308.
- Swain, M. (2005). The output hypothesis: Theory and research. In Hinkel
  (ed.), *Handbook of Research in Second Language Teaching and Learning*.
- Thomson, R. I. (2018). High variability [pronunciation] training (HVPT).
  *Journal of Second Language Pronunciation*, 4(2).
- Vandergrift, L., & Goh, C. (2012). *Teaching and Learning Second Language
  Listening*.
- Wray, A. (2002). *Formulaic Language and the Lexicon*.

These are standard references that I cite from knowledge. I did not re-open
each one for this review, so page numbers should be checked before quoting.

**Czech data and official sources** (fetched and read on 18 November 2026)
- Czech National Corpus: SYN2015 lemma frequency list (*srovnávací frekvenční
  seznamy*), wiki.korpus.cz/doku.php/seznamy:srovnavaci_seznamy; Křen, M. &
  Cvrček, V., *Lists*, FF UK 2019.
- NPI ČR: *Zkouška z češtiny pro trvalý pobyt*,
  https://cestina-pro-cizince.cz/trvaly-pobyt/ and the exam information page
  (/a2/cs/informace-ke-zkousce/).
- NPI ČR: notice of the format change from 11 April 2026 (press release, 15
  October 2025).
- NPI ČR: *Soupis lexikálních jednotek A1, A2* (online inventory, retrieved in
  full).
- NPI ČR: *Doporučené učebnice* (recommended course books).
- US Foreign Service Institute: language difficulty categories (state.gov).
  Not re-checked for this review.
