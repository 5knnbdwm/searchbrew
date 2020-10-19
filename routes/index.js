const express = require('express');

const router = express.Router();

// require('./db/index')
const db = require('./db');

/* GET home page. */
router.get('/', async (req, res) => {
  let values = [];
  let q = '';

  if (req.query.q !== undefined) {
    q = String(req.query.q);
    values = await db.findData(q);
  } else {
    values = [];
  }

  res.render('index', {
    title: 'Search Brew',
    q,
    values,
    // values: [{
    //   name: 'slackcat', type: 'formula', desc: 'Command-line utility for posting snippets to Slack', link: 'https://github.com/vektorlab/slackcat',
    // }, {
    //   name: 'slack', type: 'cask', desc: 'Team communication and collaboration software', link: 'https://slack.com',
    // }],
  });
});

router.get('/json', async (req, res) => {
  let values = [];

  if (req.query.q !== undefined) {
    values = await db.findData(req.query);
  } else {
    values = [];
  }

  res.json(values);
});

module.exports = router;
