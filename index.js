// version 1.8.0
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const scrapeGuitarSalon = require('./shops/scrapeGuitarSalon.selenium');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/scrape-selenium', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing ?url parameter' });
  }

  try {
    const result = await scrapeGuitarSalon(url);
    res.json(result);
  } catch (error) {
    console.error('[Selenium] Scrape failed:', error.message);
    res.status(500).json({ error: 'Failed to scrape with Selenium.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
