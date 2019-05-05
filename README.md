# Beats, Rhymes & Unit Tests: Demo

## Overview
This is the demo used during the Beats, Rhymes & Unit Tests talk.

## Prerequisites

In order to run this project you need `npm` and `node.js` installed. Please
refer to the relevant documentation for instructions.

## Installation
To install the project:

Clone the project locally, and move into project directory:

```
git clone https://github.com/tonyedwardspz/beats-rhymes-and-life-demo && cd beats-rhymes-and-life-demo
```

Install dependencies:

```
npm install
```

## Run things

The project uses [Gulp](http://gulpjs.com/) for the build system. There
are a few tasks which are suggested. All tasks are run from the project directory
on the command line.

To build the project run:

```
gulp
```

To build the project and watch for changes use:
```
gulp dev
```
Upon changes to the project the server will restart / files will be
regenerated as appropriate. If you'd like the browser to refresh for each change,
run:
```
gulp debug
```

### Other tasks
There are a couple other tasks you may wish to run:

#### Documentation

To generate the project's documentation, run the command `gulp doc`. The documentation
can be found in the `./doc/gen` folder, with `index.html` as the starting point.

## Contributing

Contributions / pull requests etc are not accepted without being discussed via GitHub issues.

## Author
- *Tony Edwards*
    - [Twitter](https://twitter.com/tonyedwardspz)

## License
MIT
