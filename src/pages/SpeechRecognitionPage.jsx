import { useRef, useState } from 'react';
import InfoMessages from '../components/InfoMessages.jsx';
import LanguageSelect from '../components/LanguageSelect.jsx';
import MicButton from '../components/MicButton.jsx';
import PageTitle from '../components/PageTitle.jsx';
import Results from '../components/Results.jsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

export default function SpeechRecognitionPage() {
  const [language, setLanguage] = useState('en-GB');
  const finalRef = useRef(null);

  const {
    supported,
    recognizing,
    finalTranscript,
    interimTranscript,
    infoKey,
    micSrc,
    toggle,
  } = useSpeechRecognition({ language, finalRef });

  return (
    <>
      <PageTitle>Lyric Transcriber</PageTitle>

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
