/**
 * Recording ids for everything spoken, derived from content ids so nothing is
 * edited by hand. scripts/lib/audio-ids.mjs mirrors these for the recording
 * scripts; tests/audio-kit.test.ts checks the two agree.
 */
export const dialogueLineId = (lessonId: string, index: number) => `dlg-${lessonId}-${index + 1}`;
export const vocabAudioId = (vocabId: string) => `voc-${vocabId}`;
export const chunkAudioId = (phraseId: string) => `chunk-${phraseId}`;
/** One recording per line of an exam text: exam-<task>-<item>-<line>. */
export const examAudioBase = (taskId: string, item: string | number) => `exam-${taskId}-${item}`;
export const examLineId = (base: string, index: number) => `${base}-${index + 1}`;
