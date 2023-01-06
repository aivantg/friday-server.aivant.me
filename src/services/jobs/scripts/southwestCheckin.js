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
  const { confirmationNumber, firstName, lastName, phoneNumber } = data;
  let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  log(
    `Recieved data: (${confirmationNumber}, ${firstName}, ${lastName}, ${phoneNumber})`
  );

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Load page and enter data
  log('Loading check-in page and entering in personal data');
  await page.goto('https://www.southwest.com/air/check-in/index.html');
  await page.type('#confirmationNumber', confirmationNumber, { delay: 100 });
  await page.type('#passengerFirstName', firstName, { delay: 100 });
  await page.type('#passengerLastName', lastName, { delay: 100 });

  // Submit data and check in
  log('Checking in...');
  await page.click('.submit-button');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.click('.submit-button');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await sleep(1500);

  log('Trying to log boarding position');
  // Log checkin data
  const boardingPositionElement = await page.waitForSelector(
    '.air-check-in-passenger-item--information-boarding-position > [aria-hidden=true]'
  );
  const boardingPosition = await boardingPositionElement.evaluate(
    (el) => el.textContent
  );

  log(`Boarding position: ${boardingPosition}`);

  // Send a confirmation text
  log('Texting boarding pass info');
  await page.click('.boarding-pass-options--button-text');
  await page.waitForSelector('#textBoardingPass');
  await sleep(1500);
  await page.type('#textBoardingPass', phoneNumber, { delay: 100 });
  await page.type('#textBoardingPassConfirmation', phoneNumber, { delay: 100 });
  await page.click('#form-mixin--submit-button');
  log('Waiting 10 seconds for text to go through...');
  await sleep(10000);

  // Wrap up and close the browser
  log('Closing browser and wrapping up.');
  await browser.close();
  finish(
    true,
    `Finished checking in. Got boarding position ${boardingPosition} and sent boarding pass over text.`
  );
};

main(data);
