'use strict';

var app,
    langs = ['English', ['en-AU', 'Australia'],
                        ['en-CA', 'Canada'],
                        ['en-IN', 'India'],
                        ['en-NZ', 'New Zealand'],
                        ['en-ZA', 'South Africa'],
                        ['en-GB', 'United Kingdom'],
                        ['en-US', 'United States']];

(function() {
   console.info('APP is loading');

   app = {
     select_language: document.getElementById('select_language'),
     select_dialect: document.getElementById('select_dialect'),
     start_button: document.getElementById('start_button'),
     copy_button: document.getElementById('copy_button'),

     recognition: new webkitSpeechRecognition(),
     recognitionAvailable: 'webkitSpeechRecognition' in window,
     recognizing: false,

     tamarJoke: true
   };

   // Setup the language boxes
   setupLangs();

   // Add listener to the start button
   setupStartButton();

   // Show the start info
   showInfo('info_start');
})();

function setupLangs() {
  for (var i = 0; i < langs.length; i++) {
    app.select_language.options[i] = new Option(langs[i][0], i);
  }
  app.select_language.selectedIndex = 0;
  updateCountry();
  app.select_dialect.selectedIndex = 6;
}

function setupStartButton() {
  app.start_button.addEventListener('click', function (e) {
    startButton(e);
  });
}

function setupCopyButton(){
  app.copy_button.addEventListener('click', function (e) {
    copyButton(e);
  });
}

function updateCountry() {
  for (var i = app.select_dialect.options.length - 1; i >= 0; i--) {
    app.select_dialect.remove(i);
  }
  var list = langs[app.select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    app.select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  app.select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}





var final_transcript = '';
var ignore_onend;
var start_timestamp;
if (!app.recognitionAvailable) {
  upgrade();
} else {
  app.start_button.style.display = 'inline-block';
  app.recognition = new webkitSpeechRecognition();
  app.recognition.continuous = true;
  app.recognition.interimResults = true;

  app.recognition.onstart = function() {
    app.recognizing = true;
    showInfo('info_speak_now');
    start_img.src = 'images/mic-animate.gif';
  };

  app.recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = 'images/mic.gif';
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = 'images/mic.gif';
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
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


    if (interim_transcript.includes('where is the grass greener') && !app.tamarJoke) {
      // speech sythasis addon
      var utter = new SpeechSynthesisUtterance("The grass is always greener on the other side of the tamar. Cornwall is ansum");
      window.speechSynthesis.speak(utter);
      app.tamarJoke = true;
    }
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    }
  };
}

function upgrade() {
  app.start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function copyButton() {
  if (app.recognizing) {
    app.recognizing = false;
    app.recognition.stop();
  }
  app.catch((err) => {})
  app.copy_button.style.display = 'none';
  copy_info.style.display = 'inline-block';
  showInfo('');
}

function startButton(event) {
  if (app.recognizing) {
    app.recognition.stop();
    return;
  }
  final_transcript = '';
  app.recognition.lang = app.select_dialect.value;
  app.recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.src = 'images/mic-slash.gif';
  showInfo('info_allow');
  showButtons('none');
  start_timestamp = event.timeStamp;
}

function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'inline' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
}

var current_style;
function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
  app.copy_button.style.display = style;
  copy_info.style.display = 'none';
}
