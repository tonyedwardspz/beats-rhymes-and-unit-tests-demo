// Helpers around the browser Web Speech Synthesis API for the Punchline page TTS studio.

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
 * Build a SpeechSynthesisUtterance from speak options.
 *
 * @param {Object} options
 * @param {string} options.text
 * @param {SpeechSynthesisVoice} [options.voice]
 * @param {number} [options.rate=1]
 * @param {number} [options.pitch=1]
 * @param {number} [options.volume=1]
 * @returns {SpeechSynthesisUtterance | null}
 */
const createUtterance = ({ text, voice, rate = 1, pitch = 1, volume = 1 }) => {
  if (!isSpeechSynthesisSupported() || !text) {
    return null;
  }

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
  return utter;
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
export const speak = (options) => {
  const utter = createUtterance(options);
  if (!utter) {
    return;
  }

  // Cancel anything currently speaking so a new Speak click starts cleanly.
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
};

/**
 * Speak text and resolve when the utterance ends.
 * Rejects if synthesis errors or is cancelled before a natural end.
 *
 * @param {Object} options
 * @param {string} options.text
 * @param {SpeechSynthesisVoice} [options.voice]
 * @param {number} [options.rate=1]
 * @param {number} [options.pitch=1]
 * @param {number} [options.volume=1]
 * @returns {Promise<void>}
 */
export const speakAsync = (options) => {
  const utter = createUtterance(options);
  if (!utter) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    utter.onend = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    utter.onerror = (event) => {
      if (settled) {
        return;
      }
      settled = true;
      const reason = event?.error || 'synthesis-failed';
      const error = new Error(`Speech synthesis failed: ${reason}`);
      error.name =
        reason === 'canceled' || reason === 'interrupted'
          ? 'SpeechCancelledError'
          : 'SpeechSynthesisError';
      error.speechError = reason;
      reject(error);
    };

    // Cancel anything currently speaking so a new Speak click starts cleanly.
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
};

/** Stop any in-progress speech. */
export const cancelSpeech = () => {
  if (!isSpeechSynthesisSupported()) {
    return;
  }
  window.speechSynthesis.cancel();
};
