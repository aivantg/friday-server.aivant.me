import express, { response } from 'express';
import { exit } from 'process';
import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import {
  addNewPerson,
  addNoteToPerson,
  findPersonIdByName,
  getAllPeople,
} from './peopleUtils';

/**
 * This application is a layer over the Notion API to help facilitate
 * useful shortcuts and integrations.
 *
 * Useful api documentation:
 * - https://github.com/makenotion/notion-sdk-js
 * - https://developers.notion.com/docs
 */

if (!process.env.NOTION_TOKEN) {
  console.log(
    'FATAL ERROR: env variable `NOTION_TOKEN` must be set and non-empty if notion service is installed.'
  );
  exit(1);
}

// Initialize notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });
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
 * GET: /people
 * Returns JSON object with an array of all people in people database
 * Includes properties: name, location, notes
 */
router.get('/people', async (req, res) => {
  try {
    sendData(req, res, await getAllPeople(notion));
  } catch (error) {
    sendError(req, res, error);
  }
});

/**
 * POST: /addPerson
 * Adds new person row to people database
 * Pulls out the following properties out of the query parameter:
 * - name
 * - location (multiple separated by commas)
 * - notes (optiona)
 */
router.post('/addPerson', async (req, res) => {
  try {
    const { name, location, notes, tags } = req.body;
    if (!name) {
      throw new Error('Missing required parameter: name');
    }

    const result = await addNewPerson(notion, {
      name: name as string,
      location: location ? (location as string) : '',
      notes: notes ? (notes as string) : '',
      tags: tags ? (tags as string) : '',
    });
    sendData(req, res, result);
  } catch (error) {
    sendError(req, res, error);
  }
});

/**
 * GET: /findPerson
 * Finds person by name and returns their id
 * If multiple people are found, picks first
 * If no people are found, throws error
 */
router.get('/findPerson', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      throw new Error('Missing required parameter: name');
    }

    const personId = await findPersonIdByName(notion, name as string);
    if (!personId) {
      throw new Error('No person found with name: ${name}');
    }

    sendData(req, res, personId);
  } catch (error) {
    sendError(req, res, error);
  }
});

/**
 * POST: /addNoteToPerson
 * Adds note to person with given name. Note is added as children of person's page
 * If no person is found, throws error
 * If no note is provided, throws error
 * If note is added successfully, returns link to new block.
 */
router.post('/addNoteToPerson', async (req, res) => {
  try {
    const { name, note } = req.body;
    if (!name || !note) {
      throw new Error('Missing one or more required parameters: name, note');
    }

    const personId = await findPersonIdByName(notion, name as string);
    if (!personId) {
      throw new Error('No person found with name: ${name}');
    }

    const result = await addNoteToPerson(
      notion,
      personId as string,
      note as string
    );
    sendData(req, res, result);
  } catch (error) {
    sendError(req, res, error);
  }
});

module.exports = {
  basePath: '/notion',
  router,
};
