const express = require('express');
const scrapeGuitarSalon = require('../shops/scrapeGuitarSalon.selenium');

const router = express.Router();

router.get('/scrape-selenium', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter.' });
  }

  try {
    const data = await scrapeGuitarSalon(url);
    res.json(data);
  } catch (err) {
    console.error('Selenium scrape error:', err.message);
    res.status(500).json({ error: 'Failed to scrape with Selenium.' });
  }
});

module.exports = router;
