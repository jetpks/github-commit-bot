(function() {
  "use strict";

  //TODO seperate this out into several different files...

  /* Requires */
  var irc = require('irc')
    , http = require('http')
    , gv = require('google-voice')
    , sqlite3 = require('sqlite3')
    , githook = require('./lib/githook.js')
  /* HTTP Stuff */
    , gitReceive = http.createServer()
    , shortServer = config.shortener.host
    , db = require('./lib/db.js')
  /* gv stuff */
    , gvClient = new gv.Client({
          email: config.gv.email
        , password: config.gv.password
        , rnr_se: config.gv.rnr_se
      })
    ;

  /**
   *
   * Prevent Crashes!
   *
   */

  process.on('uncaughtException', function(err) {
    ircClient.say(channel,
      irc.colors.wrap('dark_red', "Caught an exception just before I crashed. Please check my log and fix me."));
    console.error(err);
  });


  /* IRC Stuff */  
  ircClient.addListener('message', function(user, channel, message) {
    console.log(user + ' => ' + message);

    if(nickMatch.test(message) && / register /.test(message)) {
      registerUser(user, message.split(' '));      
    }

    if(nickMatch.test(message)) {
      ircClient.say(config.channels[0], "I'm a hippopotamus!");
    }

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

  function speak(channel, message, color) {
    if(color) {
      message = irc.colors.wrap(color, message);
    }

    ircClient.say(channel, message);
  }

  /* http stuff */
  githook.on('push', function(data) {
    speak(data);
  });

}());
