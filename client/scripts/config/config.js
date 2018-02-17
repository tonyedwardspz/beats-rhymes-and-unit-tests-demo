'use strict';

let setupStartButton = () => {
  app.startButton.addEventListener('click', function (e) {
    startButton(e);
  });
};

let upgrade = () => {
  app.start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
};

let linebreak = (s) => {
  return s.replace(/\n\n/g, '<p></p>').replace(/\n/g, '<br>');
};

let capitalize = (s) => {
  return s.replace(/\S/, function(m) { return m.toUpperCase(); });
};

let showInfo = (s) => {
  if (s) {
    for (let child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'inline' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
};
