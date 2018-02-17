'use strict';

let setupRecognition = () => {

  app.recognition.continuous = true;
  app.recognition.interimResults = true;
  let languageIndex = app.selectLanguage.selectedIndex;
  app.recognition.lang = app.selectLanguage[languageIndex].value;

  app.recognition.onstart = function() {
    app.recognizing = true;
    showInfo('info_speak_now');
    app.startImage.src = 'images/mic-animate.gif';
  };

  app.recognition.onerror = function(event) {
    if (event.error === 'no-speech' || event.error === 'audio-capture') {
      app.startImage.src = 'images/mic.gif';
      event.error = 'no-speech' ? showInfo('info_no_speech') :
                                  showInfo('info_no_microphone');
    }
    if (event.error === 'not-allowed') {
      if (event.timeStamp - app.recognitionTimeStamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
    }
    app.recognitionIgnoreOneEnd = true;
  };

  app.recognition.onend = function() {
    app.recognizing = false;
    if (app.recognitionIgnoreOneEnd) {
      return;
    }
    app.startImage.src = 'images/mic.gif';
    if (!app.finalTranscript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      let range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
  };

  app.recognition.onresult = function(event) {
    let interim_transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        app.finalTranscript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    app.finalTranscript = capitalize(app.finalTranscript);
    app.finalSpan.innerHTML = linebreak(app.finalTranscript);
    app.interimSpan.innerHTML = linebreak(interim_transcript);

    if (app.doTamarJoke){
      tamarJoke(interim_transcript);
    }

  };
};

let startButton = (event) => {
  if (app.recognizing) {
    app.recognition.stop();
    return;
  }
  app.finalTranscript = '';
  app.recognition.start();
  app.recognitionIgnoreOneEnd = false;
  app.finalSpan.innerHTML = '';
  app.interimSpan.innerHTML = '';
  app.startImage.src = 'images/mic-slash.gif';
  showInfo('info_allow');
  app.reconitionTimeStamp = event.timeStamp;
};
