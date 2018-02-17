'use strict';

var express = require('express');

// Configure the express app
var app = express();
require('./server/config/express')(app, __dirname, express);

// Load route configuration
require('./server/config/routes')(app, __dirname);

// Start the app server
let port = process.env.PORT || 8000;
app.listen(port, function() {
  console.log('[Server] listening on port ' + port);
});
