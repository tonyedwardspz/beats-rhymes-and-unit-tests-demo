// Each joke has a trigger phrase that, when heard in the interim transcript,
// causes the browser to speak the joke's message via the Web Speech Synthesis
// API. This mirrors the behaviour of the original demo, where a single joke was
// active at a time.

export const JOKES = {
  tamar: {
    trigger: 'grass greener',
    message: `The grass is always greener on the other side of the tamar.
              Cornwall is ansum`,
  },
  m25: {
    trigger: 'grass greener',
    message: `The grass is always greener on the other side of the M 25.
              The South West is ansum`,
  },
  eu: {
    trigger: 'grass greener',
    message: `The grass is always greener on the other side of the European Union
              common economic area.
              British Politicians are stupid.`,
  },
  jsDay: {
    trigger: 'comments',
    message: `J S Day has the best conference audience in the world.
              They were really awesome.`,
  },
  halfstack: {
    trigger: 'comments',
    message: `Half Stack has the best conference audience in the world.
              They were really awesome.`,
  },
  frontendLove: {
    trigger: 'comments',
    message: `Frontend Developer Love has the best conference audience in the world.
              They were really awesome.`,
  },
  bristech: {
    trigger: 'comments',
    message: `Bris tech has the best meet up audience in the world.
              They were really awesome.`,
  },
};

// The joke that is active by default (originally `doFrontendLoveJoke`).
export const DEFAULT_JOKE = 'frontendLove';

// Speak a message aloud using the Web Speech Synthesis API.
export const speak = (message) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  const utter = new SpeechSynthesisUtterance(message);
  window.speechSynthesis.speak(utter);
};
