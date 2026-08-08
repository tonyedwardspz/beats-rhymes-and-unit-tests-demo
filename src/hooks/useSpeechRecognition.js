import { useCallback, useEffect, useRef, useState } from 'react';

// Keys map to the informational messages rendered by <InfoMessages />.
export const INFO = {
  START: 'info_start',
  SPEAK_NOW: 'info_speak_now',
  NO_SPEECH: 'info_no_speech',
  NO_MICROPHONE: 'info_no_microphone',
  ALLOW: 'info_allow',
  DENIED: 'info_denied',
  BLOCKED: 'info_blocked',
  UPGRADE: 'info_upgrade',
};

export const MIC = {
  IDLE: '/images/mic.gif',
  LISTENING: '/images/mic-animate.gif',
  STARTING: '/images/mic-slash.gif',
};

const capitalize = (s) => s.replace(/\S/, (m) => m.toUpperCase());

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

/**
 * Wraps the Web Speech Recognition API in a React hook.
 *
 * @param {Object}  options
 * @param {string}  options.language  BCP-47 language tag (e.g. "en-GB").
 * @param {Object}  options.finalRef  Ref to the element holding the final transcript
 *                                    (used to select the text when recognition ends).
 */
export function useSpeechRecognition({ language, finalRef }) {
  const supported = Boolean(SpeechRecognition);

  const [recognizing, setRecognizing] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [infoKey, setInfoKey] = useState(supported ? INFO.START : INFO.UPGRADE);
  const [micSrc, setMicSrc] = useState(MIC.IDLE);

  const recognitionRef = useRef(null);
  const ignoreOneEndRef = useRef(false);
  const timeStampRef = useRef(0);
  const finalTranscriptRef = useRef('');

  // Keep the latest language available to the recognition callbacks,
  // which are only assigned once but need current values.
  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  useEffect(() => {
    if (!supported) {
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageRef.current;

    recognition.onstart = () => {
      setRecognizing(true);
      setInfoKey(INFO.SPEAK_NOW);
      setMicSrc(MIC.LISTENING);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setMicSrc(MIC.IDLE);
        setInfoKey(
          event.error === 'no-speech' ? INFO.NO_SPEECH : INFO.NO_MICROPHONE
        );
      }
      if (event.error === 'not-allowed') {
        if (event.timeStamp - timeStampRef.current < 100) {
          setInfoKey(INFO.BLOCKED);
        } else {
          setInfoKey(INFO.DENIED);
        }
      }
      ignoreOneEndRef.current = true;
    };

    recognition.onend = () => {
      setRecognizing(false);
      if (ignoreOneEndRef.current) {
        return;
      }
      setMicSrc(MIC.IDLE);
      if (!finalTranscriptRef.current) {
        setInfoKey(INFO.START);
        return;
      }
      setInfoKey('');
      if (window.getSelection && finalRef?.current) {
        window.getSelection().removeAllRanges();
        const range = document.createRange();
        range.selectNode(finalRef.current);
        window.getSelection().addRange(range);
      }
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      finalTranscriptRef.current = capitalize(finalTranscriptRef.current);
      setFinalTranscript(finalTranscriptRef.current);
      setInterimTranscript(interim);
    };

    return () => {
      recognition.onstart = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onresult = null;
      try {
        recognition.abort();
      } catch (e) {
        /* no-op */
      }
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  const start = useCallback((event) => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }
    finalTranscriptRef.current = '';
    recognition.start();
    ignoreOneEndRef.current = false;
    setFinalTranscript('');
    setInterimTranscript('');
    setMicSrc(MIC.STARTING);
    setInfoKey(INFO.ALLOW);
    timeStampRef.current = event?.timeStamp ?? 0;
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggle = useCallback(
    (event) => {
      if (recognizing) {
        stop();
      } else {
        start(event);
      }
    },
    [recognizing, start, stop]
  );

  return {
    supported,
    recognizing,
    finalTranscript,
    interimTranscript,
    infoKey,
    micSrc,
    start,
    stop,
    toggle,
  };
}
