/** Each unit gets a "line colour", like a metro line. Decorative only. */
const UNIT = [
  { bg: 'bg-line-a', text: 'text-on-fill-light', border: 'border-line-a', stroke: 'var(--line-a)' },
  { bg: 'bg-line-b', text: 'text-ink', border: 'border-line-b', stroke: 'var(--line-b)' },
  { bg: 'bg-line-c', text: 'text-on-fill-light', border: 'border-line-c', stroke: 'var(--line-c)' },
  { bg: 'bg-vltava', text: 'text-on-fill-light', border: 'border-vltava', stroke: 'var(--vltava)' },
] as const;

export function unitColour(unitNumber: number) {
  return UNIT[(unitNumber - 1) % UNIT.length]!;
}
