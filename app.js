process.env.NODE_ENV='development';
// set NODE_PATH=.
var express = require('express');
var path = require('path');
var http = require('http');
var config = require('config');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler')();
var favicon = require('serve-favicon');
var log = require('libs/log')(module);
var HttpError = require('error').HttpError;
var mongoose = require('libs/mongoose');
var session = require('express-session');



var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser());
app.use(cookieParser());

const MongoStore = require('connect-mongo')(session);
app.use(session({
  secret: config.get('session:secret'), // ABCDE242342342314123421.SHA256
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  resave: false,          //Неуверен в установленном значении, подробнее 
  saveUninitialized: true // https://github.com/expressjs/session#options
}));

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));

require('routes')(app);

app.use(express.static(path.join(__dirname, 'public')));


/*
app.use(function(req, res, next) {
  req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
  res.send("Visits: " + req.session.numberOfVisits);
});
*/


app.use(function(err, req, res, next) {
  if (typeof err == 'number') { // next(404);
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') == 'development') {
      errorHandler(err, req, res, next);
    } else {
      log.error(err);
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});


http.createServer(app).listen(config.get('port'), function(){
  log.info('Express server listening on port ' + config.get('port'));
});
