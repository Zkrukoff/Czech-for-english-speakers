# Recordings (decision D6)

Pronunciation work needs real Czech speakers, not text-to-speech. Until a
recording exists, the exercises that depend on it (`listenType`,
`minimalPair`) are left out of lessons and reviews automatically, and
`speak` exercises fall back to a clearly labelled synthetic voice.

## Adding a recording

1. Record one clip per item: a native speaker, a quiet room, normal speed,
   about half a second of silence at each end. MP3 (128 kbps) or M4A is fine.
2. Name the file after its id, lowercase ASCII with hyphens: `rec-dobry-den.mp3`.
3. Put it in `public/audio/`.
4. List it in `content/audio/manifest.json`:

   ```json
   { "id": "rec-dobry-den", "file": "rec-dobry-den.mp3", "cs": "Dobrý den.", "speaker": "Name (or initials)", "licence": "CC BY 4.0, recorded for Pražák" }
   ```

5. Run `npm test`. The exercise that uses `rec-dobry-den` now appears.

Only use recordings you have the rights to. If you use openly licensed clips
(e.g. from Wikimedia Commons), put the exact licence and author in `licence`
and `speaker`.

## Recordings the course is waiting for

Generated from the content (every `listenType`, `minimalPair` and `speak` exercise that names a recording). Record each as its own file named after the id.

| Recording id | Say exactly | Used by |
|---|---|---|
| `rec-byt` | být  (one word of the pair byt / být) | minimalPair `pron-p2` (alphabet/alphabet.json) |
| `rec-byt-byt` | byt, být | speak `pron-s5` (alphabet/alphabet.json) |
| `rec-chlad` | chlad  (one word of the pair chlad / hlad) | minimalPair `pron-p3` (alphabet/alphabet.json) |
| `rec-chleba` | chleba | speak `pron-s3` (alphabet/alphabet.json) |
| `rec-dobry-den` | Dobrý den. | listenType `pron-l2` (alphabet/alphabet.json) |
| `rec-dum` | dům | speak `pron-s4` (alphabet/alphabet.json) |
| `rec-dvorak` | Dvořák | speak `pron-s2` (alphabet/alphabet.json) |
| `rec-nadrazi` | nádraží | speak `pron-s7` (alphabet/alphabet.json) |
| `rec-pas` | pás  (one word of the pair pas / pás) | minimalPair `pron-p4` (alphabet/alphabet.json) |
| `rec-rada` | řada  (one word of the pair rada / řada) | minimalPair `pron-p1` (alphabet/alphabet.json) |
| `rec-strc-prst` | Strč prst skrz krk. | listenType `pron-l1` (alphabet/alphabet.json) |
| `rec-strc-prst` | Strč prst skrz krk. | speak `pron-s6` (alphabet/alphabet.json) |
| `rec-tri` | tři | speak `pron-s1` (alphabet/alphabet.json) |
| `rec-ukoncete-vystup` | Ukončete, prosím, výstup a nástup, dveře se zavírají. | listenType `tr-hear-doors` (guides/prague-transport/guide.json) |

For a minimal pair, record the word given; the exercise asks which of the two the learner heard. More recordings can be added at any time: speaking exercises use them as soon as they're listed.
