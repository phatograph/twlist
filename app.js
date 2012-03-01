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
    oauthToken,
    oauthTokenSecret,
    getAllLists = function (callback) {
      oAuth.get('https://api.twitter.com/1/lists.json?screen_name=phatograph',
               accessToken,
               accessTokenSecret,
               callback);
      },      
    getAllMembersInList = function (slug, callback) {
     oAuth.get('https://api.twitter.com/1/lists/members.json?slug=' + slug + '&owner_screen_name=phatograph&cursor=-1',
               accessToken,
               accessTokenSecret,
               callback);
    },
    followingIds,
    inListIds = [];

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

app.get('/auth', function (req, res) {
  oAuth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if (error) {
      console.log(error)
      res.send('oops ..');
    }
    else {
      oauthToken = oauth_token;
      oauthTokenSecret = oauth_token_secret;
      res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token)
     }
  });
});

app.get('/oauth_callback', function (req, res, next) {    
  oAuth.getOAuthAccessToken(oauthToken, oauthTokenSecret, req.query.oauth_verifier, 
    function (error, oauth_access_token, oauth_access_token_secret, results) {
      if (error) {
        console.log(error)
        res.send('oops ..');
      }
      else {
        accessToken = oauth_access_token;
        accessTokenSecret = oauth_access_token_secret;
        res.redirect('/');
      }
    });
});

app.get('/list/:slug', function (req, res) {
  followingIds = null,
  inListIds = [];
  
  res.render('list', {
    slug: req.params['slug']
  });
});

app.get('/getAllMembersInList/:slug', function (req, res) {
  getAllMembersInList(req.params['slug'], function(error, data) {
    data = JSON.parse(data);
    res.send({
      users: data.users
    });
  });
});

app.get('/removeMembersFromList/:id', function (req, res) {
  oAuth.post('https://api.twitter.com/1/lists/members/destroy.json',
    accessToken,
    accessTokenSecret,
    {
      'owner_screen_name': 'phatograph',
      'slug': 'footballer',
      'user_id': req.params['id']
    },
    function(error, data) {
      var flag = true;
      if(error) {
        console.log(require('sys').inspect(error));
        flag = false;
      }
      res.send({
        status: flag
      });
    });
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Started on %d', app.address().port);
});