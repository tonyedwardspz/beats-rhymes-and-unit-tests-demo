'use strict';

var final_transcript = '';
var ignore_onend;
var start_timestamp;

function setupRecognition() {

  if (!app.recognitionAvailable) {
    upgrade();
  } else {
    app.start_button.style.display = 'inline-block';
    app.recognition.continuous = true;
    app.recognition.interimResults = true;
    app.recognition.lang = app.selectLanguage[app.selectLanguage.selectedIndex].value;

    app.recognition.onstart = function() {
      app.recognizing = true;
      showInfo('info_speak_now');
      start_img.src = 'images/mic-animate.gif';
    };

    app.recognition.onerror = function(event) {
      if (event.error === 'no-speech') {
        start_img.src = 'images/mic.gif';
        showInfo('info_no_speech');
        ignore_onend = true;
      }
      if (event.error === 'audio-capture') {
        start_img.src = 'images/mic.gif';
        showInfo('info_no_microphone');
        ignore_onend = true;
      }
      if (event.error === 'not-allowed') {
        if (event.timeStamp - start_timestamp < 100) {
          showInfo('info_blocked');
        } else {
          showInfo('info_denied');
        }
        ignore_onend = true;
      }
    };

    app.recognition.onend = function() {
      app.recognizing = false;
      if (ignore_onend) {
        return;
      }
      start_img.src = 'images/mic.gif';
      if (!final_transcript) {
        showInfo('info_start');
        return;
      }
      showInfo('');
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
        var range = document.createRange();
        range.selectNode(document.getElementById('final_span'));
        window.getSelection().addRange(range);
      }
    };

    app.recognition.onresult = function(event) {
      var interim_transcript = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      final_transcript = capitalize(final_transcript);
      final_span.innerHTML = linebreak(final_transcript);
      interim_span.innerHTML = linebreak(interim_transcript);

      if (app.doTamarJoke){
        tamarJoke(interim_transcript);
      }

    };
  }
}

function startButton(event) {
  if (app.recognizing) {
    app.recognition.stop();
    return;
  }
  final_transcript = '';
  app.recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.src = 'images/mic-slash.gif';
  showInfo('info_allow');
  start_timestamp = event.timeStamp;
}
