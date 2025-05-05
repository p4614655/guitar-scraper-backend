// index.js (v1.8.0)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { extractProductInfo } = require('./scraper/extractProduct');
const scrapeGuitarSalonSelenium = require('./shops/scrapeGuitarSalon.selenium');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// POST route using extractProduct
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const productInfo = await extractProductInfo(url);
    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ New GET route directly using Selenium
app.get('/api/scrape-selenium', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const productInfo = await scrapeGuitarSalonSelenium(url);
    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape with Selenium.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
