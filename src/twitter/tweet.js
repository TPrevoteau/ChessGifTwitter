'use strict';
var Twitter = require('twitter');
var fs = require('fs');

module.exports = function (CONFIG) {
    this.tweet = function (gifPath) {
        var client = new Twitter(CONFIG);

        const mediaType = 'image/gif';
        const mediaData = fs.readFileSync(gifPath);
        const mediaSize = fs.statSync(gifPath).size;

        initUpload()
            .then(appendUpload)
            .then(finalizeUpload)
            .then(mediaId => {
                client.post('statuses/update', {media_ids: mediaId}, function (error, tweet, response) {
                    if (error) throw error;
                    console.log('Tweeted', tweet);
                });
            });

        /**
         * Step 1 of 3: Initialize a media upload
         * @return Promise resolving to String mediaId
         */
        function initUpload() {
            return makePost('media/upload', {
                command: 'INIT',
                total_bytes: mediaSize,
                media_type: mediaType,
            }).then(data => data.media_id_string);
        }

        /**
         * Step 2 of 3: Append file chunk
         * @param String mediaId    Reference to media object being uploaded
         * @return Promise resolving to String mediaId (for chaining)
         */
        function appendUpload(mediaId) {
            return makePost('media/upload', {
                command: 'APPEND',
                media_id: mediaId,
                media: mediaData,
                segment_index: 0
            }).then(data => mediaId);
        }

        /**
         * Step 3 of 3: Finalize upload
         * @param String mediaId   Reference to media
         * @return Promise resolving to mediaId (for chaining)
         */
        function finalizeUpload(mediaId) {
            return makePost('media/upload', {
                command: 'FINALIZE',
                media_id: mediaId
            }).then(data => mediaId);
        }

        /**
         * (Utility function) Send a POST request to the Twitter API
         * @param String endpoint  e.g. 'statuses/upload'
         * @param Object params    Params object to send
         * @return Promise         Rejects if response is error
         */
        function makePost(endpoint, params) {
            return new Promise((resolve, reject) => {
                client.post(endpoint, params, (error, data, response) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
            });
        }
    }
}