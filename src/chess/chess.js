'use strict';
var ChessWebAPI = require('chess-web-api');
var Gif = require('./gif');
var fs = require('fs');

module.exports = function (CONFIG) {
    this.playerId = CONFIG.playerId;
    this.chessAPI = new ChessWebAPI({
        queue: true,
    });
    this.gif = new Gif(CONFIG);
    this.archives = {};
    this.currentYear;
    this.currentMonth;

    this.init = function () {
        // Retrieve current year and month
        var today = new Date();
        this.currentYear = today.getFullYear().toString();
        var monthInt = today.getMonth() + 1;
        if (monthInt < 10) this.currentMonth = `0${monthInt}`;
        else this.currentMonth = monthInt.toString();

        // Initialize archives
        var dirPath = './bin';
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

        var fileName = 'archives.json';
        this.fullArchivesPath = `${dirPath}/${fileName}`;
        try{
            const content = fs.readFileSync(this.fullArchivesPath, {encoding: 'utf8'});
            this.archives = JSON.parse(content);
        } catch (err) {
            fs.writeFileSync(this.fullArchivesPath, JSON.stringify(this.archives));
        }

        // Initialize current archives
        if (!this.archives[this.currentYear]) this.archives[this.currentYear] = {};
        if (!this.archives[this.currentYear][this.currentMonth]) this.archives[this.currentYear][this.currentMonth] = [];
    };

    /**
     * Get missing archives for current month
     */
    this.getPlayerArchives = function (callback) {
        var _this = this;
        this.chessAPI.getPlayerCompleteMonthlyArchives(this.playerId, this.currentYear, this.currentMonth)
            .then(function(response){
                if (response.body && response.body.games) {
                    var monthArchives = _this.archives[_this.currentYear][_this.currentMonth];
                    // Get token and cookies before getting gifs
                    _this.gif.getTokenCookies(function() {
                        response.body.games.forEach(game => {
                            // Check if we did not already got this game url
                            if (!monthArchives.find(existingGames => existingGames == game.url)) {
                                // Add it to archives
                                monthArchives.push(game.url);
                                var playedWhite = game.white['@id'].endsWith(`/${CONFIG.playerId}`);
                                // Get gif using https request
                                _this.gif.getGif(game.url, !playedWhite, function(gifUrl) {
                                    if (callback) callback(gifUrl);
                                });
                            }
                        });
                        // Write in archives file
                        fs.writeFileSync(_this.fullArchivesPath, JSON.stringify(_this.archives));
                    });
                }
            },
            function (error) {
                console.error(error);
            });
    };
};