import type { WallBlock } from '@/lib/wall';
import { wallCounts } from '@/lib/wall';
import { canvasToPng, loadSvg, standaloneSvg, tokenColour, tokenFont } from '@/lib/exportImage';

const W = 1080;
const H = 1350;
const M = 72;

/**
 * The shareable wall: a 4:5 PNG on ticket paper (fixed colours, the same in
 * both themes), with the wordmark, the line, the count and the date.
 */
export async function renderWallPng(blocks: WallBlock[], svgs: SVGSVGElement[], now = new Date()): Promise<Blob> {
  const display = tokenFont('--font-display');
  const mono = tokenFont('--font-mono');
  await Promise.all([document.fonts.load(`800 120px ${display}`), document.fonts.load(`600 28px ${mono}`)]);
  const paper = tokenColour('--ticket');
  const ink = tokenColour('--on-fill-dark');
  const red = tokenColour('--stamp-red');

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.fillStyle = ink;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `800 120px ${display}`;
  ctx.fillText('Pražák', M, M + 110);
  ctx.font = `600 30px ${mono}`;
  ctx.fillText('LINKA A · MOJE STĚNA', M, M + 165);

  // The wall: as few columns as fit above the footer, station names underneath.
  const gap = 28;
  const label = 70;
  const top = M + 215;
  const room = H - M - 125 - top;
  let cols = 4;
  let size = 0;
  for (; cols <= 8; cols++) {
    size = (W - M * 2 - gap * (cols - 1)) / cols;
    if (Math.ceil(blocks.length / cols) * (size + label) <= room) break;
  }
  const y0 = top + Math.max(0, (room - Math.ceil(blocks.length / cols) * (size + label)) / 2);
  const images = await Promise.all(svgs.map((s) => loadSvg(standaloneSvg(s))));
  images.forEach((img, i) => {
    const x = M + (i % cols) * (size + gap);
    const y = y0 + Math.floor(i / cols) * (size + label);
    ctx.drawImage(img, x, y, size, size);
    ctx.fillStyle = ink;
    ctx.font = `600 ${cols > 4 ? 17 : 20}px ${mono}`;
    wrap(ctx, blocks[i]!.name.toUpperCase(), x, y + size + 28, size, 22);
  });

  const { filled, total, stations } = wallCounts(blocks);
  ctx.fillStyle = ink;
  ctx.font = `800 64px ${display}`;
  ctx.fillText(`${filled} / ${total}`, M, H - M - 70);
  ctx.font = `600 26px ${mono}`;
  ctx.fillText(`${stationsCs(stations).toUpperCase()} · ${now.toLocaleDateString('cs-CZ')}`, M, H - M - 20);
  ctx.fillStyle = red;
  ctx.fillRect(W - M - 120, H - M - 28, 120, 8);

  return canvasToPng(canvas);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = '';
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > max && line) {
      ctx.fillText(line, x, y);
      y += lh;
      line = w;
    } else line = t;
  }
  ctx.fillText(line, x, y);
}

/** 0 → "zatím žádná stanice", 1 → "1 stanice", 2–4 → "3 stanice", 5+ → "5 stanic". */
export function stationsCs(n: number): string {
  if (n === 0) return 'zatím žádná stanice';
  return n <= 4 ? `${n} stanice` : `${n} stanic`;
}
