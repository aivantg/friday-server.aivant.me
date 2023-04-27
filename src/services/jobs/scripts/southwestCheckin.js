// @ts-nocheck
const { workerData, parentPort } = require('worker_threads');

// Setup puppeteer in stealth mode
const { executablePath } = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { workerName, dataString } = workerData;
const data = JSON.parse(dataString);

const log = (s) => { // console.log(`DEBUG-${workerName}: ${s}`);
  if (parentPort) {
    parentPort.postMessage(s);
}}; 
log(`Raw worker data: ${JSON.stringify(workerData)}`);
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
  try {
    log(`Beginning worker task`);
    const { confirmationNumber, firstName, lastName, phoneNumber, email } =
      data;
    let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    log(
      `Recieved data: (${confirmationNumber}, ${firstName}, ${lastName}, ${phoneNumber}, ${email})`
    );

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath(),
    });
    const page = await browser.newPage();

    // Load page and enter data
    log('Loading check-in page...');
    await page.goto('https://www.southwest.com/air/check-in/index.html');

    // Submit data and check in
    log('Checking in...');
    await page.type('#confirmationNumber', confirmationNumber, { delay: 10 });
    await page.type('#passengerFirstName', firstName, { delay: 10 });
    await page.type('#passengerLastName', lastName, { delay: 10 });
    await page.click('.submit-button');
    await page.waitForNetworkIdle();
    if (await page.$('.message_error')) {
      log('Unable to retrieve reservation');
      finish(false, {
        success: false,
        errorMessage: 'Unable to retrieve reservation',
      });
      return;
    }
    await page.click('.submit-button');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await sleep(3000);

    log('Trying to log boarding position');
    // Log checkin data
    const boardingPositionElement = await page.$(
      '.air-check-in-passenger-item--information-boarding-position > [aria-hidden=true]'
    );
    const boardingPosition = await boardingPositionElement.evaluate(
      (el) => el.textContent
    );

    log(`Boarding position: ${boardingPosition}`);

    // Send a confirmation text if phoneNumber is supplied
    if (phoneNumber) {
      log('Found phone number, texting boarding pass info...');
      await page.click('.boarding-pass-options--button-text');
      await page.waitForSelector('#textBoardingPass');
      await sleep(1500);
      await page.type('#textBoardingPass', phoneNumber, { delay: 100 });
      await page.type('#textBoardingPassConfirmation', phoneNumber, {
        delay: 100,
      });
      await page.click('#form-mixin--submit-button');
      log('Waiting 5 seconds for text to go through...');
      await sleep(5000);
      await page.keyboard.press('Escape');
    }

    if (email) {
      log('Found email, sending boarding pass info...');
      await page.click('.boarding-pass-options--button-email');
      await page.waitForSelector('#emailBoardingPass');
      await sleep(1500);
      await page.type('#emailBoardingPass', email, { delay: 100 });
      await page.click('#form-mixin--submit-button');
      log('Waiting 5 seconds for email to go through...');
      await sleep(5000);
      await page.keyboard.press('Escape');
    }

    // Wrap up and close the browser
    log('Closing browser and wrapping up.');
    await browser.close();
    finish(true, { success: true, boardingPosition });
  } catch (e) {
    log('Script failed');
    log(e);
    finish(false, { success: false, errorMessage: JSON.stringify(e) });
  }
};
log("Hahahahaha");
log("About to run main");
main(data);
log("Finished running man");
