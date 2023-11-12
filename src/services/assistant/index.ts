import express from 'express';
import { exit } from 'process';
import { askAssistant, assistantRequestSchema } from './helpers/utils';

/**
 * This application is a layer over the OpenAI API to help take requests
 * and pass them to a different service
 *
 * Useful api documentation:
 * - https://platform.openai.com/docs/introduction
 */

const REQUIRED_ENV_VARS = ['OPENAI_API_KEY', 'NOTION_TOKEN'];
REQUIRED_ENV_VARS.forEach((v) => {
  if (!process.env[v]) {
    console.log(
      `FATAL ERROR: env variable '${v}' must be set and non-empty if assistant service is installed.`
    );
    exit(1);
  }
});

const router = express.Router();

const sendError = (req: express.Request, res: express.Response, error: any) => {
  console.log(`Error while processing ${req.method} request at '${req.path}'`);
  console.log(error);
  res.status(400).send({
    error: 'message' in error ? error.message : JSON.stringify(error),
  });
};

const sendData = (req: express.Request, res: express.Response, data: any) => {
  console.log(`Successfully processed ${req.method} request at '${req.path}'`);
  res.send({ data });
};

/**
 * GET: /request
 * Returns JSON object with an array of last 50 requests made
 * Accepts query params:
 * - limit: number of requests to return (default: 50)
 */
// router.get('/request', async (req, res) => {
//   try {
//     const { queryLimit } = req.query;
//     const limit = queryLimit ? parseInt(queryLimit as string) : 50;
//     const requests = await prisma.request.findMany({ take: limit });
//     sendData(req, res, requests);
//   } catch (error) {
//     sendError(req, res, error);
//   }
// });

/**
 * POST: /request
 * Makes a new request to the assistant
 * Takes in two params:
 * - request: the request to make
 * - source: the source of the request (e.g. 'siri shortcut')
 */
router.post('/request', async (req, res) => {
  try {
    const { request: queryRequest, source: querySource, model } = req.body;
    if (!queryRequest) {
      throw new Error('Missing required parameter: request');
    }
    const request = assistantRequestSchema.parse(queryRequest);
    const source = querySource ? (querySource as string) : 'unknown';

    console.log(`Received assistant request from source: '${source}'`);
    console.log(`Request: '${JSON.stringify(request)}'`);

    const response = await askAssistant(request, model);
    sendData(req, res, response ?? 'No response, maybe check day one?');
  } catch (error) {
    sendError(req, res, error);
  }
});

module.exports = {
  basePath: '/assistant',
  router,
};
