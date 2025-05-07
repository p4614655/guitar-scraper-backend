// index.js — Version 1.8.0
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { extractProductInfo } = require('./scraper/extractProduct');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// POST route to scrape with Puppeteer (default)
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const productInfo = await extractProductInfo(url);
    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET route to scrape with Selenium
app.get('/api/scrape-selenium', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing "url" query parameter' });

  try {
    const productInfo = await extractProductInfo(url, { useSelenium: true });
    res.json(productInfo);
  } catch (error) {
    console.error('[Server] Selenium scraping failed:', error.message);
    res.status(500).json({ error: 'Failed to scrape with Selenium.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
