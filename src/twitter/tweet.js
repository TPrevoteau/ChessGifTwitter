'use strict';
var Twitter = require('twitter');

module.exports = function (CONFIG) {
    this.tweet = function (data) {
        var client = new Twitter(CONFIG);
        client.post('statuses/update', {status: data}, function (error, tweet, response) {
            if (error) throw error;
            console.log('Tweeted', tweet);
        })
    }
}