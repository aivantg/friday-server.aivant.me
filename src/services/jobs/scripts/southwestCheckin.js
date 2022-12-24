// Simple test task, template for future jobs
const { workerData, parentPort } = require('worker_threads');
const puppeteer = require('puppeteer');
const { name, dataString } = workerData;
const data = JSON.parse(dataString);

const log = (s) => console.log(`DEBUG-${name}: ${s}`);

log(`Worker started with data: ${dataString}`);

// Helper finish function. Should be copied over for all jobs
const finish = (success, result) => {
  if (parentPort) {
    log(`Worker finished. Success? ${success}. Result: ${result}`);
    parentPort.postMessage({ success, result });
    process.exit(0);
  } else {
    log(
      `FAIL: Worker disconnected from parent port. Server might retry job if setup to run immediately.`
    );
    process.exit(1);
  }
};

// Main function to run worker task
const main = async (data) => {
  const { delayMilliseconds } = data;
  let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  if (delayMilliseconds) {
    await sleep(delayMilliseconds);
    finish(true, `Finished sleeping for ${delayMilliseconds}.`);
  } else {
    finish(false, "Couldn't find delayMilliseconds value in data");
  }
};

main(data);
