'use strict';

function tamarJaoke(transcript) {
  if (transcript.includes('where is the grass greener') && !app.doneTamarJoke) {
    // speech sythasis addon
    var utter = new SpeechSynthesisUtterance('The grass is always greener on the other side of the tamar. Cornwall is ansum');
    window.speechSynthesis.speak(utter);
    app.doneTamarJoke = true;
  }
}
