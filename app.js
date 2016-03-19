var morgan  = require('morgan');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var port    = process.env.PORT || 3000;
var router  = express.Router();

// Added bodyParser to process the post data
var bodyParser = require('body-parser');

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

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


//Make sure to put your own api info in here
var twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY || 'Code Here',
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET || 'Code Here'
,
  access_token: process.env.TWITTER_ACCESS_TOKEN ||   'Code Here'
,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || 'Code Here'
});

var stream = twitter.stream('statuses/filter', { track: 'drake'});


//function to switch the term that twit searches for
function newSearch(searchTerm){
  stream.stop();
  stream = twitter.stream('statuses/filter', { track: searchTerm});
  stream.start();
}

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


//Created a post for the form to send data serverside.
router.post('/', function(req, res){
  if (req.body.search){
    newSearch(req.body.search);
    res.render('index', { header: 'Twitter Search for ' + req.body.search});
  } else {
    res.render('index', { header: 'Something Went Wrong'});
  }
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
