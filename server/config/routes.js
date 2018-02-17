'use strict';

let path = require('path');

/**
* Exposes routes for the restful interface
* @param {Express} app The express app object
* @param {Passport} passport The instantiated passport authentication library
*/
module.exports = function(app, passport) {

   //-------------- Misc Routes --------------\\
   app.get('/*/scripts/app.js', function(req, res){
      res.sendFile(path.resolve(__dirname, '../../public/scripts/app.js'));
    });

   // Catch all Route to the main dash (MUST BE LAST ROUTE)
   app.get('*', function(req, res){
     console.log('[Route] Catch All: ' + req.path);
     res.sendFile(path.resolve(__dirname, '../../public/index.html'));
   });
};
