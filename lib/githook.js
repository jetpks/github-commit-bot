(function() {
  "use strict";

  var http = require('http')
    , irc = require('irc') // for colors
    , emitter = new require('events').EventEmitter()
    , shortLink = require('./shortlink.js')
    , cfg = require('../config.js').githook
    , server = http.createServer()
    , maxCommitMsg = cfg.maxCommitLength
    ;

  module.exports = emitter;

  server.on('request', gitHandler);
  server.listen(cfg.gitPostPort);

  function gitHandler(req,res) {
    var rawData = ''
      , data
      ;

    req.setEncoding('utf8');

    req.on('data', function(chunk) {
      if(!chunk) {
        return;
      }
      rawData += chunk.replace(/^payload=/, '');
    });

    req.on('end', function() {
      var sayStrings = []
        ;
      res.end('Thanks!');
      data = JSON.parse(decodeURIComponent(rawData));

      data.commits.forEach(loadStrings);

      function loadStrings(commit, index) {
        var link
          ;

        if(commit.message.length > maxCommitMsg) {
          commit.message = commit.message.substring(0, maxCommitMsg)
          + '[...]';
        }

        getShortLink(commit.url, function(shortLink) {

          emitter.emit('push',
            irc.colors.wrap('magenta', data.repository.name)
            + '|' 
            + irc.colors.wrap('light_cyan', commit.committer.username)
            + ': '
            + commit.message
            + irc.colors.wrap('magenta', ' >> ')
            + irc.colors.wrap('light_green', shortLink)
          );
        });
      }
    });
  }
}());
