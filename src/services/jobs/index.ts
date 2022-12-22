import express from 'express';
import Bree from 'bree';
import dayjs from 'dayjs';
import path from 'path';
import { Job, PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
let bree;

const dbJobToBreeJob = (j: Job) => {
  if (j.runImmediately) {
    return {
      name: j.nickname,
      path: path.join(__dirname, 'scripts', j.taskScript),
      timeout: 0,
    };
  } else {
    return {
      name: j.nickname,
      path: path.join(__dirname, 'scripts', j.taskScript),
      date: j.scheduleDate,
    };
  }
};

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
  });

  // start jobs
  await bree.start();
})();

// Index: List all active jobs
router.get('/', async (req, res) => {
  const jobs = await prisma.job.findMany();
  res.json(jobs);
});

// Create: Create new job
router.post('/', async (req, res) => {
  // TODO: Error handling
  const { nickname, taskScript, scheduleDate, runImmediately, url, data } =
    req.body;
  const job = await prisma.job.create({
    data: {
      nickname,
      taskScript,
      scheduleDate: dayjs(scheduleDate).toDate(),
      runImmediately,
      url,
      data,
      finished: false,
    },
  });
  await bree.add(dbJobToBreeJob(job));
  await bree.start(job.nickname);
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
  bree.remove(deletedJob.nickname);
  res.json(deletedJob);
});

module.exports = {
  basePath: '/jobs',
  router,
};
