import { loadExam } from './content';
import { PICTURE_IDS } from './pictograms';

/**
 * The exam's content, bundled only with the exam pages (it's excluded from
 * the main course glob in src/content/files.ts).
 */
const files = import.meta.glob('/content/exam/*.json', { eager: true, import: 'default' });

export const exam = loadExam(
  Object.fromEntries(Object.entries(files).map(([p, v]) => [p.replace(/^\/content\//, ''), v])),
  PICTURE_IDS,
);
