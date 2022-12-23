import express, { response } from 'express';
import Bree from 'bree';
import dayjs from 'dayjs';
import path from 'path';
import { Job, PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const router = express.Router();
const prisma = new PrismaClient();
let bree;

// TODO: Error handling
// TODO: Types!
// TODO: Exposing job names instead of job scripts

// HELPER FUNCTIONS

// Handles message from job worker.
// Checks status, updates database, and forwards data to callback URL if exists
const workerMessageHandler = async (data) => {
  const { name, message } = data;
  const { success, result } = message;
  const resultString = JSON.stringify(result);
  console.log(
    `DEBUG: Received finish message from worker ${name}. Saving result to database: ${resultString}`
  );

  // Update status of job in DB
  const job = await prisma.job.update({
    where: {
      name,
    },
    data: {
      finished: true,
      success,
      result: resultString,
    },
  });

  if (success && job.callbackURL !== '') {
    console.log(
      `DEBUG: Sending result from worker ${name} to callback URL: ${job.callbackURL}`
    );
    const res = await fetch(job.callbackURL, {
      method: 'POST',
      body: resultString,
      headers: { 'Content-Type': 'application/json' },
    });
    const responseText = await res.text();
    console.log(
      `DEBUG: Response from callback for worker ${name}: ${responseText}`
    );
  }
};

// Convert job from database to Bree job format
const dbJobToBreeJob = (j: Job) => ({
  name: j.name,
  path: path.join(__dirname, 'scripts', j.taskScript),
  timeout: j.runImmediately ? 0 : undefined,
  date: j.runImmediately ? undefined : j.scheduleDate,
  worker: {
    workerData: {
      dataString: j.data,
      name: j.name,
    },
  },
});

// BREE SETUP

// Load all unfinished jobs and setup Bree with existing jobs
(async () => {
  // Pull all unfinished jobs from the database
  const unfinishedJobs = await prisma.job.findMany({
    where: { finished: false },
  });

  // Set up bree scheduler with jobs in the databse
  bree = new Bree({
    root: path.join(__dirname, 'scripts'),
    doRootCheck: false,
    removeCompleted: true,
    jobs: unfinishedJobs.map(dbJobToBreeJob),
    workerMessageHandler,
  });

  // start jobs
  await bree.start();
})();

// ROUTES

// Index: List all active jobs
router.get('/', async (req, res) => {
  const jobs = await prisma.job.findMany();
  res.json(jobs);
});

// Create: Create new job
router.post('/', async (req, res) => {
  const { name, taskScript, scheduleDate, runImmediately, callbackURL, data } =
    req.body;
  const timestamp = Date.now();
  const job = await prisma.job.create({
    data: {
      name: `${name}-${timestamp}`,
      taskScript,
      scheduleDate: dayjs(scheduleDate, 'MM/DD/YYYY h:mma').toDate(),
      runImmediately: true,
      callbackURL,
      data,
      finished: false,
      success: false,
      result: '',
    },
  });
  await bree.add(dbJobToBreeJob(job));
  await bree.start(job.name);
  res.json(job);
});

// Status: Get status of a job
router.get('/status', async (req, res) => {
  const { id } = req.body;
  const job = await prisma.job.findUnique({ where: { id } });
  res.json(job);
});

// Cancel: Cancel job
router.post('/cancel', async (req, res) => {
  const { id } = req.body;
  const deletedJob = await prisma.job.delete({
    where: {
      id,
    },
  });
  bree.remove(deletedJob.name);
  res.json(deletedJob);
});

module.exports = {
  basePath: '/jobs',
  router,
};
