import { readFileSync } from 'node:fs';

/** Reads src/styles/tokens.css into { light, dark } maps of --name → hex. */
export function readTokens(): { light: Record<string, string>; dark: Record<string, string> } {
  const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const grab = (block: string) => Object.fromEntries([...block.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1]!, m[2]!.toUpperCase()]));
  const rootBlock = css.slice(css.indexOf(':root {'), css.indexOf('@media'));
  const darkBlock = css.slice(css.indexOf(":root[data-theme='dark']"));
  const light = grab(rootBlock);
  const dark = { ...light, ...grab(darkBlock) };
  return { light, dark };
}

export function contrast(a: string, b: string): number {
  const lum = (h: string) => {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}
