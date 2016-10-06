var request = require('request');
var _ = require('lodash');

module.exports = {
  isURL: function(path) {
    var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\+.~#?&\/\/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?/gi;
    var regexp = new RegExp(expression);

    if (!path) {
      throw new Error('Invalid path/url string given.');
    }
    return path.match(regexp);
  },

  get: function(url) {
    return new Promise((resolve, reject) => request(url, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(error || new Error('Could not fetch remote URL.'));
      }
    }));
  },

  join: function(a, b) {
    return `${_.trimEnd(a, '/')}/${_.trimStart(b, '/')}`;
  },
};
