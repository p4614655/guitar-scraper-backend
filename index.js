const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Import scrapers
const scrapeGuitarSalonSelenium = require('./shops/scrapeGuitarSalon.selenium');
const scrapeGuitarSalonPuppeteer = require('./shops/scrapeGuitarSalon.puppeteer');

app.use(cors());
app.use(express.json());

// ✅ Health check
app.get('/', (req, res) => {
  res.send('🎸 Guitar Salon Scraper API is running.');
});

// ✅ Selenium scraper route
app.get('/scrape/guitarsalon', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const data = await scrapeGuitarSalonSelenium(url);
    res.json(data);
  } catch (err) {
    console.error('[Selenium Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Puppeteer scraper route
app.get('/scrape/guitarsalon-puppeteer', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const data = await scrapeGuitarSalonPuppeteer(url);
    res.json(data);
  } catch (err) {
    console.error('[Puppeteer Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
