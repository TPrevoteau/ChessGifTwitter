'use strict';
const CONFIG = require('../config');
var chessReq = require('./chess/chess');

var App = function () {
    var chess = new chessReq(CONFIG.chess);
    // chess.getPlayerArchives();
    chess.getGif();
}();
