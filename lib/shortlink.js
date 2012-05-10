(function() {
  "use strict";
  
  var cfg = require('../config.js').shortener
    , options = {
          host: cfg.host
        , port: cfg.port
        , path: '/shorten'
        , method: 'POST'
        , headers: {
              "Content-type": 'application/json'
          }
      }
    ;

  function getShortLink(longLink, cb) {
    var sendData = JSON.stringify({ target: longLink })
      , req
      ;

    // maybe we don't need this?
    //options.headers["Content-length"] = sendData.length;

    req = http.request(reqOps, function(res) {

      res.setEncoding('utf8');
      res.on('data', function(data) {

        try {
          data = JSON.parse(data);
        } catch(e) {
          console.err('Bad data from shortener..');
          cb(longLink);
          return;
        }

        if(!data.hasOwnProperty('url')) {
          console.err('Problem calling shortener...');
          cb(longLink);
          return;
        }

        cb(data.url);
      });
    });

    req.write(sendData);
    req.end();
  }

  module.exports = getShortLink;
}());
