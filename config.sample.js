module.exports = {
    server: 'some_neat_server'
  , nick: 'your_bot_nickname'
  , channels: ['#the_channel_you_want_to_post_to']
  , port: 6697
  , secure: true
  , selfSigned: true
  , floodProtectionDelay: 250
  , password: 'some_awesome_password'
  , shortener: {
        host: '0hr.co'
    }
  , gitPostPort: 63000
  , gv: {
        email: 'gv-login@gmail.com' // required
      , password: 'that_password_for_the_email_above' // required
      , rnr_se: 'a google voice identifier obtained by running `document.getElementsByName("_rnr_se"[0]` in a js console on a google voice page.' // required...
    }
  , dbName: 'channelUsers'
}
