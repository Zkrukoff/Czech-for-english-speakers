
/** Shared by the on-screen SVG and the PNG export, so both draw the same wall. */
export const CELL = 30;
export const PAD = 6;
export const BLOCK = PAD * 2 + CELL * 2;

/** Up to four circles in a 2×2 block; one circle sits in the middle. */
export function cellCentres(n: number): { x: number; y: number }[] {
  if (n === 1) return [{ x: BLOCK / 2, y: BLOCK / 2 }];
  return Array.from({ length: Math.min(n, 4) }, (_, i) => ({
    x: PAD + CELL * (i % 2) + CELL / 2,
    y: PAD + CELL * Math.floor(i / 2) + CELL / 2 + (n <= 2 ? CELL / 2 : 0),
  }));
}
