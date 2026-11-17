/**
 * Three hand-lettered drafts of the "Pražák" wordmark (docs/PLAN.md, D11).
 * Drawn as SVG strokes, not set in a font. Each has a distinctive háček on
 * the ž that also works on its own as the app icon (see the *Mark exports).
 * The letters use currentColor; the háček uses a line colour.
 * These are drafts for choosing a direction; a lettering designer may refine
 * the chosen one.
 */
type Props = { className?: string; title?: string };

const a11y = (title: string) => ({ role: 'img', 'aria-label': title });

/* ---------- A · Pantograf: monoline; the háček is a tram pantograph on its wire ---------- */
export function WordmarkPantograf({ className = 'h-12 w-auto', title = 'Pražák' }: Props) {
  return (
    <svg viewBox="0 0 240 92" className={className} {...a11y(title)}>
      <g fill="none" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 80.5V15.8c8.2-1.2 17.4-1.6 24.8.6 9.2 2.8 12.6 9.6 12.2 17.1-.5 8.9-7.2 15.4-17.3 16-6.4.4-13 .2-19.4-.4" />
        <path d="M62 80.8V45.4M62.3 58.1c3.4-8.6 9.6-13 19.3-12.6" />
        <path d="M118.4 56.7c-1.7-7.5-7.6-11.8-15.4-11.6-10.4.3-16.4 8.8-16.2 18.4.2 10.2 6.6 17.8 16.4 17.6 8.4-.1 14.2-6.4 15.4-14.6M118.6 45.6v35.1" />
        <path d="M133.3 46.1h27.4L133.9 80.2h28" />
        <g transform="translate(13 0)">
          <path d="M190.4 56.7c-1.7-7.5-7.6-11.8-15.4-11.6-10.4.3-16.4 8.8-16.2 18.4.2 10.2 6.6 17.8 16.4 17.6 8.4-.1 14.2-6.4 15.4-14.6M190.6 45.6v35.1" />
          <path d="M204.4 11.4v69.4M221 45.6 205.4 63.2M211.6 57.4l11.8 23.4" />
        </g>
      </g>
      {/* acute on á */}
      <path d="M186.8 34.6 197 20.4" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      {/* háček as pantograph: the contact bar on the wire, and the folding arm */}
      <g fill="none" stroke="var(--line-c)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M128 9.6h37.6" strokeWidth="3" />
        <path d="M137.2 15.2l9.6 15.4 9.8-15.4" strokeWidth="8" />
      </g>
    </svg>
  );
}
export function MarkPantograf({ className = 'h-16 w-16' }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...a11y('Pražák')}>
      <rect width="64" height="64" rx="12" fill="var(--paper)" />
      <path d="M10 15h44" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <path d="M17 24l15 22 15-22" fill="none" stroke="var(--line-c)" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- B · Kubismus: faceted, angular letters; the háček is a faceted chevron ---------- */
export function WordmarkKubismus({ className = 'h-12 w-auto', title = 'Pražák' }: Props) {
  return (
    <svg viewBox="0 0 280 94" className={className} {...a11y(title)}>
      <g fill="currentColor">
        {/* P */}
        <path d="M6 86V12h30l16 12v18L36 54H22v32Zm16-46h10l6-5V25l-6-5H22Z" />
        {/* r */}
        <path d="M60 86V44h15v8l8-8h14v14h-9l-13 9v19Z" />
        {/* a */}
        <path d="M102 86 94 74V56l10-12h30v42h-15v-5l-6 5Zm16-14h4V58h-10l-3 4v7Z" />
        {/* ž */}
        <path d="M142 44h40v12l-22 16h22v14h-42V74l22-16h-20Z" />
        {/* á */}
        <path d="M198 86 190 74V56l10-12h30v42h-15v-5l-6 5Zm16-14h4V58h-10l-3 4v7Z" />
        <path d="M206 38l12-20 12 4-14 18Z" />
        {/* k */}
        <path d="M238 86V10h15v40l13-6h12l-17 18 18 24h-17l-11-15-0 15Z" />
      </g>
      {/* háček: two faceted planes in line red */}
      <path d="M142 14 l10-4 l11 12 l11-12 l10 4 l-21 23 Z" fill="var(--line-c)" />
      <path d="M163 22 l11-12 l10 4 l-21 23 Z" fill="var(--plate-red)" />
    </svg>
  );
}
export function MarkKubismus({ className = 'h-16 w-16' }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...a11y('Pražák')}>
      <path d="M0 0h52l12 12v52H0Z" fill="var(--paper)" />
      <path d="M10 22l9-4 13 14 13-14 9 4-22 24Z" fill="var(--line-c)" />
      <path d="M32 32l13-14 9 4-22 24Z" fill="var(--plate-red)" />
    </svg>
  );
}

/* ---------- C · Razítko: bold, slightly wobbly stamped letters; the háček is an ink tick ---------- */
export function WordmarkRazitko({ className = 'h-12 w-auto', title = 'Pražák' }: Props) {
  return (
    <svg viewBox="0 0 262 96" className={className} {...a11y(title)}>
      <g fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 83.2 14 18.6c8.6-1.6 19.8-2.3 27.4.3 8.4 2.9 11.5 10 10.8 17.4-.8 8.6-7.6 14.7-17.6 15.2-6.3.3-13.3-.4-19.5-1.1" />
        <path d="M69.5 83.6 70 48.4M70.6 62c3.3-9.2 9.4-13.5 19.8-12.8" />
        <path d="M128.2 61.4c.4-9.6-6.2-15.6-15-15.4-10.6.2-17.2 8.8-16.8 18.9.4 10.6 7.1 17.6 16.3 17.4 8.5-.2 14.9-6.6 15.6-15.2M128.6 48.2l-.4 35.3" />
        <path d="M144.6 49.6l28.6-.6-28.2 33.4 29.4-.4" />
        <path d="M226.4 61.4c.4-9.6-6.2-15.6-15-15.4-10.6.2-17.2 8.8-16.8 18.9.4 10.6 7.1 17.6 16.3 17.4 8.5-.2 14.9-6.6 15.6-15.2M226.8 48.2l-.4 35.3" />
        <path d="M242.7 14.6l.4 69M257.3 49.2l-14.6 16.6M249.4 60.8l9 22.4" />
      </g>
      <path d="M210 36.4 220.2 23" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
      {/* háček as a validator tick: short left arm, long right arm, ink-blue */}
      <path d="M147.6 21.6l9.6 12.4L174.4 8.2" fill="none" stroke="var(--vltava)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function MarkRazitko({ className = 'h-16 w-16' }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...a11y('Pražák')}>
      <rect x="2" y="2" width="60" height="60" rx="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" strokeDasharray="5 3.4" />
      <path d="M14 30l11 13 25-26" fill="none" stroke="var(--vltava)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const WORDMARK_OPTIONS = [
  { id: 'pantograf', name: 'A · Pantograf', note: 'Monoline. The háček is a tram pantograph pressing up against its overhead wire: Prague trams in one mark.', Wordmark: WordmarkPantograf, Mark: MarkPantograf },
  { id: 'kubismus', name: 'B · Kubismus', note: 'Angular, faceted letters after Czech Cubist architecture. The háček is a two-plane faceted chevron in line red.', Wordmark: WordmarkKubismus, Mark: MarkKubismus },
  { id: 'razitko', name: 'C · Razítko', note: 'Bold, slightly wobbly stamped letters. The háček is a validator tick in Vltava blue: short left arm, long right.', Wordmark: WordmarkRazitko, Mark: MarkRazitko },
] as const;
