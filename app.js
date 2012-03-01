var express = require('express'),
    app = express.createServer();

app.configure('development', function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function (req, res) {
  res.render('index', {
    data: [
      { name: 1, slug: 1 },
      { name: 2, slug: 2 },
      { name: 3, slug: 3 },
      { name: 4, slug: 4 }
    ]
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Started on %d', app.address().port);
});