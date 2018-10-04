'use strict';

var app;

(function() {
   console.info('APP is loading');

   app = {
     selectLanguage: document.getElementById('select_language'),
     startButton: document.getElementById('start_button'),
     startImage: document.getElementById('start_img'),
     finalSpan: document.getElementById('final_span'),
     interimSpan: document.getElementById('interim_span'),

     recognition: new webkitSpeechRecognition(),
     recognitionAvailable: 'webkitSpeechRecognition' in window,
     recognizing: false,
     recognitionTimeStamp: null,
     recognitionIgnoreOneEnd: null,
     finalTranscript: '',

     doTamarJoke: false,
     doM25Joke: true,
     doneJoke: false
   };

   // Add listener to the start button
   setupStartButton();

   // Show the start info
   showInfo('info_start');

   console.log('Joke');

   // Start the recognition service if recognitionAvailable
   app.recognitionAvailable ? setupRecognition() : upgrade();
})();
