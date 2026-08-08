import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelSpeech, speakAsync } from '../lib/speechSynthesis.js';
import {
  isTabAudioCaptureSupported,
  looksSilentRecording,
  startAudioRecording,
  startTabAudioCapture,
  stopMediaStream,
} from '../lib/tabAudioCapture.js';

/**
 * @typedef {Object} SpeechRecording
 * @property {string} id
 * @property {Blob} blob
 * @property {string} url
 * @property {string} mimeType
 * @property {number} [duration]
 * @property {number} createdAt
 */

let recordingSeq = 0;

/**
 * Retained tab-audio capture + speak-and-record for the Punchline page.
 */
export function useSpeechRecorder() {
  const supported = isTabAudioCaptureSupported();

  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState(/** @type {SpeechRecording[]} */ ([]));
  const [error, setError] = useState(/** @type {string | null} */ (null));

  const captureStreamRef = useRef(/** @type {MediaStream | null} */ (null));
  const audioStreamRef = useRef(/** @type {MediaStream | null} */ (null));
  const activeRecordingRef = useRef(/** @type {ReturnType<typeof startAudioRecording> | null} */ (null));
  const speakGenerationRef = useRef(0);
  const recordingsRef = useRef(recordings);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  const clearCaptureStreams = useCallback(() => {
    stopMediaStream(captureStreamRef.current);
    stopMediaStream(audioStreamRef.current);
    captureStreamRef.current = null;
    audioStreamRef.current = null;
    setIsCapturing(false);
  }, []);

  const attachTrackEndedHandlers = useCallback(
    (audioStream) => {
      const onEnded = () => {
        setError(
          'Tab audio capture was stopped. Enable capture again to keep recording.'
        );
        if (activeRecordingRef.current) {
          activeRecordingRef.current.discard().catch(() => {});
          activeRecordingRef.current = null;
          setIsRecording(false);
        }
        clearCaptureStreams();
      };

      for (const track of audioStream.getAudioTracks()) {
        track.addEventListener('ended', onEnded);
      }
    },
    [clearCaptureStreams]
  );

  const stopCapture = useCallback(() => {
    if (activeRecordingRef.current) {
      activeRecordingRef.current.discard().catch(() => {});
      activeRecordingRef.current = null;
      setIsRecording(false);
    }
    clearCaptureStreams();
  }, [clearCaptureStreams]);

  const startCapture = useCallback(async () => {
    setError(null);

    if (!supported) {
      setError(
        'Tab audio capture is not supported in this browser. Try Chrome or Edge.'
      );
      return;
    }

    // Replace any existing capture session.
    stopCapture();

    try {
      const { captureStream, audioStream } = await startTabAudioCapture();
      captureStreamRef.current = captureStream;
      audioStreamRef.current = audioStream;
      attachTrackEndedHandlers(audioStream);
      setIsCapturing(true);
    } catch (err) {
      clearCaptureStreams();
      setError(err?.message || 'Could not start tab audio capture.');
    }
  }, [supported, stopCapture, attachTrackEndedHandlers, clearCaptureStreams]);

  const discardRecording = useCallback((id) => {
    setRecordings((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.url) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const speakAndRecord = useCallback(
    async (options) => {
      setError(null);

      // Cancel any in-flight speak/record before starting a new one.
      speakGenerationRef.current += 1;
      const generation = speakGenerationRef.current;

      if (activeRecordingRef.current) {
        await activeRecordingRef.current.discard().catch(() => {});
        activeRecordingRef.current = null;
        setIsRecording(false);
      }

      if (!options?.text) {
        cancelSpeech();
        return;
      }

      const audioStream = audioStreamRef.current;
      const shouldRecord =
        Boolean(audioStream) &&
        audioStream.getAudioTracks().some((track) => track.readyState === 'live');

      let session = null;
      if (shouldRecord) {
        try {
          session = startAudioRecording(audioStream);
          activeRecordingRef.current = session;
          setIsRecording(true);
        } catch (err) {
          setError(err?.message || 'Could not start MediaRecorder.');
        }
      }

      try {
        await speakAsync(options);

        if (generation !== speakGenerationRef.current) {
          return;
        }

        if (session && activeRecordingRef.current === session) {
          const result = await session.stop();
          activeRecordingRef.current = null;
          setIsRecording(false);

          if (result.discarded) {
            return;
          }

          if (looksSilentRecording(result.blob)) {
            setError(
              'Recording is silent. Confirm you shared this tab with “Share tab audio” enabled. Some OS voices may not appear in tab audio — try a different Chrome voice.'
            );
            return;
          }

          const url = URL.createObjectURL(result.blob);
          /** @type {SpeechRecording} */
          const recording = {
            id: `rec-${Date.now()}-${recordingSeq++}`,
            blob: result.blob,
            url,
            mimeType: result.mimeType,
            createdAt: Date.now(),
          };
          setRecordings((prev) => [recording, ...prev]);
        }
      } catch (err) {
        if (session && activeRecordingRef.current === session) {
          await session.discard().catch(() => {});
          activeRecordingRef.current = null;
          setIsRecording(false);
        }

        if (generation !== speakGenerationRef.current) {
          return;
        }

        if (err?.name === 'SpeechCancelledError') {
          // User hit Stop or started another utterance — no error banner.
          return;
        }

        if (err?.name !== 'SpeechCancelledError') {
          setError(err?.message || 'Speech failed.');
        }
      }
    },
    []
  );

  const stopSpeech = useCallback(() => {
    speakGenerationRef.current += 1;
    if (activeRecordingRef.current) {
      activeRecordingRef.current.discard().catch(() => {});
      activeRecordingRef.current = null;
      setIsRecording(false);
    }
    cancelSpeech();
  }, []);

  // Cleanup on unmount: stop capture, abort recorder, revoke object URLs.
  useEffect(() => {
    return () => {
      speakGenerationRef.current += 1;
      if (activeRecordingRef.current) {
        activeRecordingRef.current.discard().catch(() => {});
        activeRecordingRef.current = null;
      }
      cancelSpeech();
      stopMediaStream(captureStreamRef.current);
      stopMediaStream(audioStreamRef.current);
      captureStreamRef.current = null;
      audioStreamRef.current = null;
      for (const item of recordingsRef.current) {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      }
    };
  }, []);

  return {
    supported,
    isCapturing,
    isRecording,
    recordings,
    error,
    startCapture,
    stopCapture,
    speakAndRecord,
    stopSpeech,
    discardRecording,
    clearError,
  };
}
