'use strict';
var ChessWebAPI = require('chess-web-api');
var Gif = require('./gif');

module.exports = function (CONFIG) {
    this.playerId = CONFIG.playerId;
    this.chessAPI = new ChessWebAPI({
        queue: true,
    });
    this.gif = new Gif(CONFIG);

    this.getPlayerArchives = function () {
        this.chessAPI.getPlayerMonthlyArchives(this.playerId)
            .then(function(response){
                console.log(response);
            },
            function (error) {
                console.error(error);
            });
    };

    this.getGif = function () {
        var gameUrl = 'https://www.chess.com/game/live/12068139093';
        this.gif.getGif(gameUrl, false);
    };
};