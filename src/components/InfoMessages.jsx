import { INFO } from '../hooks/useSpeechRecognition.js';

const MIC_SETTINGS_LINK =
  '//support.google.com/chrome/bin/answer.py?hl=en&answer=1407892';

const MESSAGES = {
  [INFO.START]: <span>Click on the microphone icon and begin speaking.</span>,
  [INFO.SPEAK_NOW]: <span>Speak now.</span>,
  [INFO.NO_SPEECH]: (
    <span>
      No speech was detected. You may need to adjust your{' '}
      <a href={MIC_SETTINGS_LINK}>microphone settings</a>.
    </span>
  ),
  [INFO.NO_MICROPHONE]: (
    <span>
      No microphone was found. Ensure that a microphone is installed and that{' '}
      <a href={MIC_SETTINGS_LINK}>microphone settings</a> are configured
      correctly.
    </span>
  ),
  [INFO.ALLOW]: (
    <span>Click the &quot;Allow&quot; button above to enable your microphone.</span>
  ),
  [INFO.DENIED]: <span>Permission to use microphone was denied.</span>,
  [INFO.BLOCKED]: (
    <span>
      Permission to use microphone is blocked. To change, go to
      chrome://settings/contentExceptions#media-stream
    </span>
  ),
  [INFO.UPGRADE]: (
    <span>
      Web Speech API is not supported by this browser. Upgrade to{' '}
      <a href="//www.google.com/chrome">Chrome</a> version 25 or later.
    </span>
  ),
};

export default function InfoMessages({ infoKey }) {
  const message = infoKey ? MESSAGES[infoKey] : null;
  return (
    <div id="info" style={{ visibility: message ? 'visible' : 'hidden' }}>
      {message}
    </div>
  );
}
