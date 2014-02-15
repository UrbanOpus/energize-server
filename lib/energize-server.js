var express = require('express');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var mongoose = require('mongoose');
var config = require(__dirname + '/config/config.js');
var path = require('path');


var users = [
    { id: 1, username: 'bob', token: '123456789', email: 'bob@example.com' }
  , { id: 2, username: 'joe', token: 'abcdefghi', email: 'joe@example.com' }
];

function findByToken(token, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.token === token) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
  { passReqToCallback: true },
  function(req, accessToken, done) {
    db.accessTokens.find(accessToken, function(err, token) {
      if (err) { return done(err); }
      if (!token) { return done(null, false); }

      db.users.find(token.userID, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        // to keep this example simple, restricted scopes are not implemented,
        // and this is just for illustrative purposes
        var info = { scope: '*' }
        done(null, user, info);
      });
    });
  }
));

var server = express();
server.set('port', process.env.PORT || config.express_port);
server.set('view options', { layout: false });
server.use(express.logger());
server.use(express.bodyParser());
//server.use(express.methodOverride());
server.use(passport.initialize());
server.use(server.router);

server.configure('development', function() {
    server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
server.configure('production', function() {
    server.use(express.errorHandler());
});

//var Account = require(__dirname +'/models/account');



mongoose.connect(config.mongo_url);
require(__dirname +'/routes/routes')(server, passport);
server.listen(server.get('port'), function() {
    console.log(("Express server listening on port " + server.get('port')));
});