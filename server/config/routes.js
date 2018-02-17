'use strict';

let path = require('path');

/**
* Exposes routes for the restful interface
* @param {Express} app The express app object
*/
module.exports = function(app) {

  app.get('/', function(req, res){
     res.sendFile(path.resolve(__dirname, '../../public/index.html'));
   });

   app.get('/styles/style.css', function(req, res){
      res.sendFile(path.resolve(__dirname, '../../public/styles/style.css'));
    });

   app.get('/scripts/app.js', function(req, res){
      res.sendFile(path.resolve(__dirname, '../../public/scripts/app.js'));
    });

   // Catch all Route to the main dash (MUST BE LAST ROUTE)
   app.get('*', function(req, res){
     console.log('[Route] Catch All: ' + req.path);
     res.sendFile(path.resolve(__dirname, '../../public/index.html'));
   });
};
