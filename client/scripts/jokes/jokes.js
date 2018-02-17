'use strict';

let tamarJaoke = (transcript) => {
  if (transcript.includes('where is the grass greener') && !app.doneTamarJoke) {
    let msg = `The grass is always greener on the other side of the tamar.
               Cornwall is ansum`;
    let utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
    app.doneTamarJoke = true;
  }
};
