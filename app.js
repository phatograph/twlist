var express = require('express'),
    app = express.createServer();

app.configure('development', function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(express.static(__dirname + '/public'));
});

var OAuth = require('./node-oauth').OAuth,
    oAuth = new OAuth("http://twitter.com/oauth/request_token",
                 "http://twitter.com/oauth/access_token", 
                 'UqGXXq5K3yt8kTE0kdyq3g',
                 'VMjJCf9pAIubBFdIJE8Kdh4NMh3xqv9qZGODh8pvIPc', 
                 "1.0A",
                 null,
                 "HMAC-SHA1"),
    accessToken, // 47032387-5pUsKx4k3f00O6FjhbzMDxiluhLdyDHYDEJzatm3Y
    accessTokenSecret, // ITlIYEyr48IBNTVb5hD6Jp1vEwNuDgbesu2H9THAjLc
    getAllLists = function (callback) {
      oAuth.get('https://api.twitter.com/1/lists.json?screen_name=phatograph',
               accessToken,
               accessTokenSecret,
               callback);
      };

app.get('/', function (req, res) {
  getAllLists(function (error, data) {
    if(error) {
      console.log(require('sys').inspect(error));
    }
    else {
      data = JSON.parse(data);
      res.render('index', {
        data: data.lists
      });
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Started on %d', app.address().port);
});