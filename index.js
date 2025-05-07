// index.js - Version 1.8.1
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { extractProductInfo } = require('./scraper/extractProduct');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Puppeteer route (POST)
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const productInfo = await extractProductInfo(url);
    res.json(productInfo);
  } catch (error) {
    console.error('[Server] Puppeteer scrape failed:', error.message);
    res.status(500).json({ error: 'Puppeteer scraper failed.' });
  }
});

// Selenium route (GET)
app.get('/api/scrape-selenium', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const productInfo = await extractProductInfo(url, { engine: 'selenium' });
    res.json(productInfo);
  } catch (error) {
    console.error('[Server] Selenium scrape failed:', error.message);
    res.status(500).json({ error: 'Selenium scraper failed.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
