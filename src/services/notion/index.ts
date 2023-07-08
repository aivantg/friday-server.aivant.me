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

/**
 * GET: /people
 * Returns JSON array of all people in people database
 * Includes properties: name, location, notes
 */
router.get('/people', async (req, res) => {
  try {
    res.send(await getAllPeople(notion));
  } catch (error) {
    res.status(400).json(error);
  }
});

/**
 * GET: /peopleNames
 * Returns JSON array of people names in people database
 */
router.get('/peopleNames', async (req, res) => {
  try {
    const people = await getAllPeople(notion);
    res.send(people.map((p) => p.name).join(','));
  } catch (error) {
    res.status(400).json(error);
  }
});

/**
 * GET: /addPerson
 * Adds new person row to people database
 * Pulls out the following properties out of the query parameter:
 * - name
 * - location (multiple separated by commas)
 * - notes (optiona)
 */
router.get('/addPerson', async (req, res) => {
  try {
    const { name, location, notes, tags } = req.query;
    if (!name || !location) {
      res
        .status(400)
        .send('Missing one or more required parameters: name, location');
    }

    res.send(
      await addNewPerson(notion, {
        name: name as string,
        location: location as string,
        notes: notes ? (notes as string) : '',
        tags: tags ? (tags as string) : '',
      })
    );
  } catch (error) {
    console.log(error);
    res.status(400).send(JSON.stringify(error));
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
      res.status(400).send('Missing required parameter: name');
    }

    const personId = await findPersonIdByName(notion, name as string);
    if (!personId) {
      res.status(400).send(`No person found with name: ${name}`);
    }

    res.send(personId);
  } catch (error) {
    res.status(400).send(JSON.stringify(error));
  }
});

/**
 * GET: /addNoteToPerson
 * Adds note to person with given name. Note is added as children of person's page
 * If no person is found, throws error
 * If no note is provided, throws error
 * If note is added successfully, returns link to new block.
 */
router.get('/addNoteToPerson', async (req, res) => {
  try {
    const { name, note } = req.query;
    if (!name || !note) {
      res
        .status(400)
        .send('Missing one or more required parameters: name, note');
      return;
    }

    const personId = await findPersonIdByName(notion, name as string);
    if (!personId) {
      res.status(400).send(`No person found with name: ${name}`);
      return;
    }

    res.send(await addNoteToPerson(notion, personId as string, note as string));
  } catch (error) {
    res.status(400).send(JSON.stringify(error));
  }
});

module.exports = {
  basePath: '/notion',
  router,
};
