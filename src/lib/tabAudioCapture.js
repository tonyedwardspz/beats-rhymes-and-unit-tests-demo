// Tab audio capture helpers for recording speechSynthesis output via
// getDisplayMedia + MediaRecorder (Chromium desktop).

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
 * Build getDisplayMedia options with Chromium progressive enhancements.
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
    // Current-tab capture must include this tab's own audio.
    audio.restrictOwnAudio = false;
  }

  /** @type {DisplayMediaStreamOptions & { preferCurrentTab?: boolean; selfBrowserSurface?: string }} */
  const options = {
    video: true,
    audio: Object.keys(audio).length ? audio : true,
    preferCurrentTab: true,
  };

  // Chromium: allow selecting the current tab in the picker.
  options.selfBrowserSurface = 'include';

  return options;
};

/**
 * Ask the user to share a tab (preferring the current one) with audio.
 * Stops video tracks immediately and returns an audio-only MediaStream.
 *
 * @returns {Promise<{ captureStream: MediaStream, audioStream: MediaStream }>}
 */
export const startTabAudioCapture = async () => {
  if (!isTabAudioCaptureSupported()) {
    const error = new Error(
      'Tab audio capture is not supported in this browser. Try Chrome or Edge.'
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
        'Tab sharing was cancelled. To record speech, share this tab with audio enabled.'
      );
      error.name = 'TabAudioCancelledError';
      error.cause = err;
      throw error;
    }
    throw err;
  }

  // We only need audio; drop video ASAP to shrink the privacy surface.
  for (const track of captureStream.getVideoTracks()) {
    track.stop();
    captureStream.removeTrack(track);
  }

  const audioTracks = captureStream.getAudioTracks();
  if (!audioTracks.length) {
    stopMediaStream(captureStream);
    const error = new Error(
      'No audio track was shared. Share this tab and enable “Share tab audio”.'
    );
    error.name = 'TabAudioMissingError';
    throw error;
  }

  const audioStream = new MediaStream(audioTracks);
  return { captureStream, audioStream };
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
 * @returns {{ stop: () => Promise<{ blob: Blob, mimeType: string }>, discard: () => Promise<void>, recorder: MediaRecorder }}
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
        resolve({ blob: new Blob([], { type: mimeType }), mimeType, discarded: true });
        return;
      }
      const blob = new Blob(chunks, { type: mimeType });
      resolve({ blob, mimeType, discarded: false });
    };
    recorder.onerror = () => {
      reject(new Error('MediaRecorder failed while recording tab audio.'));
    };
  });

  recorder.start();

  return {
    recorder,
    stop: async () => {
      if (recorder.state === 'recording' || recorder.state === 'paused') {
        recorder.stop();
      } else if (recorder.state === 'inactive') {
        // Already stopped; onstop may have already fired.
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

/** Rough heuristic: blob too small to contain audible speech. */
export const looksSilentRecording = (blob) => !blob || blob.size < 256;
