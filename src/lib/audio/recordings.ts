import { course } from '@/content';

/** URL of a real-speaker recording listed in content/audio/manifest.json, or undefined. */
export function recordingUrl(id: string | undefined): string | undefined {
  const r = id ? course.audio.get(id) : undefined;
  return r ? `${import.meta.env.BASE_URL}audio/${r.file}` : undefined;
}
