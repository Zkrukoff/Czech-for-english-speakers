import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Navigation (B10)', () => {
  it('has Sounds and Grammar & verbs in a seven-item menu', () => {
    const shell = readFileSync('src/components/AppShell.tsx', 'utf8');
    const nav = shell.slice(shell.indexOf('const NAV'), shell.indexOf('];', shell.indexOf('const NAV')));
    expect([...nav.matchAll(/label: '([^']+)'/g)].map((m) => m[1])).toEqual(['Home', 'Review', 'Sounds', 'Grammar & verbs', 'Guides', 'Ticket wallet', 'Settings']);
  });

  it('keeps the old alphabet and overheard addresses working', () => {
    const paths = [...readFileSync('src/routes.tsx', 'utf8').matchAll(/path: '([^']+)'/g)].map((m) => m[1]);
    for (const p of ['sounds', 'sounds/overheard', 'sounds/overheard/:sceneId', 'alphabet', 'overheard', 'overheard/:sceneId', 'verbs']) expect(paths).toContain(p);
  });
});
