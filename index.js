const express = require('express'),
    morgan = require('morgan');
const app = express();

//Morgan used for logging info on server requests
app.use(morgan('common'));

let topMovies = [
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


app.get('/', (req, res) => {
    res.send('Welcome to my movie list!');
});

app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
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