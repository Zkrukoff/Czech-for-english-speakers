# Recordings (decision D6)

Pronunciation work needs real Czech speakers, not text-to-speech. Until a
recording exists, the exercises that depend on it (`listenType`,
`minimalPair`) are left out of lessons and reviews automatically, and
`speak` exercises fall back to a clearly labelled synthetic voice.

## Recording scripts

`npm run audio:script` writes one script per batch to `review/audio/`: a printable page and a spreadsheet listing each clip's file name, exactly what to say, and who says it. Only clips not yet recorded are listed, so the scripts shrink as recordings come in.

| Batch | What | About |
|---|---|---|
| R1 | Sounds, minimal pairs, the door announcement | 13 clips |
| R2 | Line A dialogues (two or three voices) | 135 |
| R3 | Line A vocabulary | 199 |
| R4 | *Overheard in Prague* (the spoken version where given) | 33 |
| R5 | The phrase deck | 48 |
| R6 | Exam listening (announcements, dialogues, voicemails) | 139 |

## For speakers: how to record

- **A native Czech speaker, a quiet room** (soft furnishings help), the phone or microphone about 20 cm away.
- **Natural, normal speed:** how you'd say it to a person, not a dictation.
- **About half a second of silence** before and after each clip.
- **One file per row, named exactly** as in the script's first column, e.g. `dlg-u01-l01-2.mp3`. MP3, M4A or OGG are all fine. Most phone voice-memo apps make M4A.
- **Dialogues need two voices,** ideally a man and a woman, matching the speakers' names. Lines by the same character should be read by the same person.
- **Announcements** (R1, R6) should sound like announcements: calm, clear, a little formal. For the official metro announcement, use the official wording exactly. Don't use a real PID/DPP recording unless they've given permission.

## Adding recordings

1. Add the speaker once to `content/audio/speakers.json`: a short key, how they want to be credited (a name or initials), the licence, and **the date they gave written consent** (see below). The import refuses a speaker without one.

   ```json
   { "speakers": { "jn": { "name": "Jana N.", "licence": "CC BY 4.0, recorded for Pražák", "consent": "2026-11-20" } } }
   ```

2. Put their files in a folder and run:

   ```
   npm run audio:import -- path/to/folder --speaker jn
   ```

   Each file named after a clip is copied to `public/audio/` and listed in `content/audio/manifest.json` with the exact text, the speaker and the licence. Files whose names match no clip are reported and left alone. Importing again replaces earlier takes.

3. Run `npm test`.

Once a recording is listed, it plays everywhere that line appears, and the "computer voice" label goes. Minimal-pair and listening exercises switch themselves on as their clips arrive. Anything not yet recorded keeps the labelled computer voice, and the app never requests audio files that don't exist.

## Consent and licence (template)

*This is a template, not legal advice. Have it checked if the project's situation needs it.*

> I, **[name]**, recorded the clips listed in **[script batch(es)]** for Pražák, a free app for learning Czech. I agree that these recordings may be published in the app and its source repository under the **Creative Commons Attribution 4.0 (CC BY 4.0)** licence, which means anyone may use them, including commercially, as long as they credit me. I'd like to be credited as **[name / initials / not at all]**. I confirm the recordings are my own voice and I have the right to give this permission.
>
> Signed: **[name]**, date: **[date]**

Keep the signed copy (an e-mail reply saying "I agree" to this text is a common minimum) and put its date in `speakers.json`. To assign the recordings to the project instead of licensing them, change the licence paragraph and the `licence` field.

The same note works for reviewers, minus the licence. Reviewers give only their initials in the sheets; credit them in `content/credits.json` if they agree.
