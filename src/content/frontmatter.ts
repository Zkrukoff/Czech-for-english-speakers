/**
 * Minimal YAML-style frontmatter parser for grammar pages. Supports exactly
 * what our content needs: `key: value` lines with strings, numbers, booleans
 * and inline lists `[a, b]`. Kept deliberately tiny to avoid a YAML dependency.
 */
export interface ParsedMarkdown {
  data: Record<string, unknown>;
  body: string;
}

function parseScalar(raw: string): unknown {
  const v = raw.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(',').map((s) => parseScalar(s)) : [];
  }
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

export function parseFrontmatter(source: string): ParsedMarkdown {
  const text = source.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 4);
  if (end === -1) return { data: {}, body: text };
  const header = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\n/, '');
  const data: Record<string, unknown> = {};
  for (const line of header.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = parseScalar(line.slice(idx + 1));
  }
  return { data, body };
}
