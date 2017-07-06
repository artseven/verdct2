//dependencies
var express           = require('express');
var path              = require('path');
var favicon           = require('serve-favicon');
var logger            = require('morgan');
var cookieParser      = require('cookie-parser');
var bodyParser        = require('body-parser');
var passport          = require('passport');
var configAuth        = require('./config/auth');
var flash             = require('connect-flash');
var AWS               = require('aws-sdk');
var session           = require('express-session');

//Passport strategies
var LocalStrategy     = require('passport-local').Strategy;
var FacebookStrategy  = require('passport-facebook').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;

//database and models
var db         = require('./models/db');
// var user = require('./models/user');
var event      = require('./models/event');
var dress      = require('./models/dress');
var savedEvent = require('./models/savedEvent');
var Account    = require('./models/account');

//controllers
var mainController        = require('./routes/mainController');
var usersController       = require('./routes/api/usersController');
var eventsController      = require('./routes/api/eventsController');
var dressesController     = require('./routes/api/dressesController');
var savedEventsController = require('./routes/api/savedEventsController');

//app
var app = express();


// Contains passport and our strategies)
require('./config/passport.js');

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}) );

// Middleware to display message to users
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
//If logged in, req.user for all views
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//--------------------routing-----------------------//
app.use('/', mainController);                       //
app.use('/api/users', usersController);             //
app.use('/api/events', eventsController);           //
app.use('/api/dresses', dressesController);         //
app.use('/api/savedEvents', savedEventsController); //
//---------------------------------------------------
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
