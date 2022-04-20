//Installing middleware
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

//CORS used to define which domains are allowed access
const cors = require('cors');
app.use(cors());

//Importing the authorization file auth.js
let auth = require('./auth')(app);
require('./passport');

//Installing mongoose data models from models.js
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

     //Connecting to MongoDB locally
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
     //Connecting to MongoAtlas via Heroku-defined variable CONNECTION_URI
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
     //Connecting to MongoAtlas directly
//mongoose.connect('mongodb+srv://<username>:<password>@cluster0.7nexe.mongodb.net/myFlixDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

//Express Validator for user registration validation
const { check, validationResult } = require('express-validator');

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
app.post('/users', 

  //User input validation
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ]

,(req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({Username: req.body.Username}).then((user)=>{
    if(user){return res.status(400).send(req.body.Username + 'already exists');}
    else{
      Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
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
app.put('/users/:Username',   

  //User input validation
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  
  passport.authenticate('jwt', { session: false }), (req, res) => {

      // check the validation object for errors
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

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

//Location the server is listening on
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
