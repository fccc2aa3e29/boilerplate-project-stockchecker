/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const stockHandler = require('../controllers/stockHandler.js');

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
    stockHandler(req, res)  
  });
    
};

