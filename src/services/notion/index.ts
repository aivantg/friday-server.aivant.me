import express, { response } from 'express';
import { exit } from 'process';
import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { getAllPeople } from './utils';

/**
 * This application is a layer over the Notion API to help facilitate
 * useful shortcuts and integrations.
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

// Index: shows all routes
// TODO: implement
router.get('/', async (req, res) => {
  res.status(200).json({ message: 'Hello Notion API!' });
});

// Use the notion JS sdk to query all values from users database
// Return json array with each row's properties
router.get('/people', async (req, res) => {
  try {
    const people = await getAllPeople(notion);
    res.json(people);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = {
  basePath: '/notion',
  router,
};
