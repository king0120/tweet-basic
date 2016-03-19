var morgan  = require('morgan');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var port    = process.env.PORT || 3000;
var router  = express.Router();

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(morgan('dev'));

// app.use(function(req, res, next) {
//   console.log('%s request to %s from %s', req.method, req.path, req.ip);
//   next();
// });

// app.get('/', function(req, res) {
//     res.render('index');
// });

// INTEGRATE SOCKET
var io = require('socket.io')(server);
var Twit    = require('twit');

var twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var stream = twitter.stream('statuses/filter', { track: 'javascript'});

io.on('connect', function(socket) {
  stream.on('tweet', function (tweet) {
  var data = {};
    data.name = tweet.user.name;
    data.screen_name = tweet.user.screen_name;
    data.text = tweet.text;
    data.user_profile_image = tweet.user.profile_image_url;
    socket.emit('tweets', data);
  });
});

// ROUTES
router.get('/', function(req, res) {
  res.render('index', { header: 'Twitter Search'});
});

router.get('/contact', function(req, res) {
  res.render('contact', { header: 'contact!'});
});

router.get('/about', function(req, res) {
  res.render('about', { header: 'about!'});
});

app.use('/', router);
server.listen(port);

console.log('Server started on ' + port);
