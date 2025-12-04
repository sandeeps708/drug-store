// routes/drugs.js
const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');

// GET /api/drugs
router.get('/', async (req, res) => {
  try {
    console.log('HIT /api/drugs/companies in drugs');
    const filter = {};
    if (req.query.company) filter.company = req.query.company;

    const drugs = await Drug.find(filter).sort({ launchDate: -1 }).exec();
    console.log('sandy', drugs)
    res.json(drugs);
  } catch (err) {
    console.error('Error in GET /api/drugs:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drugs/companies
router.get('/companies', async (req, res) => {
  try {
    console.log('HIT /api/drugs/companies in router');
    const companies = await Drug.distinct('company');
    res.json(companies.sort());
  } catch (err) {
    console.error('Error in GET /api/drugs/companies:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
