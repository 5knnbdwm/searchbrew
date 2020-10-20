/* eslint-disable no-console */
const express = require('express');
const fetch = require('node-fetch');
const cron = require('node-cron');
const { updateData } = require('./db');

const router = express.Router();

// helper functions
async function fetchBrews(file) {
  try {
    const response = await fetch(`https://formulae.brew.sh/api/${file}.json`);
    const json = await response.json();
    // console.log(json.slice(0, 5));
    return json;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return null;
  }
}

function cleanCasks(arr) {
  const cleanedArr = [];

  for (let i = 0; i < arr.length; i += 1) {
    const element = arr[i];

    const item = {
      name: element.token,
      fullName: element.name,
      homepage: element.homepage,
      version: element.version,
      description: element.desc,
      type: 'cask',
    };
    cleanedArr.push(item);
  }
  return cleanedArr;
}

function cleanFormulas(arr) {
  const cleanedArr = [];

  for (let i = 0; i < arr.length; i += 1) {
    const element = arr[i];

    const fullName = [];
    fullName.push(element.full_name);
    fullName.push(...element.aliases);

    const item = {
      name: element.name,
      fullName: element.full_name,
      homepage: element.homepage,
      version: element.versions.stable,
      description: element.desc,
      type: 'formula',
    };
    cleanedArr.push(item);
  }
  return cleanedArr;
}

async function checkAndUpdateBrews() {
  const cleanedBrews = [];

  cleanedBrews.push(...cleanCasks(await fetchBrews('cask')));
  cleanedBrews.push(...cleanFormulas(await fetchBrews('formula')));

  await updateData(cleanedBrews);
  console.log('here');

  return cleanedBrews.length;
}

// Cron Job
const job = cron.schedule('0 */1 * * *', async () => {
  console.log('started run (every hour)');
  console.log(`Time: ${new Date()}`);

  checkAndUpdateBrews();

  console.log('finished run');
}, { scheduled: false });
job.start();

/* GET home page. */
router.get('/', async (req, res) => {
  res.send(`The Cron Job has the status: ${job.getStatus()}`);
  // const n = await checkAndUpdateBrews();

  // res.send(`Done with ${n} checks`);
});

// router.get('/start', function(req, res, next) {
//   job.start()
//   res.send("start")
//   // res.render('index', {title: "Search Brew"});
// });

// router.get('/stop', function(req, res, next) {
//   job.stop()
//   res.send("stop")
//   // res.render('index', {title: "Search Brew"});
// });

module.exports = router;
