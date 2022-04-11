const express = require('express'),
    morgan = require('morgan');
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    passport = require('passport');
  
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Morgan used for logging info on server requests
app.use(morgan('common'));

//Importing the authorization file auth.js
let auth = require('./auth')(app);
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Welcome to my movie list!');
});

app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});

// Gets the list of data about ALL movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Gets the data about a single movie, by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({Title: req.params.Title})
  .then((movie) => {
    res.status(201).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Gets the data about a single genre, by name
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({'Genre.Name': req.params.Name})
  .then((movie) => {
    let genre = movie.Genre;
    res.status(201).json(genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Gets the data about a single director, by name
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({'Director.Name': req.params.Name})
  .then((movie) => {
    let director = movie.Director;
    res.status(201).json(director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Registers a new user
app.post('/users', (req, res) => {
  Users.findOne({Username: req.body.Username}).then((user)=>{
    if(user){return res.status(400).send(req.body.Username + 'already exists');}
    else{
      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
    .then((user)=>{res.status(201).json(user)})
    .catch((error)=>{
      console.error(error);
      res.status(500).send('Error' + error);
    })
    }
  })
.catch((error)=>{
  console.error(error);
  res.status(500).send('Error' + error);
});

});

// Allows a user to update their information
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username},
    {$set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    {new:true},
    (err, updatedUser)=>{
        if(err){
          console.error(err);
          res.status(500).send('Error' + err);
        }else{
          res.json(updatedUser);
        }
  });
});

// Adds a movie to a favorite list
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username},
    {$addToSet:
      {FavoriteMovies: req.params.MovieID}
    },
    {new:true},
    (err, updatedUser)=>{
        if(err){
          console.error(err);
          res.status(500).send('Error' + err);
        }else{
          res.json(updatedUser);
        }
  });
});

// Deletes a movie to a favorite list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username},
    {$pull:
      {FavoriteMovies: req.params.MovieID}
    },
    {new:true},
    (err, updatedUser)=>{
        if(err){
          console.error(err);
          res.status(500).send('Error' + err);
        }else{
          res.json(updatedUser);
        }
  });
});

// Deregisters a user
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Printing errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
