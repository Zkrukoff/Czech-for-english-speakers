import { contentFiles } from './files';
import { loadContent } from './loader';

export * from './loader';
export * from './schema';
export * from './taxonomy';

const result = loadContent(contentFiles);

if (result.warnings.length && import.meta.env.DEV) {
  console.warn(`[content] ${result.warnings.length} warning(s):\n` + result.warnings.join('\n'));
}

/** The fully loaded, validated course. */
export const course = result.course;
/** Validation errors. If non-empty the app shows them instead of the course. */
export const contentErrors = result.errors;
export const contentWarnings = result.warnings;
