'use strict';

var app;

(function() {
   console.info('APP is loading');

   app = {
     selectLanguage: document.getElementById('select_language'),
     start_button: document.getElementById('start_button'),

     recognition: new webkitSpeechRecognition(),
     recognitionAvailable: 'webkitSpeechRecognition' in window,
     recognizing: false,

     doTamarJoke: true,
     doneTamarJoke: false
   };

   // Add listener to the start button
   setupStartButton();

   // Show the start info
   showInfo('info_start');

   // Begin the reconition magic
   setupRecognition();
})();
