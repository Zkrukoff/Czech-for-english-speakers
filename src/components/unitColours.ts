/** Each unit gets a "line colour", like a metro line. Decorative only. */
const UNIT = [
  { bg: 'bg-metro-a', text: 'text-white', border: 'border-metro-a', stroke: 'var(--color-metro-a)' },
  { bg: 'bg-metro-b', text: 'text-ink', border: 'border-metro-b', stroke: 'var(--color-metro-b)' },
  { bg: 'bg-metro-c', text: 'text-white', border: 'border-metro-c', stroke: 'var(--color-metro-c)' },
  { bg: 'bg-vltava', text: 'text-white', border: 'border-vltava', stroke: 'var(--color-vltava)' },
] as const;

export function unitColour(unitNumber: number) {
  return UNIT[(unitNumber - 1) % UNIT.length]!;
}
