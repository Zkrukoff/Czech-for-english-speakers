import { recordingUrl } from './recordings';

/**
 * Audio abstraction. Components only call `speech.speak(text, { audioId })`.
 * Today the browser's text-to-speech (cs-CZ) is used; once recorded files
 * exist in /public/audio/<audioId>.mp3, RecordedAudioProvider plays those
 * and falls back to TTS for anything not recorded.
 */
export interface SpeakOptions {
  /** Id of a recorded file (without extension), if the content item has one. */
  audioId?: string;
  rate?: number;
  voiceURI?: string;
  /** 0–2; used to tell two speakers apart when the device has one Czech voice. */
  pitch?: number;
}

export interface SpeechProvider {
  /** Whether this provider can produce Czech audio in this browser. */
  isAvailable(): boolean;
  speak(text: string, options?: SpeakOptions): Promise<void>;
  stop(): void;
}

export function czechVoices(): SpeechSynthesisVoice[] {
  if (typeof speechSynthesis === 'undefined') return [];
  return speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('cs'));
}

export class WebSpeechProvider implements SpeechProvider {
  isAvailable(): boolean {
    return typeof speechSynthesis !== 'undefined' && czechVoices().length > 0;
  }

  speak(text: string, options: SpeakOptions = {}): Promise<void> {
    if (typeof speechSynthesis === 'undefined') return Promise.resolve();
    speechSynthesis.cancel();
    return new Promise((resolve) => {
      // A speech engine that throws mustn't leave a caller waiting forever.
      try {
        this.utter(text, options, resolve);
      } catch {
        resolve();
      }
    });
  }

  private utter(text: string, options: SpeakOptions, resolve: () => void): void {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'cs-CZ';
    u.rate = options.rate ?? 0.9;
    if (options.pitch !== undefined) u.pitch = options.pitch;
    const voices = czechVoices();
    const voice = voices.find((v) => v.voiceURI === options.voiceURI) ?? voices[0];
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  }

  stop(): void {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  }
}

export class RecordedAudioProvider implements SpeechProvider {
  private current: HTMLAudioElement | null = null;
  /** `lookup` gives the URL of a listed recording, or undefined: nothing unlisted is requested. */
  constructor(
    private fallback: SpeechProvider,
    private lookup: (id: string) => string | undefined,
  ) {}

  isAvailable(): boolean {
    return true;
  }

  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    this.stop();
    const url = options.audioId ? this.lookup(options.audioId) : undefined;
    if (url) {
      try {
        const audio = new Audio(url);
        audio.playbackRate = options.rate ?? 1;
        this.current = audio;
        // Resolve when the clip has finished (or is stopped), so dialogues play line by line.
        const ended = new Promise<void>((resolve) => {
          audio.onended = audio.onerror = audio.onpause = () => resolve();
        });
        await audio.play();
        await ended;
        return;
      } catch {
        // No recording (or playback blocked): fall back to TTS.
      }
    }
    return this.fallback.speak(text, options);
  }

  stop(): void {
    this.current?.pause();
    this.current = null;
    this.fallback.stop();
  }
}

/** The app-wide provider. Swap here when recorded audio is added. */
export const speech: SpeechProvider = new RecordedAudioProvider(new WebSpeechProvider(), recordingUrl);
