/**
 * Answer-pattern expansion.
 *
 *   [text]     optional text           "Dám si čaj[, prosím]."
 *   {a|b|c}    one of the alternatives "Dám si {čaj|kafe}."
 *
 * Groups may nest: "{Dám si|Chtěl[a] bych} kávu". Expansion is capped so a
 * badly written pattern cannot explode.
 */

export const MAX_EXPANSIONS = 512;

export class PatternError extends Error {}

type Node = { kind: 'text'; value: string } | { kind: 'alt'; options: Node[][] };

function parse(pattern: string): Node[] {
  let pos = 0;

  function parseSeq(terminators: string): Node[] {
    const nodes: Node[] = [];
    let text = '';
    const flush = () => {
      if (text) nodes.push({ kind: 'text', value: text });
      text = '';
    };
    while (pos < pattern.length) {
      const ch = pattern[pos]!;
      if (terminators.includes(ch)) break;
      if (ch === '[') {
        flush();
        pos++;
        const inner = parseSeq(']');
        if (pattern[pos] !== ']') throw new PatternError(`Unclosed [ in "${pattern}"`);
        pos++;
        nodes.push({ kind: 'alt', options: [inner, []] });
      } else if (ch === '{') {
        flush();
        pos++;
        const options: Node[][] = [parseSeq('|}')];
        while (pattern[pos] === '|') {
          pos++;
          options.push(parseSeq('|}'));
        }
        if (pattern[pos] !== '}') throw new PatternError(`Unclosed { in "${pattern}"`);
        pos++;
        nodes.push({ kind: 'alt', options });
      } else if (ch === ']' || ch === '}') {
        throw new PatternError(`Unexpected ${ch} in "${pattern}"`);
      } else {
        text += ch;
        pos++;
      }
    }
    flush();
    return nodes;
  }

  const nodes = parseSeq('');
  if (pos < pattern.length) throw new PatternError(`Unexpected ${pattern[pos]} in "${pattern}"`);
  return nodes;
}

function expandSeq(nodes: Node[]): string[] {
  let results = [''];
  for (const node of nodes) {
    if (node.kind === 'text') {
      results = results.map((r) => r + node.value);
    } else {
      const optionStrings = node.options.flatMap(expandSeq);
      const next: string[] = [];
      for (const r of results) {
        for (const o of optionStrings) {
          next.push(r + o);
          if (next.length > MAX_EXPANSIONS) {
            throw new PatternError(`Pattern expands to more than ${MAX_EXPANSIONS} answers`);
          }
        }
      }
      results = next;
    }
  }
  return results;
}

/** Tidy whitespace and spacing before punctuation left behind by optional groups. */
function tidy(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/,([.!?])/g, '$1')
    .trim();
}

/** Expand one pattern into every concrete answer it accepts (deduplicated). */
export function expandPattern(pattern: string): string[] {
  return [...new Set(expandSeq(parse(pattern)).map(tidy))].filter((s) => s.length > 0);
}

/** Expand a list of patterns. */
export function expandPatterns(patterns: string[]): string[] {
  return [...new Set(patterns.flatMap(expandPattern))];
}

/** Returns an error message if the pattern is malformed, otherwise null. */
export function validatePattern(pattern: string): string | null {
  try {
    expandPattern(pattern);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}
