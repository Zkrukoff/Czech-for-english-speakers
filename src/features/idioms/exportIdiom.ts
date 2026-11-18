import type { Idiom } from '@/content/schema';
import { canvasToPng, tokenColour, tokenFont } from '@/lib/exportImage';

const S = 1080;

/** A square PNG of the plate: Czech, literal, meaning, and the wordmark. */
export async function renderIdiomPng(idiom: Idiom, week: number): Promise<Blob> {
  const display = tokenFont('--font-display');
  const mono = tokenFont('--font-mono');
  const ui = tokenFont('--font-ui');
  await Promise.all([document.fonts.load(`800 96px ${display}`), document.fonts.load(`600 28px ${mono}`), document.fonts.load(`italic 36px ${ui}`), document.fonts.load(`36px ${ui}`)]);
  const blue = tokenColour('--plate-blue');
  const fg = tokenColour('--on-fill-light');

  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = blue;
  roundRect(ctx, 0, 0, S, S, 48);
  ctx.fill();
  ctx.strokeStyle = fg;
  ctx.lineWidth = 8;
  roundRect(ctx, 28, 28, S - 56, S - 56, 30);
  ctx.stroke();

  const M = 96;
  ctx.fillStyle = fg;
  ctx.font = `600 30px ${mono}`;
  ctx.fillText(`IDIOM TÝDNE · TÝDEN ${week}`, M, M + 40);

  // Biggest display size that fits in four lines.
  let size = 112;
  let lines: string[] = [];
  for (; size >= 56; size -= 4) {
    ctx.font = `800 ${size}px ${display}`;
    lines = wrap(ctx, idiom.cs, S - M * 2);
    if (lines.length <= 4) break;
  }
  let y = M + 80 + size;
  for (const l of lines) {
    ctx.fillText(l, M, y);
    y += size * 1.05;
  }
  ctx.font = `italic 38px ${ui}`;
  for (const l of wrap(ctx, `“${idiom.literal}”`, S - M * 2)) {
    y += 14;
    ctx.fillText(l, M, y + 30);
    y += 44;
  }
  ctx.font = `36px ${ui}`;
  y += 50;
  for (const l of wrap(ctx, `= ${idiom.meaning}`, S - M * 2).slice(0, 4)) {
    ctx.fillText(l, M, y + 30);
    y += 48;
  }

  ctx.font = `800 52px ${display}`;
  ctx.fillText('Pražák', M, S - M);
  ctx.font = `600 22px ${mono}`;
  const src = `ZDROJ: ${idiom.source.dictionaries.join(', ')}`;
  ctx.fillText(src, S - M - ctx.measureText(src).width, S - M);
  return canvasToPng(c);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > max && line) {
      out.push(line);
      line = w;
    } else line = t;
  }
  if (line) out.push(line);
  return out;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
