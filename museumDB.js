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
app.set('port', 5944);

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

   if (req.body.edit) {
      console.log("edit");
      res.render('browse');
   }

   if (req.body.del) {
      console.log("delete");
      console.log(req.body);
      var params = [Number(req.body.del)];
      var query = "DELETE from museum_art_piece WHERE id = ?;";
      mysql.pool.query(query, params, function(err, result) {
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
         else {
            res.render('browse');
         }
      });
   }
});

app.get("/addArtwork", function(req, res){
   res.render('addArtwork');
});

app.post('/addArtwork', function(req, res){
   if (req.body.add) {
      // FIXME
      // what to do with request
      var cityQuery = "INSERT IGNORE INTO museum_city (`city`, `country`) ";
      cityQuery += "VALUES (?, ?)";
      var cityParameters = [req.body.city, req.body.country];
      mysql.pool.query(cityQuery, cityParameters, function(err, result){
         if(err){
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
         else {
            var cityIdQuery = "SELECT city_id FROM museum_city c WHERE c.city = '" + req.body.city + "' AND c.country = '" + req.body.country + "'";
            mysql.pool.query(cityIdQuery, function(err, result1){
               if(err){
                  console.log(err);
                  res.write(JSON.stringify(err));	
                  res.end();
               }
               else {
                  console.log("Getting city");
                  console.log(result1[0].city_id);
                  var query = "INSERT INTO museum_art_piece (`title`, `city`, `date_completed`, `description`, `wing_name`) VALUES (?,?,?,?,?)";
                  var parameters = [(req.body.title ? req.body.title : "untitled"), result1[0].city_id, req.body.date, req.body.description, req.body.wing];
                  mysql.pool.query(query, parameters, function(err, result2){
                     if(err){
                        console.log(err);
                        res.write(JSON.stringify(err));
                        res.end();
                     }
                     else{
                        console.log("Getting work id");
                        var workIdQuery = "SELECT id FROM museum_art_piece WHERE `title` = ?";
                        mysql.pool.query(workIdQuery, [parameters[0]], function(err, result3){
                           if(err){
                              console.log(err);
                              res.write(JSON.stringify(err));
                              res.end();
                           }
                           else {
                              insertMedium(req.body.medium, result3[0].id);
                              insertStyle(req.body.style, result3[0].id);
                              var artistName = req.body.artist.split(" ");
                              console.log(artistName);
                              artistParams = [artistName[0] ? artistName[0] : "unknown", artistName[1] ? artistName[1] : " "];
                              mysql.pool.query("INSERT IGNORE INTO museum_artist (first_name, last_name) VALUES (?, ?)", artistParams, function(err, result) {
                                 var artistIdQuery = "SELECT artist_id FROM museum_artist WHERE `first_name` = ? and last_name = ?";
                                 mysql.pool.query(artistIdQuery, artistParams, function(err, result4){
                                    if(err){
                                       console.log(err);
                                       res.write(JSON.stringify(err));
                                       res.end();
                                    }
                                    else {
                                       insertArtist(result4[0].artist_id, result3[0].id);
                                       var context = {};	
                                       context.response = "success";  
                                       res.json(context);
                                    }
                                 });
                              });
                           }
                        });
                     }
                  });
               }
            });
         }

      });


   }

   if (req.body.init) {
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

function getWorkId(title){
   var workIdQuery = "SELECT `id` FROM museum_art_piece WHERE `title` = '";
   workIdQuery += title + "'";
   mysql.pool.query(workIdQuery, function(err, result){
      if(err){
         console.log(err);
      }
      else {
         console.log("work id is result[0].id");
         return result[0].id;
      }
   });
};

function insertMedium(medium, work_id){
   mysql.pool.query("INSERT IGNORE INTO museum_medium (medium_name) VALUES (?)", [medium], function(err, result){
      var mediumIdQuery = "INSERT INTO museum_medium_work (`medium`, `work`) ";
      mediumIdQuery += "VALUES (?,?)";
      var wkparams = [medium, work_id];
      mysql.pool.query(mediumIdQuery, wkparams, function(err, result){
         if(err){
            console.log(err);
         }
      });
   });
}

function insertStyle(style, work_id){
   mysql.pool.query("INSERT IGNORE INTO museum_style (style_name) VALUES (?)", [style], function(err, result) {
      var insertStyleQuery = "INSERT INTO museum_style_work (`style`, `work`)";
      insertStyleQuery += " VALUES (?, ?)";
      var wkparams = [style, work_id];
      mysql.pool.query(insertStyleQuery, wkparams, function(err, result){
         if(err){
            console.log(err);
         }
      });
   });
}

function insertArtist(artist, work_id){
   var insertArtistQuery = "INSERT INTO museum_artist_work (`artist`, `work`)";
   insertArtistQuery += " VALUES (?, ?)";
   var wkparams = [artist, work_id];
   mysql.pool.query(insertArtistQuery, wkparams, function(err, result){
      if(err){
         console.log(err);
      }
   });
}

app.get('/wings', function(req, res){
   res.render('wings');
});

app.post('/wings', function(req, res){
   if(req.body.edit){
      var query = "UPDATE museum_wing SET name = ?, open_time = CONVERT(?, TIME), close_time = CONVERT(?, TIME) WHERE name = ?;";
      var params = [req.body.name, req.body.open, req.body.close, req.body.edit];
      mysql.pool.query(query, params, function(err, result){
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
            res.render('wings');
         }
         else {
            res.render('wings');
         }
      });

   }

   if(req.body.del){
      var query = "DELETE from museum_wing WHERE name = ?";
      var params = [req.body.del];
      mysql.pool.query(query, params, function(err, result){
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
            res.render('wings');
         }
         else {
            res.render('wings');
         }
      });
   }
   if(req.body.add) {
      var params = [req.body.name, req.body.open, req.body.close];
      var query = "INSERT INTO museum_wing (\`name\`, \`open_time\`, \`close_time\`) VALUES (?, CONVERT(?, TIME), CONVERT(?, TIME))";
      mysql.pool.query(query, params, function(err, result){
         if(err){
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
         else {
            res.render('wings');
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
   if(req.body.edit){
      var query = "UPDATE museum_artist SET first_name = ?, last_name = ?, born = CONVERT(?, DATE), died = CONVERT(?, DATE), bio = ? WHERE artist_id = ?;";
      var params = [req.body.fname, req.body.lname, req.body.born, req.body.died, req.body.bio, Number(req.body.edit)];
      mysql.pool.query(query, params, function(err, rows, fields){
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
         }
         else {
            res.render('artists');
         }
      });
   }

   if(req.body.del){
      var query = "DELETE from museum_artist WHERE artist_id = ?";
      var params = [Number(req.body.del)];
      mysql.pool.query(query, params, function(err, result){
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
         }
         else {
            res.render('artists');
         }
      });
   }

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
         }
         else {
            res.render('artists');
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
               e.born = ((born.getUTCMonth()+1) + "/" + born.getUTCDate() + "/" + born.getUTCFullYear());
               let died = new Date(e.died);
               e.died = ((died.getUTCMonth()+1) + "/" + died.getUTCDate() + "/" + died.getUTCFullYear());
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
   res.render('styles');
});

app.post('/styles', function(req, res){
   if(req.body.edit){
      var params = [req.body.name, req.body.description, req.body.edit];
      var query = "UPDATE museum_style SET style_name = ?, description = ? WHERE style_name = ?";
      mysql.pool.query(query, params, function(err, rows, fields){
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
         }
         else {
            res.render('styles');
         }
      });

   }

   if(req.body.del){
      var query = "DELETE from museum_style WHERE style_name = ?";
      var params = [req.body.del];
      mysql.pool.query(query, params, function(err, result){
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
         }
         else {
            res.render('styles');
         }
      });
   }
   if (req.body.add){
      var params = [req.body.name, req.body.description];
      var query = "INSERT INTO museum_style (\`style_name\`, \`description\`) VALUES (?, ?);";
      mysql.pool.query(query, params, function(err, result){
         if(err){
            res.write(JSON.stringify(err));
            res.end();
         }	
         else {
            res.render('styles');
         }
      });
   }


   if(req.body.init){
      var query = "SELECT style_name as id, style_name, description FROM museum_style";
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

app.post('/mediums', function(req, res){
   if(req.body.edit){
      var query = "UPDATE museum_medium SET medium_name = ?, description = ? WHERE medium_name = ?;";
      var params = [req.body.name, req.body.description, req.body.edit];
      mysql.pool.query(query, params, function(err, rows, fields){
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
         }
         else {
            res.render('mediums');
         }
      });

   }

   if(req.body.del){
      var query = "DELETE from museum_medium WHERE medium_name = ?";
      var params = [req.body.del];
      mysql.pool.query(query, params, function(err, result){
         if (err) {
            console.log(err);
            res.write(JSON.stringify(err));
         }
         else {
            res.render('mediums');
         }
      });
   }
   if (req.body.add){
      var params = [req.body.name, req.body.description];
      var query = "INSERT INTO museum_medium (\`medium_name\`, \`description\`) VALUES (?, ?);";
      mysql.pool.query(query, params, function(err, result){
         if(err){
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
         }
         else {
            res.render('mediums');
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

function getCityId(city, country){
   var cityIdQuery = "SELECT city_id FROM museum_city c WHERE c.city ='" + city + "' AND c.country = '" + country + "'";
   mysql.pool.query(cityIdQuery, function(err, result){
      if(err){
         console.log(err);
         return NULL;
      }
      else{
         console.log(result[0].city_id);
         return (result[0].city_id);
      }
   });
}

app.listen(app.get('port'), function(){
   console.log('Express started on http://flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.'); });
