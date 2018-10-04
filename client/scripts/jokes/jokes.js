'use strict';

let tamarJoke = (transcript) => {
  if (transcript.includes('grass greener') && !app.doneJoke) {
    let msg = `The grass is always greener on the other side of the tamar.
               Cornwall is ansum`;
    let utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
    app.doneJoke = true;
  }
};

let m25Joke = (transcript) => {
  if (transcript.includes('grass greener') && !app.doneJoke) {
    let msg = `The grass is always greener on the other side of the M 25.
               The South West is ansum`;
    let utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
    app.doneJoke = true;
  }
};
