var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 5942);

app.get('/', function(req, res){
   res.render('home');
});

app.get('/browse', function(req, res){
   res.render('browse');
});

app.get('/addArtwork', function(req, res){
   res.render('addArtwork');
});

app.get('/wings', function(req, res){
   res.render('wings');
});

app.get('/artists', function(req, res){
   res.render('artists');
});

app.get('/mediums', function(req, res){
   res.render('mediums');
});

app.get('/styles', function(req, res){
   res.render('styles');
});

app.use(function(req, res){
   res.status(404);
   res.render('404');
});

app.use(function(err, req, res, next){
   console.error(err.stack);
   res.type('plain/text');
   res.status(500);
   res.render('500');
});

app.listen(app.get('port'), function(){
   console.log('Express started on http://flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});
