/**
 * Multi-lingual Speech Synthesis (TTS) Helper for Godavari Pushkaralu
 * Supports English (en-IN), Telugu (te-IN), and Hindi (hi-IN)
 */

export const playSpeechAlert = (text: string, lang: 'en' | 'te' | 'hi'): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any currently speaking audio

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clarity in crowd environments
    utterance.pitch = 1.0;

    const langCodes: Record<'en' | 'te' | 'hi', string> = {
      en: 'en-IN',
      te: 'te-IN',
      hi: 'hi-IN'
    };

    utterance.lang = langCodes[lang] || 'en-IN';

    // Attempt to select optimal regional voice if available in browser
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang) || v.lang.replace('_', '-').startsWith(langCodes[lang]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis error', err);
    return false;
  }
};

export const stopSpeechAlert = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeechSynthesizing = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};
