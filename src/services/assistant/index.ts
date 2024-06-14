import { Router } from 'express';
import { exit } from 'node:process';
import { handleAsk } from './handlers';
import { sendData, sendError } from './utils/routing';
import { askSchema } from './utils/types';
import multer from 'multer';
import path from 'node:path';
import type { Request, Response } from 'express';
import { transcribe } from './utils/openai';
import { unlinkSync } from 'node:fs';

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
    const ask = askSchema.parse(req.body);
    const response = await handleAsk(ask);
    sendData(req, res, response);
  } catch (error: unknown) {
    sendError(req, res, error as Error);
  }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    console.log('Received transcription request');
    console.log(req.body);
    console.log(req.query);
    console.log(req.file);

    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }
    const filePath = req.file.path;
    const transcription = await transcribe(filePath);
    res.send(transcription);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send('An error occurred while transcribing the audio file.');
  } finally {
    // Clean up the uploaded file
    if (req.file) {
      unlinkSync(req.file.path);
    }
  }
});

module.exports = {
  basePath: '/assistant',
  router,
};
