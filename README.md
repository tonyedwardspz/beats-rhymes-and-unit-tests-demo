# Beats, Rhymes & Unit Tests: Demo

## Overview

This is the demo used during the Beats, Rhymes & Unit Tests talk. It is a small
React app that wraps the browser's [Web Speech Recognition API][speech-api]. It
transcribes spoken words into text and, for a bit of fun, speaks a joke aloud
(via the Web Speech Synthesis API) when it hears a particular trigger phrase.

This project was originally a Gulp + Express application. It has been migrated to
a modern [React][react] + [Vite][vite] setup while keeping the same behaviour.

## Prerequisites

You need [Node.js][node] (version 18 or later) and `npm` installed. A supported
version is pinned in `.nvmrc`.

The app relies on the Web Speech Recognition API, which currently works best in
Chromium-based browsers (e.g. Chrome). A microphone is required.

## Installation

Clone the project locally and move into the project directory:

```
git clone https://github.com/tonyedwardspz/beats-rhymes-and-life-demo && cd beats-rhymes-and-life-demo
```

Install dependencies:

```
npm install
```

## Run things

Start the development server (with hot reloading) on http://localhost:8000:

```
npm run dev
```

Create a production build in the `dist/` folder:

```
npm run build
```

Preview the production build locally:

```
npm run preview
```

## How it works

- `src/App.jsx` — top-level component wiring everything together.
- `src/hooks/useSpeechRecognition.js` — React hook wrapping the Web Speech
  Recognition API (start/stop, interim & final transcripts, status messages).
- `src/lib/jokes.js` — the joke definitions and the speech-synthesis helper.
- `src/components/` — presentational components (mic button, language selector,
  transcript results, and status messages).
- `src/styles/style.scss` — application styles.

## Contributing

Contributions / pull requests etc are not accepted without being discussed via GitHub issues.

## Author

- _Tony Edwards_
  - [Twitter](https://twitter.com/tonyedwardspz)

## License

MIT

[speech-api]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
[react]: https://react.dev/
[vite]: https://vite.dev/
[node]: https://nodejs.org/
