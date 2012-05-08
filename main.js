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
    , nickMatch = new RegExp(config.nick, "gi")
    , channel = config.channels[0]
  /* HTTP Stuff */
    , gitReceive = http.createServer()
    , shortServer = config.shortener.host
    ;

  /**
   *
   * Prevent Crashes! (sometimes github sends bad data)
   *
   */

  process.on('uncaughtException', function(err) {
    ircClient.say(channel,
      irc.colors.wrap("Caught an exception just before I crashed. Please check my log and fix me."));
    console.err(err);
  });


  /* IRC Stuff */  
  ircClient.addListener('message' + config.channels[0], function(user, message) {
    var messageArray
      , userToSpam
      , spamMessage
      ;
    console.log(user + ' => ' + message);

    if(nickMatch.test(message)) {
      ircClient.say(config.channels[0], "I'm a hippopotamus!");
    }

  });

  /* http stuff */

  function getShortLink(longLink, cb) {
    var sendData = JSON.stringify({ target: longLink })
      , reqOps = {
          host: shortServer
        , port: 80
        , path: '/shorten'
        , method: 'POST'
        , headers: {
              "Content-type": 'application/json'
            , "Content-length": sendData.length
          }
        }
      , req = http.request(reqOps, function(res) {
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
        })
      ;
    
    req.write(sendData);
    req.end();
  }

  gitReceive.on('request', function(req,res) {
    var rawData = ''
      , data
      ;

    req.setEncoding('utf8');

    req.on('data', function(chunk) {
      if(!chunk) {
        console.log('Empty data from github...');
        return;
      }
      rawData += decodeURIComponent(chunk.replace(/^payload=/, ''));
    });

    req.on('end', function() {
      res.end('Thanks!');
      data = JSON.parse(rawData);
      data.commits.forEach(function(commit, index) {
        var link
          ;

        if(commit.message.length > maxCommitMsg) {
          commit.message = commit.message.substring(0, maxCommitMsg)
          + '[...]';
        }

        getShortLink(commit.url, function(shortLink) {

          ircClient.say(config.channels[0],
            irc.colors.wrap('magenta', data.repository.name)
            + '|' 
            + irc.colors.wrap('light_cyan', commit.committer.username)
            + ': '
            + commit.message
            + irc.colors.wrap('magenta', ' >> ')
            + irc.colors.wrap('light_green', shortLink)
          );

        });
      });
    });

  });
  gitReceive.listen(config.gitPostPort);

}());
