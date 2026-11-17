import { useEffect, useState, type ReactNode } from 'react';
import { WORDMARK_OPTIONS } from '@/components/brand/Wordmarks';
import { StyleguidePatterns } from './StyleguidePatterns';
import { ALL_ICONS, IconHacek, IconArrowRight } from '@/components/icons';
import { Button, Card, DepartureBoard, EnamelPlate, LineBadge, SectionNumber, Stamp, Ticket, TileGrid } from '@/components/ui';

/**
 * /styleguide: every token, type style, component, pattern and icon in one
 * place. Built first in phase 2 and kept current (docs/DESIGN.md).
 */

const PANGRAM = 'Příliš žluťoučký kůň úpěl ďábelské ódy';
const CZ_LETTERS = 'Ř ř Ů ů Ě ě Ď ď Ť ť Ň ň';

function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}

/** Re-read tokens when the theme changes. */
function useThemeVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const mo = new MutationObserver(() => setV((x) => x + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setV((x) => x + 1);
    mq.addEventListener('change', on);
    return () => {
      mo.disconnect();
      mq.removeEventListener('change', on);
    };
  }, []);
  return v;
}

function Swatch({ name, note, text = 'var(--ink)' }: { name: string; note?: string; text?: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex h-20 items-end rounded-md border-2 border-ink p-2" style={{ background: `var(${name})`, color: text }}>
        <span className="font-display text-3xl font-extrabold leading-none">Aa</span>
      </div>
      <code className="mt-1 font-mono text-xs text-ink">{name}</code>
      <span className="font-mono text-xs text-ink-3">{readToken(name)}</span>
      {note && <span className="text-xs text-ink-2">{note}</span>}
    </div>
  );
}

const PAIRS: [string, string, 'text' | 'large'][] = [
  ['--ink', '--paper', 'text'], ['--ink', '--paper-2', 'text'], ['--ink', '--surface', 'text'],
  ['--ink-2', '--paper', 'text'], ['--ink-3', '--paper', 'text'], ['--ink-3', '--paper-2', 'text'],
  ['--vltava', '--paper', 'text'], ['--line-a-deep', '--paper', 'text'], ['--line-c-deep', '--paper', 'text'],
  ['--line-a', '--paper', 'large'], ['--line-c', '--paper', 'large'],
  ['--on-fill-dark', '--line-b', 'text'], ['--on-fill-dark', '--champagne', 'text'], ['--on-fill-light', '--plate-red', 'text'], ['--on-fill-light', '--plate-blue', 'text'],
  ['--on-fill-light', '--line-a', 'large'], ['--on-fill-light', '--line-c', 'large'], ['--line-b', '--board', 'text'],
  ['--case-1', '--paper', 'text'], ['--case-2', '--paper', 'text'], ['--case-3', '--paper', 'text'], ['--case-4', '--paper', 'text'],
  ['--case-5', '--paper', 'text'], ['--case-6', '--paper', 'text'], ['--case-7', '--paper', 'text'],
];

const CASES = [
  ['1.', 'nominativ'], ['2.', 'genitiv'], ['3.', 'dativ'], ['4.', 'akuzativ'], ['5.', 'vokativ'], ['6.', 'lokál'], ['7.', 'instrumentál'],
] as const;

// Colour-vision-deficiency simulation (Machado et al. 2009, severity 1.0), applied as SVG filters.
const CVD: Record<string, string> = {
  protanopia: '0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0',
  deuteranopia: '0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0',
  tritanopia: '1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0',
};

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mb-16">
      <SectionNumber n={n}>{title}</SectionNumber>
      {children}
    </section>
  );
}

export function StyleguidePage() {
  useThemeVersion();
  const [replay, setReplay] = useState(0);
  return (
    <div>
      <svg width="0" height="0" className="absolute" aria-hidden>
        {Object.entries(CVD).map(([k, m]) => (
          <filter key={k} id={`cvd-${k}`} colorInterpolationFilters="linearRGB">
            <feColorMatrix type="matrix" values={m} />
          </filter>
        ))}
      </svg>

      <header className="mb-14 border-b-2 border-ink pb-8">
        <p className="eyebrow">/styleguide · design system</p>
        <h1 className="mt-2 text-5xl font-extrabold text-ink sm:text-6xl">Pražák, piece by piece</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-2">
          Tokens, type, components and patterns. Raw values live only in <code className="font-mono text-base">src/styles/tokens.css</code>; switch the theme in Settings to check the night tram.
        </p>
      </header>

      <Section n={1} title="Wordmark: B (Kubismus) chosen">
        <p className="mb-6 max-w-2xl text-ink-2">Hand-lettered as SVG, not typeset. B (Kubismus) is the wordmark and app icon (decision D11); A and C are kept here as the drafts it was chosen from.</p>
        <div className="grid gap-6 lg:grid-cols-3">
          {WORDMARK_OPTIONS.map(({ id, name, note, Wordmark, Mark }) => (
            <Card key={id} corner="tr" className="h-full">
              <div className="flex h-full flex-col gap-4 p-5">
                <p className="label-board text-ink-3">{name}{id === 'kubismus' && ' · v aplikaci'}</p>
                <div className="text-ink"><Wordmark className="h-14 w-auto" /></div>
                <div className="board flex items-center rounded-md p-4"><Wordmark className="h-10 w-auto" /></div>
                <div className="flex items-end gap-4">
                  <Mark className="h-16 w-16" />
                  <Mark className="h-8 w-8" />
                  <Mark className="h-4 w-4" />
                </div>
                <p className="text-sm text-ink-2">{note}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section n={2} title="Colour">
        <h3 className="mb-3 text-xl font-bold">Base</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {['--paper', '--paper-2', '--paper-3', '--surface', '--ink', '--ink-2', '--ink-3', '--rule', '--rule-strong'].map((t) => (
            <Swatch key={t} name={t} text={t.startsWith('--ink') ? 'var(--paper)' : 'var(--ink)'} />
          ))}
        </div>
        <h3 className="mb-3 mt-8 text-xl font-bold">Metro lines = levels</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Swatch name="--line-a" note="Linka A · A1–A2. Fills, large type" text="var(--on-fill-light)" />
          <Swatch name="--line-a-deep" note="small green text" text="var(--on-fill-light)" />
          <Swatch name="--line-b" note="Linka B · B1–B2. Fill only, ink text" text="var(--on-fill-dark)" />
          <Swatch name="--line-c" note="Linka C · C1–C2. Fills, large type" text="var(--on-fill-light)" />
          <Swatch name="--line-c-deep" note="small red text" text="var(--on-fill-light)" />
        </div>
        <h3 className="mb-3 mt-8 text-xl font-bold">Accents and fixed</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          <Swatch name="--vltava" note="links, info, corrections" text="var(--paper)" />
          <Swatch name="--vltava-tint" />
          <Swatch name="--champagne" note="stamps, rewards. Fill only" text="var(--on-fill-dark)" />
          <Swatch name="--champagne-tint" />
          <Swatch name="--board" note="always dark" text="var(--line-b)" />
          <Swatch name="--plate-red" note="enamel plate" text="var(--on-fill-light)" />
          <Swatch name="--plate-blue" note="enamel plate" text="var(--on-fill-light)" />
        </div>

        <h3 className="mb-1 mt-8 text-xl font-bold">Case colours (case lens)</h3>
        <p className="mb-3 max-w-2xl text-sm text-ink-2">Always shown with the case number and name. Rows below simulate the three common colour-vision deficiencies.</p>
        {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((mode) => (
          <div key={mode} className="mb-2 flex flex-wrap items-center gap-2">
            <span className="w-28 font-mono text-xs uppercase text-ink-3">{mode === 'none' ? 'normal' : mode}</span>
            <div className="flex flex-wrap gap-2" style={mode === 'none' ? undefined : { filter: `url(#cvd-${mode})` }}>
              {CASES.map(([n, name], i) => (
                <span key={n} className="inline-flex items-center gap-1.5 rounded-sm border-2 px-2 py-1 font-mono text-xs font-semibold" style={{ color: `var(--case-${i + 1})`, borderColor: `var(--case-${i + 1})` }}>
                  {n} {name}
                </span>
              ))}
            </div>
          </div>
        ))}

        <h3 className="mb-1 mt-8 text-xl font-bold">Station tiles</h3>
        <p className="mb-3 text-sm text-ink-2">One flat tone per station, always with ink text (all ≥ 10:1). Approve or hand-pick.</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-12">
          {Array.from({ length: 24 }, (_, i) => {
            const t = `--tile-${String(i + 1).padStart(2, '0')}`;
            return (
              <div key={t} className="flex aspect-square flex-col justify-end rounded-sm border-2 border-ink p-1.5" style={{ background: `var(${t})`, color: 'var(--on-fill-dark)' }}>
                <span className="font-mono text-[10px]">{t.slice(2)}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section n={3} title="Contrast (this theme)">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th className="py-2 pr-4">Text</th><th className="py-2 pr-4">On</th><th className="py-2 pr-4">Sample</th><th className="py-2 pr-4">Ratio</th><th className="py-2">Use</th>
              </tr>
            </thead>
            <tbody>
              {PAIRS.map(([fg, bg, use]) => {
                const r = contrast(readToken(fg), readToken(bg));
                const ok = use === 'large' ? r >= 3 : r >= 4.5;
                return (
                  <tr key={fg + bg} className="border-b border-rule">
                    <td className="py-1.5 pr-4">{fg}</td>
                    <td className="py-1.5 pr-4">{bg}</td>
                    <td className="py-1.5 pr-4"><span className={`rounded-sm px-2 py-0.5 ${use === 'large' ? 'font-display text-2xl font-extrabold' : 'font-ui text-sm'}`} style={{ color: `var(${fg})`, background: `var(${bg})` }}>Žluťoučký</span></td>
                    <td className="py-1.5 pr-4">{r.toFixed(2)}:1</td>
                    <td className="py-1.5">{use === 'large' ? 'large text only' : 'any text'} {ok ? '· pass' : '· FAIL'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n={4} title="Type">
        {[
          { label: 'Display · Bricolage Grotesque', family: 'var(--font-display)', weights: [400, 600, 800], extra: { fontVariationSettings: '"opsz" 96, "wdth" 88' } },
          { label: 'UI and body · Mluvka', family: 'var(--font-ui)', weights: [400, 500, 600, 700] },
          { label: 'Labels and tables · Azeret Mono', family: 'var(--font-mono)', weights: [400, 500, 600] },
          { label: 'Long reading · Yrsa', family: 'var(--font-read)', weights: [400, 600] },
        ].map((f) => (
          <div key={f.label} className="mb-8 border-b border-rule pb-6">
            <p className="label-board mb-3 text-ink-3">{f.label}</p>
            {f.weights.map((w) => (
              <p key={w} lang="cs" className="text-2xl leading-snug text-ink" style={{ fontFamily: f.family, fontWeight: w, ...(f.extra ?? {}) }}>
                <span className="mr-3 font-mono text-xs text-ink-3" style={{ fontFamily: 'var(--font-mono)', fontWeight: 400 }}>{w}</span>
                {PANGRAM} · {CZ_LETTERS}
              </p>
            ))}
            {f.family === 'var(--font-read)' && (
              <p lang="cs" className="text-2xl italic text-ink" style={{ fontFamily: f.family }}>
                <span className="mr-3 font-mono text-xs not-italic text-ink-3">400 italic</span>
                {PANGRAM}
              </p>
            )}
          </div>
        ))}

        <h3 className="mb-3 text-xl font-bold">Decision D5: Mluvka or the fallback?</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ['Mluvka (UI candidate)', 'var(--font-ui)', {}],
            ['Bricolage Grotesque at text size (fallback)', 'var(--font-ui-alt)', { fontVariationSettings: '"opsz" 14, "wdth" 100' }],
          ].map(([name, fam, extra]) => (
            <Card key={name as string} corner="none">
              <div className="p-5" style={{ fontFamily: fam as string, ...(extra as object) }}>
                <p className="label-board mb-2 text-ink-3" style={{ fontFamily: 'var(--font-mono)' }}>{name as string}</p>
                <p className="text-base leading-relaxed text-ink">
                  After <span lang="cs" className="font-semibold">do</span>, Czech uses the genitive: <span lang="cs">do Prahy</span>, not <span lang="cs">do Praha</span>. Most feminine nouns in -a change it to -y.
                </p>
                <p lang="cs" className="mt-2 text-sm text-ink-2">Dobrý den, jednu jízdenku do Brna, prosím. Ještě jedno?</p>
                <p className="mt-2 text-xs text-ink-3">0123456789 · {CZ_LETTERS}</p>
              </div>
            </Card>
          ))}
        </div>

        <h3 className="mb-3 mt-8 text-xl font-bold">Scale (1.25)</h3>
        <div className="space-y-1">
          {[['7xl', 'step-8'], ['6xl', 'step-7'], ['5xl', 'step-6'], ['4xl', 'step-5'], ['3xl', 'step-4'], ['2xl', 'step-3'], ['xl', 'step-2'], ['lg', 'step-1'], ['base', 'step-0'], ['sm', 'step-sm'], ['xs', 'step--1']].map(([tw, step]) => (
            <div key={tw} className="flex items-baseline gap-4 overflow-hidden whitespace-nowrap">
              <span className="w-28 shrink-0 font-mono text-xs text-ink-3">text-{tw}</span>
              <span className="block max-w-full overflow-hidden font-display font-bold leading-none text-ink" style={{ fontSize: `var(--${step})` }}>Jedeme.</span>
            </div>
          ))}
        </div>
      </Section>

      <Section n={5} title="Components">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Jedeme <IconArrowRight size={18} /></Button>
          <Button variant="secondary">Ještě jedno?</Button>
          <Button variant="quiet">Later</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(['tr', 'bl', 'tl', 'none'] as const).map((c, i) => (
            <Card key={c} corner={c} tone={i === 1 ? 'var(--tile-11)' : i === 2 ? 'var(--paper-2)' : undefined}>
              <div className="p-5" style={{ color: i === 1 ? 'var(--on-fill-dark)' : undefined }}>
                <p className="label-board opacity-70">Card · {c === 'none' ? 'square' : `${c} corner`}</p>
                <p className="mt-2 font-display text-xl font-bold">Anděl</p>
                <p className="text-sm">Above ground: offices, shopping and many trams.</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <EnamelPlate tone="blue">Vinohradská 12</EnamelPlate>
          <EnamelPlate tone="red">č. p. 1024</EnamelPlate>
          <EnamelPlate tone="paper">4. pád</EnamelPlate>
          <EnamelPlate tone="blue" size="sm">m. živ.</EnamelPlate>
          <span className="chip">chip</span>
          <LineBadge line="A" size={48} />
          <LineBadge line="B" size={48} />
          <LineBadge line="C" size={48} />
          <LineBadge line="A" size={24} />
          <LineBadge line="B" size={24} />
          <LineBadge line="C" size={24} />
        </div>
        <div className="mt-8 flex flex-wrap items-start gap-8">
          <Ticket line={<LineBadge line="A" size={20} />} title="Nemocnice Motol" from="Linka A · stanice 1" date="17. 11. 2026 08:42" stamp={<Stamp key={replay} main="HOTOVO" bottom="17·11·26" size={92} />} />
          <div className="flex items-center gap-6">
            <Stamp key={`a${replay}`} main="HOTOVO" bottom="LINKA A" />
            <Stamp key={`b${replay}`} main="MISE" bottom="17·11·26" colour="var(--vltava)" size={96} />
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <DepartureBoard key={`d${replay}`} text="Příští stanice: Můstek" className="text-lg" />
          <Button onClick={() => setReplay((r) => r + 1)}>Replay motion</Button>
        </div>
        <div className="mt-8 max-w-md">
          <label className="label-board text-ink-3" htmlFor="sg-input">Answer field</label>
          <input id="sg-input" lang="cs" defaultValue="Dám si kávu" className="mt-1 w-full rounded-md border-2 border-ink bg-surface px-4 py-3 text-lg text-ink" style={{ boxShadow: 'inset 2px 2px 0 var(--paper-3)' }} />
        </div>
      </Section>

      <Section n={6} title="Icons">
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-7">
          {Object.entries(ALL_ICONS).map(([name, I]) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-md border border-rule p-3 text-ink">
              <I size={28} />
              <span className="font-mono text-[10px] text-ink-3">{name.replace('Icon', '')}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section n={7} title="Patterns and texture">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <TileGrid tone="var(--tile-05)" cols={6} rows={3} className="w-full border-2 border-ink" />
            <p className="mt-2 text-sm text-ink-2">Tile grid: alternating convex and concave circles, one flat tone per station (after the Line A wall panels).</p>
          </div>
          <div>
            <TileGrid tone="var(--tile-16)" cols={6} rows={3} className="w-full border-2 border-ink" />
            <p className="mt-2 text-sm text-ink-2">The same pattern in another station's tone.</p>
          </div>
          <div>
            <div className="halftone flex h-[104px] items-end rounded-sm border-2 border-ink p-3" style={{ background: 'var(--line-b)', color: 'var(--ink)' }}>
              <span className="font-display text-2xl font-extrabold" style={{ color: 'var(--on-fill-dark)' }}>Linka B</span>
            </div>
            <p className="mt-2 text-sm text-ink-2">Risograph halftone on a large colour field; text stays solid.</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-10 text-ink">
          <span className="misreg-red inline-block text-ink"><IconTram size={56} /></span>
          <span className="misreg-yellow inline-block text-ink"><IconTicket size={56} /></span>
          <span className="misreg-blue inline-block text-ink"><IconHacek size={56} /></span>
          <p className="max-w-xs text-sm text-ink-2">Misregistration (a second ink slightly off) on decorative drawings only, never on text.</p>
        </div>
        <div className="prose-cz mt-8">
          <ul>
            <li>The háček as a bullet point.</li>
            <li>It also marks "aha" tips and the loading state.</li>
          </ul>
        </div>
      </Section>

      <Section n={8} title="Screen patterns">
        <StyleguidePatterns />
      </Section>
    </div>
  );
}

const { IconTram, IconTicket } = ALL_ICONS;
