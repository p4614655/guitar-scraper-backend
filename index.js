// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const scrapeGuitarSalonSelenium = require('./shops/scrapeGuitarSalon.selenium');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Route: Selenium scraper (POST)
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes('guitarsalon.com')) {
    return res.status(400).json({ error: 'A valid Guitar Salon URL is required.' });
  }

  try {
    const productInfo = await scrapeGuitarSalonSelenium(url);
    res.json(productInfo);
  } catch (error) {
    console.error('Error extracting product info:', error.message);
    res.status(500).json({ error: 'Failed to extract product info.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
