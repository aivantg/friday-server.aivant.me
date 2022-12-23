// Simple test task, template for future jobs
const { workerData, parentPort } = require('worker_threads');
const { name, dataString } = workerData;
const data = JSON.parse(dataString);

console.log(`DEBUG: Worker ${name} started with data: ${dataString}`);

// Helper finish function. Should be copied over for all jobs
const finish = (success, result) => {
  if (parentPort) {
    console.log(
      `DEBUG: Worker ${name} finished. Success? ${success}. Result: ${result}`
    );
    parentPort.postMessage({ success, result });
    process.exit(0);
  } else {
    console.error(
      `FAIL: Worker "${name}" disconnected from parent port. Server might retry job if setup to run immediately.`
    );
    process.exit(1);
  }
};

// Main function to run worker task
const main = async (data) => {
  console.log(data);
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
