import { useEffect, useMemo, useState } from 'react';
import {
  cancelSpeech,
  getVoices,
  isSpeechSynthesisSupported,
  speak,
  subscribeVoices,
} from '../lib/speechSynthesis.js';

const DEFAULT_TEXT = 'The current meetup is awesome.';

export default function JokePage() {
  const supported = isSpeechSynthesisSupported();
  const [text, setText] = useState(DEFAULT_TEXT);
  const [voices, setVoices] = useState(() => getVoices());
  const [voiceURI, setVoiceURI] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!supported) {
      return undefined;
    }
    return subscribeVoices(setVoices);
  }, [supported]);

  // Pick a sensible default voice once the list loads.
  useEffect(() => {
    if (!voices.length || voiceURI) {
      return;
    }
    const preferred =
      voices.find((v) => v.default) ||
      voices.find((v) => v.lang?.startsWith('en')) ||
      voices[0];
    if (preferred) {
      setVoiceURI(preferred.voiceURI);
    }
  }, [voices, voiceURI]);

  const selectedVoice = useMemo(
    () => voices.find((v) => v.voiceURI === voiceURI) || null,
    [voices, voiceURI]
  );

  const handleSpeak = () => {
    speak({
      text: text.trim(),
      voice: selectedVoice,
      rate,
      pitch,
      volume,
    });
  };

  const handleStop = () => {
    cancelSpeech();
  };

  return (
    <>
      <h1 className="center">Joke</h1>

      {!supported && (
        <p className="center muted">
          Speech synthesis is not supported in this browser. Try Chrome or
          another Chromium-based browser.
        </p>
      )}

      {supported && (
        <form
          className="tts-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSpeak();
          }}
        >
          <label className="tts-field">
            <span className="tts-label">Text</span>
            <textarea
              className="tts-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              aria-label="Text to speak"
            />
          </label>

          <label className="tts-field">
            <span className="tts-label">Voice</span>
            <select
              className="tts-select"
              value={voiceURI}
              onChange={(e) => setVoiceURI(e.target.value)}
              disabled={!voices.length}
            >
              {!voices.length && (
                <option value="">No voices available</option>
              )}
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </label>

          <label className="tts-field">
            <span className="tts-label">
              Speed <span className="tts-value">{rate.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </label>

          <label className="tts-field">
            <span className="tts-label">
              Pitch <span className="tts-value">{pitch.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
            />
          </label>

          <label className="tts-field">
            <span className="tts-label">
              Volume <span className="tts-value">{volume.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </label>

          <div className="tts-actions">
            <button type="submit" className="tts-button tts-button-primary">
              Speak
            </button>
            <button
              type="button"
              className="tts-button"
              onClick={handleStop}
            >
              Stop
            </button>
          </div>
        </form>
      )}
    </>
  );
}
