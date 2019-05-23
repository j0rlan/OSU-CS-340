var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');
var mysql = require('./dbcon.js');

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 5943);

app.get('/', function(req, res){
   res.render('home');
});

app.get('/browse', function(req, res){
   res.render('browse');
});

app.post("/browse", function(req, res) {
   var context = {};
   if (req.body.init) {
      var query = "SELECT a.id, title AS Title, group_concat(concat(artist.first_name, ' ', artist.last_name)) AS Artist, concat(c.city, ', ' , c.country) AS Origin, ";
      query += "date_completed, wing_name,";
      query += "m.medium_name AS 'Medium', style.style_name AS 'Style' FROM museum_art_piece a ";
      query += "INNER JOIN museum_style_work sw ON sw.work = a.id "; 
      query += "INNER JOIN museum_medium_work mw ON mw.work = a.id ";
      query += "INNER JOIN museum_artist_work aw ON aw.work = a.id ";
      query += "INNER JOIN museum_artist artist ON artist.artist_id = aw.artist ";
      query += "INNER JOIN museum_style style ON style.style_name = sw.style ";
      query += "INNER JOIN museum_medium m ON m.medium_name = mw.medium "; 
      query += "INNER JOIN museum_city c ON c.city_id = a.city GROUP BY a.id"; 
      mysql.pool.query(query, function(err, rows, fields) {
         if (err) {
            res.write(JSON.stringify(err));
            res.end();
         }
         else{
            context.works = rows;
            res.json(context.works);
         }
      });
   }
});

app.get("/addArtwork", function(req, res){
   var context = {};
   var wingQuery = "SELECT name FROM museum_wing";
   res.render('addArtwork', context);
});

app.post('/addArtwork', function(req, res){
   if (req.body.artists) {
      var query = "SELECT first_name, last_name FROM museum_artist";
      var context = {};
      context.results = {};
      mysql.pool.query(query, function(err, rows, fields){
         if (err) {
            res.write(JSON.stringify(err));
            res.end();
         }
         else {
            context.results.artists = rows;
            query = "SELECT medium_name FROM museum_medium";
            mysql.pool.query(query, function(err, rows, fields){
               if (err) {
                  res.write(JSON.stringify(err));
                  res.end();
               }
               else {
                  context.results.mediums = rows;
                  query = "SELECT style_name FROM museum_style";
                  mysql.pool.query(query, function(err, rows, fields){
                     if (err) {
                        res.write(JSON.stringify(err));
                        res.end();
                     }
                     else {
                        context.results.styles = rows;
                        query = "SELECT name FROM museum_wing";
                        mysql.pool.query(query, function(err, rows, fields){
                           if (err) {
                              res.write(JSON.stringify(err));
                              res.end();
                           }
                           else {
                              context.results.wings = rows;
                              res.json(context.results);
                           }
                        });
                     }
                  });
               }
            });
         }
      });
   }
});

app.get('/wings', function(req, res){
   var context = {};
   var query = "SELECT name, open_time, close_time FROM museum_wing";
   mysql.pool.query(query, function(error, results, fields){
      if(error){
         res.write(JSON.stringify(error));
         res.end();
      }
      else {
         context.wings = results;
         res.render('wings', context);
      }
   });
});

app.post('/wings', function(req, res){
   if(req.body.add) {
      var wing_name = req.body.name;
      var	open_time = req.body.open_time;
      var	close_time = req.body.close_time;
      var query = "INSERT INTO museum_wing (\`name\`, \`open_time\`, \`close_time\`) VALUES ('" + wing_name + "', '" + open_time + "', '" + close_time + "')";
      mysql.pool.query(query, function(err, result){
         if(err){
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
      });
   }

   if(req.body.init){
      var query = "SELECT name as id, name, open_time, close_time FROM museum_wing";
      mysql.pool.query(query, function(err, rows, fields) {
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
         else {
            var context = {};
            context.artists = rows;
            res.json(rows);
         }
      });
   }
});

app.get('/artists', function(req, res){
   res.render('artists');
});

app.post('/artists', function(req, res){
   console.log(req.body);

   if(req.body.add){
      var fname = req.body.fname;
      var lname = req.body.lname;
      var born = req.body.born;
      var died = req.body.died;
      var bio = req.body.bio;
      var params = [fname, lname, born, died, bio];
      var query = "INSERT INTO museum_artist (\`first_name\`, \`last_name\`, \`born\`, \`died\`, \`bio\`) VALUES (?, ?, ?, ?, ?)";
      mysql.pool.query(query, params, function(err, result){
         if (err){
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
      });
   }

   if(req.body.init){
      var query = "SELECT artist_id as id, first_name, last_name, born, died, bio FROM museum_artist";
      mysql.pool.query(query, function(err, rows, fields) {
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
         else {
            for (e of rows) {
               let born = new Date(e.born);
               e.born = (born.getUTCFullYear() + "-" + (born.getUTCMonth()+1) + "-" + born.getUTCDate());
               let died = new Date(e.died);
               e.died = (died.getUTCFullYear() + "-" + (died.getUTCMonth()+1) + "-" + died.getUTCDate());
            }
            var context = {};
            context.artists = rows;
            res.json(rows);
         }
      });
   }

});

app.get('/mediums', function(req, res){
         res.render('mediums');
});

app.get('/styles', function(req, res){
   var context = {};
   var query = "SELECT style_name, description FROM museum_style";
   mysql.pool.query(query, function(error, results, fields){
      if(error){
         res.write(JSON.stringify(error));
         res.end();
      }
      else {
         context.styles = results;
         res.render('styles', context);
      }
   });
});

app.post('/styles', function(req, res){
   console.log(req.body);
   var name = req.body.name,
   description = req.body.description;
var query = "INSERT INTO museum_style (\`style_name\`, \`description\`) VALUES ('" + name + "', '" + description + 
   "')";
mysql.pool.query(query, function(err, result){
   if(err){
      console.log(query);
      res.write(JSON.stringify(err));
      res.end();
   }	
});
});

app.post('/mediums', function(req, res){
   if (req.body.add){
      console.log(req.body.description);
      var name = req.body.name;
      var description = req.body.description;	
      var query = "INSERT INTO museum_medium (\`medium_name\`, \`description\`) VALUES ('" + name + "', '" + description + "')";
      mysql.pool.query(query, function(err, result){
         if(err){
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
         else {
            console.log(query);
         }
      });
   }

   if(req.body.init){
      var query = "SELECT medium_name as id, medium_name, description FROM museum_medium";
      mysql.pool.query(query, function(err, rows, fields) {
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
         else {
            var context = {};
            res.json(rows);
         }
      });
   }
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
