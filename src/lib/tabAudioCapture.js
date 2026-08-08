// Audio capture helpers for recording speechSynthesis output.
// Prefer display/system audio or a microphone — Chrome OS voices usually
// do NOT appear in "Chrome tab" audio alone.

const RECORDER_MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
];

/** True when getDisplayMedia and MediaRecorder are available. */
export const isTabAudioCaptureSupported = () =>
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  Boolean(navigator.mediaDevices?.getDisplayMedia) &&
  typeof MediaRecorder !== 'undefined';

/** True when getUserMedia (mic) and MediaRecorder are available. */
export const isMicrophoneCaptureSupported = () =>
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  Boolean(navigator.mediaDevices?.getUserMedia) &&
  typeof MediaRecorder !== 'undefined';

/**
 * Pick a MediaRecorder MIME type the browser supports.
 * @returns {string | undefined}
 */
export const pickRecorderMimeType = () => {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
    return undefined;
  }
  return RECORDER_MIME_CANDIDATES.find((type) =>
    MediaRecorder.isTypeSupported(type)
  );
};

/**
 * Build getDisplayMedia options aimed at capturing OS speech audio.
 * Prefer entire-screen/system audio over a Chrome tab — tab audio usually
 * excludes speechSynthesis (OS TTS).
 * @returns {DisplayMediaStreamOptions}
 */
const buildDisplayMediaOptions = () => {
  const supported =
    typeof navigator.mediaDevices.getSupportedConstraints === 'function'
      ? navigator.mediaDevices.getSupportedConstraints()
      : {};

  /** @type {MediaTrackConstraints | boolean} */
  const audio = {};
  if (supported.suppressLocalAudioPlayback) {
    // Keep hearing TTS locally while recording.
    audio.suppressLocalAudioPlayback = false;
  }
  if (supported.restrictOwnAudio) {
    // Do not filter out this page's audio if the browser mixes it in.
    audio.restrictOwnAudio = false;
  }

  /** @type {DisplayMediaStreamOptions & {
   *   preferCurrentTab?: boolean;
   *   selfBrowserSurface?: string;
   *   systemAudio?: string;
   *   monitorTypeSurfaces?: string;
   * }} */
  const options = {
    video: true,
    audio: Object.keys(audio).length ? audio : true,
    // Steer away from "Chrome tab" — OS voices are system audio, not tab audio.
    preferCurrentTab: false,
    selfBrowserSurface: 'include',
    systemAudio: 'include',
    monitorTypeSurfaces: 'include',
  };

  return options;
};

const ensureAudioTracks = (captureStream, missingMessage) => {
  // We only need audio; drop video ASAP to shrink the privacy surface.
  for (const track of captureStream.getVideoTracks()) {
    track.stop();
    captureStream.removeTrack(track);
  }

  const audioTracks = captureStream.getAudioTracks();
  if (!audioTracks.length) {
    stopMediaStream(captureStream);
    const error = new Error(missingMessage);
    error.name = 'TabAudioMissingError';
    throw error;
  }

  // Best-effort: keep own audio in the mix when the browser supports it.
  for (const track of audioTracks) {
    try {
      const capabilities =
        typeof track.getCapabilities === 'function' ? track.getCapabilities() : {};
      if (
        capabilities &&
        Object.prototype.hasOwnProperty.call(capabilities, 'restrictOwnAudio')
      ) {
        track.applyConstraints({ restrictOwnAudio: false }).catch(() => {});
      }
    } catch {
      /* ignore unsupported constraint apply */
    }
  }

  return new MediaStream(audioTracks);
};

/**
 * Ask the user to share a screen/window with system audio (preferred for TTS).
 *
 * @returns {Promise<{ captureStream: MediaStream, audioStream: MediaStream, source: 'display' }>}
 */
export const startTabAudioCapture = async () => {
  if (!isTabAudioCaptureSupported()) {
    const error = new Error(
      'Screen audio capture is not supported in this browser. Try Chrome or Edge.'
    );
    error.name = 'TabAudioUnsupportedError';
    throw error;
  }

  let captureStream;
  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia(
      buildDisplayMediaOptions()
    );
  } catch (err) {
    if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
      const error = new Error(
        'Sharing was cancelled. To record speech, share your entire screen (or window) with system audio enabled — not just a Chrome tab.'
      );
      error.name = 'TabAudioCancelledError';
      error.cause = err;
      throw error;
    }
    throw err;
  }

  const audioStream = ensureAudioTracks(
    captureStream,
    'No audio track was shared. Choose Entire screen (or a window) and enable system audio. “Chrome tab” audio usually cannot record speech voices.'
  );

  return { captureStream, audioStream, source: 'display' };
};

/**
 * Capture microphone audio (picks up TTS from speakers / loopback).
 *
 * @returns {Promise<{ captureStream: MediaStream, audioStream: MediaStream, source: 'microphone' }>}
 */
export const startMicrophoneCapture = async () => {
  if (!isMicrophoneCaptureSupported()) {
    const error = new Error(
      'Microphone capture is not supported in this browser.'
    );
    error.name = 'MicrophoneUnsupportedError';
    throw error;
  }

  let captureStream;
  try {
    captureStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });
  } catch (err) {
    if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
      const error = new Error(
        'Microphone permission was denied. Allow the mic, keep speakers unmuted, then try again.'
      );
      error.name = 'MicrophoneCancelledError';
      error.cause = err;
      throw error;
    }
    throw err;
  }

  const audioStream = new MediaStream(captureStream.getAudioTracks());
  if (!audioStream.getAudioTracks().length) {
    stopMediaStream(captureStream);
    const error = new Error('No microphone audio track was available.');
    error.name = 'MicrophoneMissingError';
    throw error;
  }

  return { captureStream, audioStream, source: 'microphone' };
};

/**
 * Stop every track on a MediaStream (safe no-op for null/undefined).
 * @param {MediaStream | null | undefined} stream
 */
export const stopMediaStream = (stream) => {
  if (!stream) {
    return;
  }
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      /* no-op */
    }
  }
};

/**
 * Create a MediaRecorder for an audio-only stream.
 *
 * @param {MediaStream} audioStream
 * @returns {{ recorder: MediaRecorder, mimeType: string }}
 */
export const createAudioRecorder = (audioStream) => {
  const mimeType = pickRecorderMimeType();
  const recorder = mimeType
    ? new MediaRecorder(audioStream, { mimeType })
    : new MediaRecorder(audioStream);
  return {
    recorder,
    mimeType: recorder.mimeType || mimeType || 'audio/webm',
  };
};

/**
 * Record until `stop()` is called on the returned controller.
 * Resolves with a Blob when the recorder fires `onstop`.
 *
 * @param {MediaStream} audioStream
 * @returns {{ stop: () => Promise<{ blob: Blob, mimeType: string, discarded?: boolean }>, discard: () => Promise<void>, recorder: MediaRecorder }}
 */
export const startAudioRecording = (audioStream) => {
  const { recorder, mimeType } = createAudioRecorder(audioStream);
  /** @type {BlobPart[]} */
  const chunks = [];
  let keepResult = true;

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const stopped = new Promise((resolve, reject) => {
    recorder.onstop = () => {
      if (!keepResult) {
        resolve({
          blob: new Blob([], { type: mimeType }),
          mimeType,
          discarded: true,
        });
        return;
      }
      const blob = new Blob(chunks, { type: mimeType });
      resolve({ blob, mimeType, discarded: false });
    };
    recorder.onerror = () => {
      reject(new Error('MediaRecorder failed while recording audio.'));
    };
  });

  // Timeslice helps some Chromium builds flush audio chunks during long speech.
  recorder.start(250);

  return {
    recorder,
    stop: async () => {
      if (recorder.state === 'recording' || recorder.state === 'paused') {
        recorder.stop();
      }
      return stopped;
    },
    discard: async () => {
      keepResult = false;
      if (recorder.state === 'recording' || recorder.state === 'paused') {
        recorder.stop();
      }
      await stopped;
    },
  };
};

/**
 * Decode a recording and return whether its RMS level looks silent.
 * Playable WebM files can still be pure silence when TTS never hit the stream.
 *
 * @param {Blob} blob
 * @param {number} [rmsThreshold=0.008]
 * @returns {Promise<boolean>}
 */
export const looksSilentRecording = async (blob, rmsThreshold = 0.008) => {
  if (!blob || blob.size < 256) {
    return true;
  }

  if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
    // Fall back to a slightly higher size heuristic when we can't decode.
    return blob.size < 1500;
  }

  const Ctx = AudioContext || webkitAudioContext;
  const ctx = new Ctx();
  try {
    const buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    let peakRms = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      let sum = 0;
      // Sample evenly for long clips instead of scanning every frame.
      const step = Math.max(1, Math.floor(data.length / 40000));
      let count = 0;
      for (let i = 0; i < data.length; i += step) {
        sum += data[i] * data[i];
        count += 1;
      }
      if (count > 0) {
        peakRms = Math.max(peakRms, Math.sqrt(sum / count));
      }
    }
    return peakRms < rmsThreshold;
  } catch {
    // Undecodable blob — treat tiny/empty-ish payloads as silent.
    return blob.size < 1500;
  } finally {
    try {
      await ctx.close();
    } catch {
      /* no-op */
    }
  }
};

export const SILENT_RECORDING_HINT =
  'Recording was silent. Chrome speech voices are usually OS audio, not “tab audio”. Share Entire screen with system audio, or use the microphone while speakers play the voice.';
