'use strict';
const CONFIG = require('../config');
var chessReq = require('./chess/chess');
var tweetReq = require('./twitter/tweet');

var App = function () {
    var chess = new chessReq(CONFIG.chess);
    var tweet = new tweetReq(CONFIG.twitter);
    chess.init();
    chess.getPlayerArchives(function (gifUrl) {
        tweet.tweet(gifUrl);
    });
}();
