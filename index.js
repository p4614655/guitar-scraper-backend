const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Scraper imports (kept separate)
const scrapeGuitarSalonSelenium = require('./shops/scrapeGuitarSalon.selenium');
const scrapeGuitarSalonPuppeteer = require('./shops/scrapeGuitarSalon.puppeteer');

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Default route
app.get('/', (req, res) => {
  res.send('Guitar Salon Scraper API is running.');
});

// ✅ Selenium-based route
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

// ✅ Puppeteer-based route
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

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
