import { useRef, useState } from 'react';
import InfoMessages from '../components/InfoMessages.jsx';
import LanguageSelect from '../components/LanguageSelect.jsx';
import MicButton from '../components/MicButton.jsx';
import Results from '../components/Results.jsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { DEFAULT_JOKE } from '../lib/jokes.js';

export default function SpeechRecognitionPage() {
  const [language, setLanguage] = useState('en-GB');
  const [joke] = useState(DEFAULT_JOKE);
  const finalRef = useRef(null);

  const {
    supported,
    recognizing,
    finalTranscript,
    interimTranscript,
    infoKey,
    micSrc,
    toggle,
  } = useSpeechRecognition({ language, joke, finalRef });

  return (
    <>
      <h1 className="center">Beats, Rhymes &amp; Unit Tests</h1>

      <InfoMessages infoKey={infoKey} />

      {supported && (
        <MicButton src={micSrc} recognizing={recognizing} onToggle={toggle} />
      )}

      <Results
        ref={finalRef}
        finalTranscript={finalTranscript}
        interimTranscript={interimTranscript}
      />

      <LanguageSelect
        value={language}
        onChange={setLanguage}
        disabled={recognizing}
      />
    </>
  );
}
