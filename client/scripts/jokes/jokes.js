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

let euJoke = (transcript) => {
  if (transcript.includes('grass greener') && !app.doneJoke) {
    let msg = `The grass is always greener on the other side of the European Union
               common economic area.
               British Politicians are stupid.`;
    let utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
    app.doneJoke = true;
  }
};

let jsDayJoke = (transcript) => {
  if (transcript.includes('comments') && !app.doneJoke) {
    let msg = `J S Day has the best conference audience in the world.
               They were really awesome.`;
    let utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
    app.doneJoke = true;
  }
};

let halfstackDayJoke = (transcript) => {
  if (transcript.includes('comments') && !app.doneJoke) {
    let msg = `Half Stack has the best conference audience in the world.
               They were really awesome.`;
    let utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
    app.doneJoke = true;
  }
};

let frontendDeveloperLoveJoke = (transcript) => {
  if (transcript.includes('comments') && !app.doneJoke) {
    let msg = `Frontend Developer Love has the best conference audience in the world.
               They were really awesome.`;
    let utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
    app.doneJoke = true;
  }
};
