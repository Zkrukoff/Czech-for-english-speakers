import type { ContentFiles } from './loader';

/**
 * Collects every file under /content at build time. Vite bundles these, and
 * in dev a change to any content file hot-reloads the app.
 */
// The exam's content loads only with the exam pages (src/features/exam/examContent.ts).
const jsonModules = import.meta.glob(['/content/**/*.json', '!/content/exam/**'], { eager: true, import: 'default' });
const mdModules = import.meta.glob('/content/**/*.md', { eager: true, query: '?raw', import: 'default' });

const strip = (p: string) => p.replace(/^\/content\//, '');

/** Repo-level docs in /content that are not course content. */
const IGNORED_MD = new Set(['SCHEMA.md', 'REVIEW_NEEDED.md']);

export const contentFiles: ContentFiles = {
  json: Object.fromEntries(Object.entries(jsonModules).map(([p, v]) => [strip(p), v])),
  markdown: Object.fromEntries(
    Object.entries(mdModules)
      .map(([p, v]) => [strip(p), v as string] as const)
      .filter(([p]) => !IGNORED_MD.has(p)),
  ),
};
