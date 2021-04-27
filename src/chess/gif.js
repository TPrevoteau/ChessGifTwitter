'use strict';
var https = require('https');
const { DOMParser } = require('xmldom');
var cookie = require('cookie');
const fs = require('fs');
const download = require('download');

module.exports = function (CONFIG) {
    this.assetPushCookie = undefined;
    this.visitorIdCookie = undefined;
    this.phpSessionIdCookie = undefined;
    this.cfbmCookie = undefined;
    this.token = undefined;

    /**
     * Get a gif url from a specified fame url
     * @param {String} gameUrl - The game url from which we want to retreive the gif
     * @param {Boolean} flip - Should we flip the board ? False = White below / True = Black below
     * @param {Function} callback - Function to be called after response
     */
    this.getGif = function (gameUrl, flip = true, callback) {
        // Set the cookies of the request
        var cookies = '';
        cookies += cookie.serialize('asset_push', this.assetPushCookie.asset_push);
        cookies += '; ';
        cookies += cookie.serialize('visitorid', this.visitorIdCookie.visitorid);
        cookies += '; ';
        cookies += cookie.serialize('PHPSESSID', this.phpSessionIdCookie.PHPSESSID);
        cookies += '; ';
        cookies += cookie.serialize('__cf_bm', this.cfbmCookie.__cf_bm);
        console.log('This is our cookies for the request', cookies);

        const options = {
            hostname: CONFIG.rawUrl,
            port: CONFIG.port,
            path: CONFIG.gifPath,
            method: 'POST',
            headers: {
                'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
                'Cookie': cookies
            }
        }

        const req = https.request(options, res => {
            console.log(`getPage for gif statusCode: ${res.statusCode}`);
            var data = '';

            res.on('data', d => {
                data += d;
            })

            res.on('end', () => {
                // Find gif url in the DOM
                var doc = new DOMParser().parseFromString(data);
                var gifNode = doc.getElementById('animated-gif');
                var attributes = Object.values(gifNode.attributes);
                var urlAttr = attributes.find(attr => attr.name == 'url');
                var url = urlAttr.value;
                console.log('This is gif url', url);
                this.downloadGif(gameUrl, url, callback);
            })
        })

        req.on('error', error => {
            console.error(error)
        })

        if (flip) req.write(`animated_gif[data]=${gameUrl}&animated_gif[board_texture]=green&animated_gif[piece_theme]=neo&animated_gif[_token]=${this.token}&animated_gif[flip]=${this.flip}`);
        else req.write(`animated_gif[data]=${gameUrl}&animated_gif[board_texture]=green&animated_gif[piece_theme]=neo&animated_gif[_token]=${this.token}`);
        req.end();
    };

    /**
     * This request is made in order to get the cookies needed for the gifRequest.
     * It also provides the token for gifRequest.
     * @param {Function} callback - Function to be called after response
     */
    this.getTokenCookies = function (callback) {
        const options = {
            hostname: CONFIG.rawUrl,
            port: CONFIG.port,
            path: CONFIG.gifPath,
            method: 'POST',
            headers: {
                'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive'
            }
        }

        const req = https.request(options, res => {
            console.log(`getPage for token statusCode: ${res.statusCode}`);

            // Manage cookies in response
            var responseCookies = res.headers['set-cookie'];
            console.log('This is the cookies we get in response', responseCookies);
            var assetPush = responseCookies.find(cookie => cookie.startsWith('asset_push'));
            var visitorId = responseCookies.find(cookie => cookie.startsWith('visitorid'));
            var phpSessionId = responseCookies.find(cookie => cookie.startsWith('PHPSESSID'));
            var cfbm = responseCookies.find(cookie => cookie.startsWith('__cf_bm'));
            this.assetPushCookie = cookie.parse(assetPush);
            this.visitorIdCookie = cookie.parse(visitorId);
            this.phpSessionIdCookie = cookie.parse(phpSessionId);
            this.cfbmCookie = cookie.parse(cfbm);

            var data = '';
            res.on('data', d => {
                data += d;
            })

            res.on('end', () => {
                // Find the token of the form in the DOM
                var doc = new DOMParser().parseFromString(data);
                var tokenNode = doc.getElementById('animated_gif__token');
                var attributes = Object.values(tokenNode.attributes);
                var valueAttr = attributes.find(attr => attr.name == 'value');
                var token = valueAttr.value;
                console.log('this is our token', token);
                this.token = token;

                if (callback) callback();
            })
        })

        req.on('error', error => {
            console.error(error)
        })

        req.end();
    };

    /**
     * Download the gif in bin folder
     * @param {String} gameUrl - Url of the game
     * @param {String} gifUrl - Url of the gif
     * @param {Function} callback - Callback function
     */
    this.downloadGif = function (gameUrl, gifUrl, callback) {
        var gameId = this.getId(gameUrl);
        (async () => {
            var gifPath = `./bin/${gameId}.gif`;
            fs.writeFileSync(gifPath, await download(gifUrl));
            if (callback) callback(gifPath);
        })();
    };

    /**
     * Returns id of the game
     * @param {String} gameUrl - Url of the game
     * @returns Id of the game
     */
    this.getId = function (gameUrl) {
        var splitedStr = gameUrl.split('/');
        return splitedStr.pop();
    }
};