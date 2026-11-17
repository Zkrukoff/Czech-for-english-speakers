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

## Overheard in Prague

Each line is played by a placeholder synthetic voice until its recording is listed in the manifest. Record the **spoken** version where one is given: that's how people actually talk, and it's what the scenes teach. For announcements, record the official wording exactly (or use an official recording only if PID/DPP grants permission).

| Recording id | Say (standard) | Spoken version, if recording it that way | Scene |
|---|---|---|---|
| `oh-bus-1` | Příští zastávka: Nádraží Veleslavín. |  | On the bus |
| `oh-bus-2` | Pro výstup stiskněte tlačítko. |  | On the bus |
| `oh-bus-3` | Promiňte, vystupujete? | Pardon, vystupujete? | On the bus |
| `oh-bus-4` | Ne, pustím vás. |  | On the bus |
| `oh-bus-5` | Děkuju. |  | On the bus |
| `oh-checkout-1` | Dobrý den. |  | At the checkout |
| `oh-checkout-2` | Dobrý den. |  | At the checkout |
| `oh-checkout-3` | Máte zákaznickou kartu? | Máte kartičku? | At the checkout |
| `oh-checkout-4` | Nemám, děkuju. |  | At the checkout |
| `oh-checkout-5` | Dvě stě čtyřicet osm korun. |  | At the checkout |
| `oh-checkout-6` | Kartou, prosím. |  | At the checkout |
| `oh-checkout-7` | Chcete účtenku? | Účtenku chcete? | At the checkout |
| `oh-checkout-8` | Ne, nemusím. |  | At the checkout |
| `oh-checkout-9` | Na shledanou. |  | At the checkout |
| `oh-metro-1` | Ukončete, prosím, výstup a nástup, dveře se zavírají. |  | On the metro |
| `oh-metro-2` | Příští stanice: Můstek. Přestup na linku B. |  | On the metro |
| `oh-metro-3` | Vystupujeme na Můstku, že? | Vystupujem na Můstku, jo? | On the metro |
| `oh-metro-4` | Ano, a pak přestoupíme na linku B. | Jo, a pak přestoupíme na béčko. | On the metro |
| `oh-pharmacy-1` | Dobrý den, co pro vás? |  | At the pharmacy |
| `oh-pharmacy-2` | Dobrý den, máte něco na bolest v krku? | Máte něco na krk? | At the pharmacy |
| `oh-pharmacy-3` | Máte i kašel nebo horečku? |  | At the pharmacy |
| `oh-pharmacy-4` | Ne, jen mě bolí v krku. |  | At the pharmacy |
| `oh-pharmacy-5` | Tak tyhle pastilky. Jednu třikrát denně, nejdéle pět dní. |  | At the pharmacy |
| `oh-pharmacy-6` | Děkuju. Kolik to stojí? |  | At the pharmacy |
| `oh-pharmacy-7` | Sto dvacet korun. |  | At the pharmacy |
| `oh-pub-1` | Dobrý den, co to bude? |  | At the pub |
| `oh-pub-2` | Jedno pivo, prosím. |  | At the pub |
| `oh-pub-3` | Velké, nebo malé? | Velký, nebo malý? | At the pub |
| `oh-pub-4` | Velké. | Velký. | At the pub |
| `oh-pub-5` | Ještě jedno? |  | At the pub |
| `oh-pub-6` | Ano, ještě jedno. A pak zaplatíme. | Jo, ještě jedno. A pak zaplatíme. | At the pub |
| `oh-pub-7` | Dohromady, nebo zvlášť? |  | At the pub |
| `oh-pub-8` | Zvlášť, prosím. |  | At the pub |
