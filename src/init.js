'use strict';
const CONFIG = require('../config');
var chessReq = require('./chess/chess');

var Init = function () {
    var chess = new chessReq(CONFIG.chess);
    chess.init();
    chess.initPlayerArchives();
}();
