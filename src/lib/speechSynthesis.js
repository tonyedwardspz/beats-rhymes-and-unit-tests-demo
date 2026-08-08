// Helpers around the browser Web Speech Synthesis API for the Joke page TTS studio.

export const isSpeechSynthesisSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Return the list of available voices. Browsers often populate this
 * asynchronously; pass an `onChange` callback (or listen yourself) via
 * `subscribeVoices` to pick up late-loading voices.
 */
export const getVoices = () => {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }
  return window.speechSynthesis.getVoices();
};

/**
 * Subscribe to voice list updates. Returns an unsubscribe function.
 */
export const subscribeVoices = (onChange) => {
  if (!isSpeechSynthesisSupported()) {
    return () => {};
  }

  const handler = () => {
    onChange(window.speechSynthesis.getVoices());
  };

  // Immediate snapshot in case voices are already loaded.
  handler();

  window.speechSynthesis.addEventListener('voiceschanged', handler);
  return () => {
    window.speechSynthesis.removeEventListener('voiceschanged', handler);
  };
};

/**
 * Speak text with the given utterance options.
 *
 * @param {Object} options
 * @param {string} options.text
 * @param {SpeechSynthesisVoice} [options.voice]
 * @param {number} [options.rate=1]
 * @param {number} [options.pitch=1]
 * @param {number} [options.volume=1]
 */
export const speak = ({ text, voice, rate = 1, pitch = 1, volume = 1 }) => {
  if (!isSpeechSynthesisSupported() || !text) {
    return;
  }

  // Cancel anything currently speaking so a new Speak click starts cleanly.
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  if (voice) {
    utter.voice = voice;
    if (voice.lang) {
      utter.lang = voice.lang;
    }
  }
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = volume;
  window.speechSynthesis.speak(utter);
};

/** Stop any in-progress speech. */
export const cancelSpeech = () => {
  if (!isSpeechSynthesisSupported()) {
    return;
  }
  window.speechSynthesis.cancel();
};
