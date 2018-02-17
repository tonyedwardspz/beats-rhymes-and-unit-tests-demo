'use strict';

/**
* Sets up the express application settings
* @param {Express} app The express app object
*/
module.exports = function(app, root, express){

  // set static paths
  app.use('/public', express.static(root + '/public'));
  app.use('/scripts', express.static(root + '/public/scripts'));
  app.use('/styles', express.static(root + '/public/styles'));
  app.use('/images', express.static(root + '/public/images'));

  // make the root directory accessable
  global._root = root;
};
