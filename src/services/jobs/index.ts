// import express, { response } from 'express';
// import Bree from 'bree';
// import path from 'path';
// import { Job, PrismaClient } from '@prisma/client';
// import fetch from 'node-fetch';

// const router = express.Router();
// const prisma = new PrismaClient();
// let bree: Bree;

// // TODO: Error handling
// // TODO: Types!

// const schedulableJobs = {
//   timerCallback: 'timerCallback.js',
//   southwestCheckin: 'southwestCheckin.js',
// };

// type ScheduleableJob = keyof typeof schedulableJobs;

// // HELPER FUNCTIONS

// // Handles message from job worker.
// // Checks status, updates database, and forwards data to callback URL if exists
// const workerMessageHandler = async (data: {
//   name: string;
//   message: { success?: boolean; result?: any };
// }) => {
//   const { name, message } = data;
//   try {
//     if ('success' in message && 'result' in message) {
//       const { success, result } = message;
//       const resultString = JSON.stringify(result);
//       console.log(
//         `DEBUG [${name}]: Received finish message from worker. Saving result to database: ${resultString}`
//       );

//       // Update status of job in DB
//       const job = await prisma.job.update({
//         where: {
//           name,
//         },
//         data: {
//           finished: true,
//           success,
//           result: resultString,
//         },
//       });

//       if (job.callbackURL !== '') {
//         console.log(
//           `DEBUG [${name}]: Sending result from worker to callback URL: ${job.callbackURL}`
//         );
//         const res = await fetch(job.callbackURL, {
//           method: 'POST',
//           body: JSON.stringify({
//             jobId: job.id,
//             result,
//           }),
//           headers: { 'Content-Type': 'application/json' },
//         });
//         const responseText = await res.text();
//         console.log(
//           `DEBUG [${name}]: Response from callback for worker: ${responseText}`
//         );
//       }
//     } else {
//       console.log(`DEBUG [${name}]: ${message}`);
//     }
//   } catch (e) {
//     console.log(`DEBUG [${name}]: ${message}`);
//   }
// };

// // Convert job from database to Bree job format
// const dbJobToBreeJob = (j: Job) => ({
//   name: j.name,
//   path: path.join(__dirname, 'scripts', j.taskScript),
//   timeout: j.runImmediately ? 0 : undefined,
//   date: j.runImmediately ? undefined : j.scheduleDate,
//   worker: {
//     workerData: {
//       dataString: j.data,
//       workerName: j.name,
//     },
//   },
// });

// // BREE SETUP

// // Load all unfinished jobs and setup Bree with existing jobs
// (async () => {
//   // Pull all unfinished jobs from the database
//   const unfinishedJobs = await prisma.job.findMany({
//     where: { finished: false },
//   });

//   // Set up bree scheduler with jobs in the databse
//   bree = new Bree({
//     root: path.join(__dirname, 'scripts'),
//     doRootCheck: false,
//     removeCompleted: true,
//     jobs: unfinishedJobs.map(dbJobToBreeJob),
//     workerMessageHandler,
//   });

//   // start jobs
//   await bree.start();
// })();

// // ROUTES

// // Index: List all active jobs
// router.get('/', async (req, res) => {
//   const jobs = await prisma.job.findMany();
//   res.json(jobs);
// });

// // Create: Create new job
// router.post('/', async (req, res) => {
//   const { name, taskScript, scheduleDate, callbackURL, data } = req.body;

//   // Validate job
//   if (!(taskScript in schedulableJobs)) {
//     return res.status(400).send({
//       message: `Invalid taskScript: ${taskScript}. Must be a valid schedulable job type returned by /jobs/types`,
//     });
//   }

//   // Setup job data
//   let jobData = {
//     name: `${name}-${Date.now()}`,
//     taskScript: schedulableJobs[taskScript as ScheduleableJob],
//     callbackURL: callbackURL || '',
//     data,
//     finished: false,
//     success: false,
//     result: '',
//     scheduleDate: new Date(),
//     runImmediately: true,
//   };

//   // If scheduleDate exists, schedule job. Else, job will run immediately
//   if (scheduleDate) {
//     // Validate date is in the future TODO: deal with timezones
//     const date = new Date(scheduleDate);
//     const dayAgo = new Date();
//     dayAgo.setDate(dayAgo.getDate() - 1);
//     if (dayAgo > date) {
//       console.log(
//         `DEBUG: Received job with date more than 1 day in past: ${date} (got from ${scheduleDate}). Skipping.`
//       );
//       await res
//         .status(400)
//         .send("Can't schedule job with date more than one day in the past");
//       return;
//     } else if (new Date() > date && dayAgo < date) {
//       console.log(`DEBUG: Received job within 1 day. Scheduling immediately.`);
//     } else {
//       console.log(`DEBUG: Scheduling ${taskScript} job for ${date}`);
//       jobData['scheduleDate'] = date;
//       jobData['runImmediately'] = false;
//     }
//   } else {
//     console.log(
//       `DEBUG: No scheduleDate provided. Running ${taskScript} job immediately`
//     );
//   }

//   const job = await prisma.job.create({
//     data: jobData,
//   });
//   console.log(job);

//   await bree.add(dbJobToBreeJob(job));
//   await bree.start(job.name);
//   res.json(job);
// });

// // Return available job types
// router.get('/types', async (req, res) => {
//   res.json(Object.keys(schedulableJobs));
// });

// // Status: Get status of a job
// router.get('/status', async (req, res) => {
//   const { id } = req.body;
//   const job = await prisma.job.findUnique({ where: { id } });
//   res.json(job);
// });

// // Cancel: Cancel job
// router.post('/cancel', async (req, res) => {
//   const { id } = req.body;
//   console.log(`Trying to cancel job with ID: ${id}`);
//   const deletedJob = await prisma.job.delete({
//     where: {
//       id,
//     },
//   });
//   console.log('Deleted following job:');
//   console.log(deletedJob);
//   try {
//     console.log('Trying to remove job from bree if exists');
//     await bree.remove(deletedJob.name);
//     console.log('Successfully removed');
//   } catch {
//     console.log('Removing job failed');
//   }
//   res.json(deletedJob);
// });

// module.exports = {
//   basePath: '/jobs',
//   router,
// };
