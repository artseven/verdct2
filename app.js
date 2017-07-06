//dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;
var configAuth = require('./config/auth');
var flash = require('connect-flash');
var AWS = require('aws-sdk');

//database and models
var db = require('./models/db');
// var user = require('./models/user');
var event = require('./models/event');
var dress = require('./models/dress');
var savedEvent = require('./models/savedEvent');

//controllers
var mainController = require('./routes/mainController');
var usersController = require('./routes/api/usersController');
var eventsController = require('./routes/api/eventsController');
var dressesController = require('./routes/api/dressesController');
var savedEventsController = require('./routes/api/savedEventsController');

//app
var app = express();

// Tell node to run the code contained in this file
// (this sets up passport and our strategies)
require('./config/passport.js');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());

// passport config
var Account = require('./models/account');
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
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//routing
app.use('/', mainController);
app.use('/api/users', usersController);
app.use('/api/events', eventsController);
app.use('/api/dresses', dressesController);
app.use('/api/savedEvents', savedEventsController);

//AWS config
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-2'
});

// var S3 = new AWS.S3();


//error handling
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//
module.exports = app;
