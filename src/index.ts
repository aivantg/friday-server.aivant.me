import { exit } from 'process';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv-safe';

// Set up environment variables
dotenv.config();
const port = process.env.PORT || 3000;
const SECRET = process.env.SECRET || '';

// SECRET must be non-empty
if (SECRET === '') {
  console.log('FATAL ERROR: env variable `SECRET` must be set and non-empty.');
  exit(1);
}

// TODO: Set up scheduler, re-schedule all unfinished jobs in database (future endDate || no endDate and past startDate)

// Set up express app with middleware to process body params and check secret
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  let secret = req.body.secret;

  if (
    (req.path === '/' && req.method === 'GET') ||
    req.path === '/_next/webpack-hmr' || // Special case
    secret === SECRET
  ) {
    next();
  } else {
    console.log(`Recieved unauthorized request at '${req.path}'. Body:`);
    console.log(req.body);
    res.send(401);
  }
});

// Shows all routes
app.get('/', (req, res) => {
  let response =
    'Welcome to the Friday Scheduling server. Available Routes:<br/>';
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      Object.keys(r.route.methods).forEach((m) => {
        response += m.toUpperCase() + ' ' + r.route.path + ' <br/>';
      });
    }
  });
  res.send(response);
});

// TODO: routes

// Create new job and schedule it in scheduler. Returns Job ID
app.post('/schedule', (req, res) => {});

// Cancel job given ID. Remove from scheduler and mark canceled in db
app.post('/cancel', (req, res) => {});

// List all scheduled jobs
app.get('/jobs', (req, res) => {});

app.listen(port, () =>
  console.log(`Friday scheduling app listening on port ${port}!`)
);
