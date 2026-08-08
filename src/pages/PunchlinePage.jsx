import { useEffect, useMemo, useState } from 'react';
import PageTitle from '../components/PageTitle.jsx';
import { useSpeechRecorder } from '../hooks/useSpeechRecorder.js';
import {
  getVoices,
  isSpeechSynthesisSupported,
  subscribeVoices,
} from '../lib/speechSynthesis.js';

const DEFAULT_TEXT = 'The current meetup is awesome.';

const extensionForMime = (mimeType) => {
  if (mimeType?.includes('mp4')) {
    return 'm4a';
  }
  if (mimeType?.includes('ogg')) {
    return 'ogg';
  }
  return 'webm';
};

export default function PunchlinePage() {
  const supported = isSpeechSynthesisSupported();
  const [text, setText] = useState(DEFAULT_TEXT);
  const [voices, setVoices] = useState(() => getVoices());
  const [voiceURI, setVoiceURI] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const {
    supported: captureSupported,
    displaySupported,
    micSupported,
    isCapturing,
    captureSource,
    isRecording,
    recordings,
    error: captureError,
    startCapture,
    startMicCapture,
    stopCapture,
    speakAndRecord,
    stopSpeech,
    discardRecording,
  } = useSpeechRecorder();

  const captureStatus = (() => {
    if (!isCapturing) {
      return null;
    }
    if (isRecording) {
      return 'Recording this utterance…';
    }
    if (captureSource === 'microphone') {
      return 'Microphone ready — Speak to record (keep speakers unmuted).';
    }
    return 'Screen/system audio ready — Speak to record.';
  })();

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
    speakAndRecord({
      text: text.trim(),
      voice: selectedVoice,
      rate,
      pitch,
      volume,
    });
  };

  const handleStop = () => {
    stopSpeech();
  };

  return (
    <>
      <PageTitle>Punchline</PageTitle>

      {!supported && (
        <p className="center muted">
          Speech synthesis is not supported in this browser. Try Chrome or
          another Chromium-based browser.
        </p>
      )}

      {supported && (
        <>
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

            <div className="tts-capture">
              <div className="tts-capture-row">
                <div className="tts-capture-copy">
                  <span className="tts-label">Record speech</span>
                  <p className="tts-capture-hint">
                    Chrome voices usually use the OS speech engine, so a
                    “Chrome tab” share records silence. Prefer{' '}
                    <strong>Entire screen + system audio</strong>, or use the
                    microphone while speakers play.
                  </p>
                </div>
                {isCapturing ? (
                  <button
                    type="button"
                    className="tts-button"
                    onClick={stopCapture}
                  >
                    Stop capture
                  </button>
                ) : (
                  <div className="tts-capture-actions">
                    <button
                      type="button"
                      className="tts-button tts-button-primary"
                      onClick={startCapture}
                      disabled={!displaySupported}
                    >
                      Share screen audio
                    </button>
                    <button
                      type="button"
                      className="tts-button"
                      onClick={startMicCapture}
                      disabled={!micSupported}
                    >
                      Use microphone
                    </button>
                  </div>
                )}
              </div>

              {!captureSupported && (
                <p className="tts-capture-status muted">
                  Recording needs Chrome or Edge with screen or microphone
                  capture.
                </p>
              )}

              {captureStatus && (
                <p
                  className={`tts-capture-status tts-capture-active${
                    isRecording ? ' tts-capture-recording' : ''
                  }`}
                  role="status"
                >
                  {captureStatus}
                </p>
              )}

              {captureError && (
                <p className="tts-capture-error" role="alert">
                  {captureError}
                </p>
              )}
            </div>

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

          {recordings.length > 0 && (
            <section className="tts-recordings" aria-label="Recordings">
              <h2 className="tts-recordings-title">Recordings</h2>
              <ul className="tts-recordings-list">
                {recordings.map((recording, index) => (
                  <li key={recording.id} className="tts-recording-item">
                    <div className="tts-recording-meta">
                      <span className="tts-recording-label">
                        Take {recordings.length - index}
                      </span>
                      <audio
                        className="tts-recording-audio"
                        controls
                        src={recording.url}
                        preload="metadata"
                      />
                    </div>
                    <div className="tts-recording-actions">
                      <a
                        className="tts-button"
                        href={recording.url}
                        download={`punchline-${recording.id}.${extensionForMime(
                          recording.mimeType
                        )}`}
                      >
                        Download
                      </a>
                      <button
                        type="button"
                        className="tts-button"
                        onClick={() => discardRecording(recording.id)}
                      >
                        Discard
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
