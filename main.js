/*jshint laxcomma:true node:true es5:true*/
(function() {
  "use strict";
  /* Requires */
  var irc = require('irc')
    , http = require('http')
  /* IRC Stuff */
    , config = require('./config.js')
    , ircClient = new irc.Client(config.server, config.nick, {
          channels: config.channels
        , port: config.port
        , secure: config.secure
        , selfSigned: config.selfSigned
        , floodProtectionDelay: config.floodProtectionDelay
        , password: config.password
      })
    , maxCommitMsg = 140
  /* HTTP Stuff */
    , gitReceive = http.createServer()
    ;

  /* IRC Stuff */  
  ircClient.addListener('message' + channels[0], function(user, message) {
    var messageArray
      , userToSpam
      , spamMessage
      ;
    console.log(user + ' => ' + message);

    if(/telenull_bot/.test(message)) {
      ircClient.say(channels[0], "I'm a hippopotamus!");
    }

  });

  /* http stuff */
  gitReceive.on('request', function(req,res) {
    var rawData = ''
      , data
      ;

    req.setEncoding('utf8');

    req.on('data', function(chunk) {
      rawData += decodeURIComponent(chunk.replace(/^payload=/, ''));
    });

    req.on('end', function() {
      data = JSON.parse(rawData);
      data.commits.forEach(function(commit, index) {
        if(commit.message.length > maxCommitMsg) {
          commit.message = commit.message.substring(0, maxCommitMsg)
          + '[...]';
        }

        ircClient.say(channels[0],
          irc.colors.wrap('magenta', data.repository.name)
          + '|' 
          + irc.colors.wrap('light_cyan', commit.committer.username)
          + ': '
          + commit.message
          + irc.colors.wrap('magenta', ' >> ')
          + commit.url //TODO shorten links (write a shortenener)
        );
      });
    });

  });
  gitReceive.listen(63000);




}());
