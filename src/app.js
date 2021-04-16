'use strict';
const CONFIG = require('../config');
var chessReq = require('./chess/chess');

var App = function () {
    var chess = new chessReq(CONFIG.chess);
    chess.init();
    chess.getPlayerArchives(function (gifUrl) {
        console.log('Should be tweeting', gifUrl);
    });
}();
