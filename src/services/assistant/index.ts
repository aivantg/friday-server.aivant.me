import { Router } from 'express';
import { exit } from 'node:process';
import { handleRequest, AskSchema } from './handlers';
import { sendData, sendError } from './utils/routing';
import { z } from 'zod';

/**
 * This application is a layer over the OpenAI API to help take requests
 * and pass them to a different service
 *
 * Useful api documentation:
 * - https://platform.openai.com/docs/introduction
 */

const REQUIRED_ENV_VARS = ['OPENAI_API_KEY', 'NOTION_TOKEN'];
for (const v of REQUIRED_ENV_VARS) {
  if (!process.env[v]) {
    console.log(
      `FATAL ERROR: env variable '${v}' must be set and non-empty if assistant service is installed.`
    );
    exit(1);
  }
}

const router = Router();

/**
 * POST: /request
 * Makes a new request to the assistant
 * Takes in two params:
 * - request: the request to make
 * - source: the source of the request (e.g. 'siri shortcut')
 */
router.post('/request', async (req, res) => {
  try {
    const q = AskSchema.parse(req.body);
    const response = await handleRequest(q);
    sendData(req, res, response ?? 'No response, maybe check day one?');
  } catch (error) {
    sendError(req, res, error);
  }
});

module.exports = {
  basePath: '/assistant',
  router,
};
