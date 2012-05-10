(function() {
  "use strict";
  var irc = require('irc')
    , cfg = require('../config.js').irc
    , mainChan = cfg.channels[0]
    , client = new irc.Client(cfg.server, cfg.nick, {
          channels: cfg.channels
        , port: cfg.port
        , secure: cfg.secure
        , selfSigned: cfg.selfSigned
        , floodProtectionDelay: cfg.floodProtectionDelay
        , password: cfg.password
      })
    , nickMatch = new RegExp(cfg.nick, "gi")
    , commands = {}
    ;


  // http://readthedocs.org/docs/node-irc/en/latest/API.html#events
  client.on('message', function(user, channel, message) {
    console.log(user + ' => ' + message);

    if(nickMatch.test(message) && / register /.test(message)) {
      registerUser(user, message.split(' '));      
    }

    if(nickMatch.test(message)) {
      client.say(cfg.mainChan, "I'm a hippopotamus!");
    }

  });

  client.on('join', function(channel, nick, message) {

  });

  client.on('part', function(channel, nick, reason, message) {

  });

  client.on('quit', function(nick, reason, channels, message) {

  });


  function registerUser(nick, params) {
    var baseIdx = params.indexOf('register')
      , phone
      , email
      , sql = db.prepare()
      ;
    
    if(!params[baseIdx + 1] || params[baseIdx + 1].length != 10) {
      speak(nick, "Invalid phone number. 10 digits only.");
      showRegisterHelp();
      return;
    }

    if(!params[baseIdx + 2]) {
      speak(nick, "Email address required.");
      showRegisterHelp();
      return;
    }

    phone = params[baseIdx + 1];
    email = params[baseIdx + 2];

    console.log('nick:', nick, 'phone', phone, 'email', email);

    function showRegisterHelp() {
      speak(nick, "Syntax: /msg bert register <phone_number> <email_address>");
      speak(nick, "Example: /msg bert register 8015552039 some_email@some.tld");
    }
  }

  function speak(message, color, channel) {
    if(color) {
      message = irc.colors.wrap(color, message);
    }

    client.say(channel, message);
  }
}());
