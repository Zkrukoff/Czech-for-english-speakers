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

## Suggested first batch

The pronunciation station needs, at minimum:

- each vowel short and long (*a/á, e/é, i/í, o/ó, u/ú/ů*), in a word;
- *ř* against *ž* and *r* (e.g. *řeka / žena*, *tři / trh*);
- *ch* against *h* (*chlap / hlad*);
- *ě* after *d, t, n* and *b, p, v, m* (*děti, tělo, něco, běžet, město*);
- *ď ť ň* against *d t n*;
- stress on the first syllable in longer words (*nádraží, kavárna, vlakové nádraží*).

The phase 5 content pass will turn this into exact item ids.
