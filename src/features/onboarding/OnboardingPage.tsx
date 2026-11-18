import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { course } from '@/content';
import type { Profile } from '@/db/db';
import { saveProfile } from '@/db/profile';
import { Card, EnamelPlate, LineBadge, Stamp } from '@/components/ui';
import { IconArrowLeft, IconArrowRight } from '@/components/icons';
import { WordmarkKubismus } from '@/components/brand/Wordmarks';
import { compareCs, stripDiacritics } from '@/lib/text';

type Who = NonNullable<Profile['who']>;
type Level = NonNullable<Profile['level']>;

const WHO: { id: Who; label: string; note: string }[] = [
  { id: 'work', label: 'I work here', note: 'Colleagues, meetings, lunch, the office kitchen.' },
  { id: 'partner', label: 'My partner or family is Czech', note: 'In-laws, birthdays, the family WhatsApp group.' },
  { id: 'study', label: "I'm studying here", note: 'Lectures in English, life in Czech.' },
  { id: 'living', label: 'I just live here', note: 'Shops, neighbours, the doctor, the landlord.' },
  { id: 'other', label: 'Something else', note: "You'll get the same line; it just helps the examples." },
];

const LEVEL: { id: Level; label: string; note: string }[] = [
  { id: 'new', label: 'New to Czech', note: 'Ahoj and děkuju, maybe.' },
  { id: 'A1', label: 'A few words', note: 'You can order a coffee, nervously.' },
  { id: 'A2', label: 'Getting by', note: 'Shops and small talk, with some guessing.' },
  { id: 'B1', label: 'Conversational', note: 'Line A will be a fast review. Lines B and C are still being built.' },
];

const STEPS = ['who', 'level', 'vy', 'home'] as const;

const QUIZ = [
  { q: 'The shop assistant at the bakery', a: 'vy', why: 'A stranger serving you: vy, always. Dobrý den, prosím vás…' },
  { q: "Your friend's eight-year-old", a: 'ty', why: 'Children get ty. Calling a child vy sounds like a joke.' },
  { q: 'A colleague your age, on day one', a: 'vy', why: "Start with vy at work. Wait for the offer to switch: it may come in an hour, or in a year." },
] as const;

/** First run: four short questions, then straight onto the line. Existing learners never see this. */
export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [who, setWho] = useState<Who>();
  const [level, setLevel] = useState<Level>();
  const [answers, setAnswers] = useState<Record<number, 'vy' | 'ty'>>({});
  const [home, setHome] = useState<string>();
  const [query, setQuery] = useState('');

  const stations = useMemo(() => {
    const seen = new Map<string, { key: string; name: string; lines: string[] }>();
    for (const l of course.lines)
      for (const s of l.stops) {
        const e = seen.get(s.slug) ?? { key: `${l.id}/${s.slug}`, name: s.stationInfo.name, lines: [] };
        e.lines.push(l.id);
        seen.set(s.slug, e);
      }
    return [...seen.values()].sort((a, b) => compareCs(a.name, b.name));
  }, []);
  const q = stripDiacritics(query.trim().toLowerCase());
  const matches = stations.filter((s) => !q || stripDiacritics(s.name.toLowerCase()).includes(q));

  async function finish() {
    await saveProfile({ who, level, homeStation: home, vykaniIntroSeen: true });
    navigate('/', { replace: true });
  }

  const id = STEPS[step]!;
  const canNext = (id === 'who' && who) || (id === 'level' && level) || (id === 'vy' && Object.keys(answers).length === QUIZ.length) || id === 'home';

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <WordmarkKubismus className="h-10 w-auto text-ink" />
        <ol className="flex gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <li key={s} aria-hidden className={`h-3 w-3 rounded-full border-2 border-ink ${i < step ? 'bg-ink' : i === step ? 'bg-line-b' : 'bg-surface'}`} />
          ))}
        </ol>
      </div>

      {id === 'who' && (
        <fieldset>
          <legend className="font-display text-4xl font-extrabold leading-tight tracking-tight">
            <span lang="cs">Ahoj.</span> What brings you to Czech?
          </legend>
          <p className="mt-2 text-ink-2">So the examples sound like your week, not a textbook's.</p>
          <Choices options={WHO} value={who} onChange={setWho} name="who" />
        </fieldset>
      )}

      {id === 'level' && (
        <fieldset>
          <legend className="font-display text-4xl font-extrabold leading-tight tracking-tight">How much Czech do you have?</legend>
          <p className="mt-2 text-ink-2">Everyone rides Line A first. The stations built so far cover early A1, so it's quick if you know it. No test, no judgement.</p>
          <Choices options={LEVEL} value={level} onChange={setLevel} name="level" />
        </fieldset>
      )}

      {id === 'vy' && (
        <section aria-labelledby="vy-h">
          <h1 id="vy-h" className="font-display text-4xl font-extrabold leading-tight tracking-tight">
            <span lang="cs">Vy</span> or <span lang="cs">ty</span>?
          </h1>
          <p className="mt-3 text-ink-2">
            Czech has two ways to say "you". <b lang="cs">Vy</b> is polite: strangers, shops, offices, older people, your boss. <b lang="cs">Ty</b> is
            for friends, family, children and anyone who has offered it. Getting it wrong isn't a grammar mistake; it's a social one.
          </p>
          <Card corner="tr" className="mt-5">
            <div className="p-4 text-sm">
              <p>
                The switch is offered, usually by the older or more senior person: <b lang="cs">Můžeme si tykat?</b> ("Shall we say ty?"). The
                answer: <b lang="cs">Jasně, rád.</b> (a woman says <b lang="cs">ráda</b>).
              </p>
            </div>
          </Card>
          <ol className="mt-6 space-y-4">
            {QUIZ.map((item, i) => {
              const a = answers[i];
              return (
                <li key={i} className="border-2 border-ink bg-surface p-4">
                  <p className="font-semibold">{item.q}</p>
                  <div className="mt-3 flex gap-2" role="group" aria-label={item.q}>
                    {(['vy', 'ty'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        lang="cs"
                        disabled={!!a}
                        onClick={() => setAnswers((x) => ({ ...x, [i]: opt }))}
                        className={`min-h-11 min-w-20 rounded-sm border-2 px-4 font-mono text-lg font-bold ${a === opt ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-paper'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {a && (
                    <p className="mt-3 text-sm" role="status">
                      <b>{a === item.a ? <span lang="cs">Přesně.</span> : <>It's <span lang="cs">{item.a}</span>.</>}</b> {item.why}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {id === 'home' && (
        <section aria-labelledby="home-h">
          <h1 id="home-h" className="font-display text-4xl font-extrabold leading-tight tracking-tight">Your home station?</h1>
          <p className="mt-2 text-ink-2">The metro stop nearest your flat. It gets a little <span lang="cs">domov</span> mark on your map. Optional.</p>
          <label className="mt-5 block">
            <span className="label-board text-ink-3">Search</span>
            <input
              type="search"
              lang="cs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Florenc, namesti miru"
              className="mt-1 w-full rounded-sm border-2 border-ink bg-surface px-4 py-3 text-lg"
            />
          </label>
          <ul className="mt-4 max-h-72 overflow-y-auto border-2 border-ink bg-surface" role="listbox" aria-label="Stations">
            {matches.map((s) => (
              <li key={s.key} role="option" aria-selected={home === s.key}>
                <button
                  type="button"
                  onClick={() => setHome(s.key)}
                  className={`flex min-h-11 w-full items-center gap-3 border-b border-rule px-4 text-left ${home === s.key ? 'bg-paper-2 font-bold' : 'hover:bg-paper-2'}`}
                >
                  <span className="flex gap-1">{s.lines.map((l) => <LineBadge key={l} line={l as 'A'} size={22} />)}</span>
                  <span lang="cs">{s.name}</span>
                </button>
              </li>
            ))}
            {matches.length === 0 && <li className="px-4 py-3 text-ink-2"><span lang="cs">Tady nic není.</span> No station by that name.</li>}
          </ul>
          {home && (
            <div className="mt-5 flex items-center gap-4">
              <Stamp main="DOMOV" bottom={stations.find((s) => s.key === home)?.name.toUpperCase()} size={88} />
              <EnamelPlate tone="blue">{stations.find((s) => s.key === home)?.name}</EnamelPlate>
            </div>
          )}
        </section>
      )}

      <div className="mt-10 flex items-center justify-between gap-3 border-t-2 border-ink pt-5">
        {step > 0 ? (
          <button type="button" className="btn btn-quiet" onClick={() => setStep(step - 1)}>
            <IconArrowLeft size={16} /> Back
          </button>
        ) : (
          <span />
        )}
        {id === 'home' ? (
          <div className="flex gap-2">
            {!home && <button type="button" className="btn btn-secondary" onClick={finish}>Skip</button>}
            <button type="button" className="btn btn-primary" onClick={finish} disabled={!home}>
              <span lang="cs">Jedeme</span> · let's go <IconArrowRight size={16} />
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Next <IconArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function Choices<T extends string>({ options, value, onChange, name }: { options: { id: T; label: string; note: string }[]; value?: T; onChange: (v: T) => void; name: string }) {
  return (
    <div className="mt-6 space-y-3">
      {options.map((o) => (
        <label
          key={o.id}
          className={`flex cursor-pointer items-start gap-3 border-2 p-4 ${value === o.id ? 'border-ink bg-surface shadow-offset-sm' : 'border-rule-strong bg-paper hover:border-ink'}`}
        >
          <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="mt-1 h-5 w-5 accent-ink" />
          <span>
            <span className="block font-semibold">{o.label}</span>
            <span className="block text-sm text-ink-2">{o.note}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
