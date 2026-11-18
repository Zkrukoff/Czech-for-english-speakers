import { useEffect, useState } from 'react';
import { czechVoices } from './speech';

/** Whether this device has a Czech (cs-CZ) text-to-speech voice. Voices load asynchronously. */
export function useHasCzechVoice(): boolean {
  const [has, setHas] = useState(() => czechVoices().length > 0);
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return;
    const update = () => setHas(czechVoices().length > 0);
    speechSynthesis.addEventListener('voiceschanged', update);
    update();
    return () => speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);
  return has;
}
