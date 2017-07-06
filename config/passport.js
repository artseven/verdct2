var InstagramStrategy = require('passport-instagram').Strategy;
var LocalStrategy     = require('passport-local').Strategy;
var passport          = require('passport');
var FacebookStrategy  = require('passport-facebook').Strategy;
var Account           = require('../models/account');
var configAuth        = require('./auth');


// What is saved in the session
passport.serializeUser(function(Account, done) {
  done(null, Account);
});

passport.deserializeUser(function(Account, done) {
  done(null, Account);
});


passport.use(new LocalStrategy(Account.authenticate()));

passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'email', 'first_name', 'last_name'],
  },
  function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      Account.findOne({ 'facebook.id': profile.id }, function(err, account) {
        if (err)
          return done(err);
        if (account) {
          return done(null, account);
        } else {
          var newAccount = new Account();
          newAccount.facebook.id = profile.id;
          newAccount.facebook.token = token;
          newAccount.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newAccount.facebook.email = (profile.emails[0].value || '').toLowerCase();
          newAccount.email = newAccount.facebook.email;
          newAccount.username = newAccount.facebook.name;
          newAccount.save(function(err) {
            if (err)
              throw err;
            return done(null, newAccount);
          });
        }
      });
    });
  }));

// Instagram Strategy
passport.use(new InstagramStrategy({
    clientID: configAuth.instagramAuth.clientID,
    clientSecret: configAuth.instagramAuth.clientSecret,
    redirectURI: configAuth.instagramAuth.redirectURI
  },
  function(accesstoken, refreshToken, profile, done) {
    Account.findOne( { 'instagram.id': profile.id}, function(err, account) {
      if (err)
        return done(err);
      if (account) {
        return done(null, account);
      } else {
        var newAccount = new Account();
        newAccount.instagram.id = profile.id;
        newAccount.instagram.token = token;
        newAccount.instagram.name = profile.name.givenName + ' ' + profile.name.familyName;
        newAccount.save(function(err) {
          if (err)
            throw err;
          return done(null, newAccount);
        });
      }
    });
}));

// passport.use(new LocalStrategy(
//   // 1st arg -> options to customize LocalStrategy
//   {
//     // <input name="loginUsername">
//     usernameField: 'username',
//     // <input name="loginPassword">
//     passwordField: 'password'
//   },
//
//   // 2nd arg -> callback for the logic that validates the login
//   (username, password, next) =>{
//     Account.findOne(
//       { username: username},
//         (err, theUser) => {
//           //  Tell passport if there was an error(nothing we can do)
//           if (err) {
//            next(err);
//            return;
//           }
//           // Tell passport if there is no user with given username
//           if(!theUser) {
//           //          false in 2nd arg means "Log in failed!"
//           //            |
//            next(null, false, { message: 'Wrong username'});
//            return;
//           }
//           // Tell passport if the passwords don't match
//           if ( loginPassword != req.user.password ) {
//             // false means "Log in failed!"
//             next(null, false, { message: 'Wrong password'});
//             return;
//           }
//           // Give passport the user's details
//           next(null, theUser, { message: `Login for ${theUser.username} successful`});
//           //  -> this user goes to passport.serializeUser()
//         }
//     );
//   }
// ));
