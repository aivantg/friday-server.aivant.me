import { exit } from 'process';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv-safe';
// import SegfaultHandler from 'segfault-handler';

// Optionally specify a callback function for custom logging. This feature is currently only supported for Node.js >= v0.12 running on Linux.
// SegfaultHandler.registerHandler('crash.log', function (signal, address, stack) {
//   console.log('SEGFAULT');
//   console.log(signal);
//   console.log(address);
//   console.log(stack.join('\n'));
//   console.log('END SEFGAULT');
//   // Do what you want with the signal, address, or stack (array)
//   // This callback will execute before the signal is forwarded on.
// });

// Set up environment variables
dotenv.config();
const port = process.env.PORT || 3000;
const SECRET = process.env.SECRET || '';

// SECRET must be non-empty
if (SECRET === '') {
  console.log('FATAL ERROR: env variable `SECRET` must be set and non-empty.');
  exit(1);
}

// Set up express app with middleware to process body params and check secret
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  let secret = req.body.secret || req.query.secret;
  if (
    (req.path === '/' && req.method === 'GET') ||
    req.path === '/_next/webpack-hmr' || // Special case
    secret === SECRET
  ) {
    next();
  } else {
    console.log(`Recieved unauthorized request at '${req.path}'. Body:`);
    console.log(req.body);
    console.log('Query:');
    console.log(req.query);
    res.send(401);
  }
});

// Define services
const services = [
  require('./services/jobs'),
  // require('./services/notion'),
  require('./services/assistant'),
];
services.forEach((s) => {
  app.use(s.basePath, s.router);
});

// // Shows all routes
// app.get('/', (req, res) => {
//   let response = 'Welcome to the Friday backend server. Available Routes:<br/>';

//   // Look up all regular routes
//   app._router.stack.forEach((r) => {
//     if (r.route && r.route.path) {
//       Object.keys(r.route.methods).forEach((m) => {
//         response += m.toUpperCase() + ' ' + r.route.path + ' <br/>';
//       });
//     }
//   });

//   // Look up routes for each service
//   services.forEach((s) => {
//     s.router.stack.forEach((r) => {
//       if (r.route && r.route.path) {
//         Object.keys(r.route.methods).forEach((m) => {
//           response +=
//             m.toUpperCase() + ' ' + s.basePath + r.route.path + ' <br/>';
//         });
//       }
//     });
//   });

//   res.send(response);
// });

app.listen(port, () =>
  console.log(`Friday server app listening on port ${port}!`)
);
