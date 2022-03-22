const express = require('express'),
    morgan = require('morgan');
    bodyParser = require('body-parser'),
    uuid = require('uuid');
  
  const app = express();
  app.use(bodyParser.json());


//Morgan used for logging info on server requests
app.use(morgan('common'));

let movies = [
    {
      title: 'Movie1',
      director: 'Director1'
    },
    {
        title: 'Movie2',
        director: 'Director2'
      },
      {
        title: 'Movie3',
        director: 'Director3'
      },
      {
        title: 'Movie4',
        director: 'Director4'
      },
      {
        title: 'Movie5',
        director: 'Director5'
      },
      {
        title: 'Movie6',
        director: 'Director6'
      },
      {
        title: 'Movie7',
        director: 'Director7'
      },
      {
        title: 'Movie8',
        director: 'Director8'
      },
      {
        title: 'Movie9',
        director: 'Director9'
      },
      {
        title: 'Movie10',
        director: 'Director10'
      }
  ];

let users = [
  {
    id = 1,
    name = test
  }
];


app.get('/', (req, res) => {
    res.send('Welcome to my movie list!');
});

app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});

// Gets the list of data about ALL movies
app.get('/movies', (req, res) => {
    res.json(movies);
});

// Gets the data about a single movie, by title
app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) =>
    { return movies.title === req.params.title }));
});

// Gets the data about a single genre, by name
app.get('/movies/genre/:name', (req, res) => {
  res.send('Successful GET request returning data about a genre')
});

// Gets the data about a single director, by name
app.get('/movies/directors/:name', (req, res) => {
  res.send('Successful GET request returning data about a director')
});

// Registers a new user
app.post('/users', (req, res) => {
  res.status(201).send('Successful POST returning the new user data')
});

// Allows a user to update their information
app.put('/users/:username', (req, res) => {
  res.status(201).send('Successful PUT returning the updated user data')
});

// Adds a movie to a favorite list
app.post('/users/:username/movies/:movieID', (req, res) => {
  res.status(201).send('Successful POST adding movie to favorite list')
});

// Deletes a movie to a favorite list
app.delete('/users/:username/movies/:movieID', (req, res) => {
  res.status(201).send('Successful DELETE movie from favorite list')
});

// Deregisters a user
app.delete('/users/:username', (req, res) => {
  res.status(201).send('Successful DELETE of registered user')
});

//Printing errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('*', (req, res) => {
    res.status(404).send('404 Page: route not found');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
