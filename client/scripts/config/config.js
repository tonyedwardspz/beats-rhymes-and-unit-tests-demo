'use strict';

function setupStartButton() {
  app.startButton.addEventListener('click', function (e) {
    startButton(e);
  });
}

function upgrade() {
  app.start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}

function linebreak(s) {
  return s.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br>');
}

function capitalize(s) {
  return s.replace(/\S/, function(m) { return m.toUpperCase(); });
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
