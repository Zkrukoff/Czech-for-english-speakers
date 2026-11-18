// Mirrors src/lib/audio/ids.ts for the recording scripts. tests/audio-kit.test.ts checks they agree.
export const dialogueLineId = (lessonId, index) => `dlg-${lessonId}-${index + 1}`;
export const vocabAudioId = (vocabId) => `voc-${vocabId}`;
export const chunkAudioId = (phraseId) => `chunk-${phraseId}`;
export const examAudioBase = (taskId, item) => `exam-${taskId}-${item}`;
export const examLineId = (base, index) => `${base}-${index + 1}`;
