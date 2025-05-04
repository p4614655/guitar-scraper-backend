// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const scrapeGuitarSalon = require('./shops/scrapeGuitarSalon.selenium');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Selenium scraper route (GET with query param)
app.get('/api/scrape-selenium', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter.' });
  }

  try {
    console.log('[Selenium] Navigating to:', url);
    const data = await scrapeGuitarSalon(url);
    res.json(data);
  } catch (error) {
    console.error('[Selenium] Scrape error:', error.message);
    res.status(500).json({ error: 'Failed to scrape with Selenium.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
