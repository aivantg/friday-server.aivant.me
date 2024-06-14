import { Router } from 'express';
import { exit } from 'node:process';
import { handleAsk } from './handlers';
import { sendData, sendError } from './utils/routing';
import { askSchema } from './utils/types';
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
 * POST: /ask
 * Makes a new ask to the assistant
 * Expects body to conform to askSchema
 */
router.post('/ask', async (req, res) => {
  try {
    const response = await handleAsk(askSchema.parse(req.body));
    sendData(req, res, response ?? 'No response, maybe check day one?');
  } catch (error) {
    sendError(req, res, error);
  }
});

module.exports = {
  basePath: '/assistant',
  router,
};
