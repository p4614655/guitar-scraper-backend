const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 App starting...');

const scrapeGuitarSalonSelenium = require('./shops/scrapeGuitarSalon.selenium');
const scrapeGuitarSalonPuppeteer = require('./shops/scrapeGuitarSalon.puppeteer');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🎸 Guitar Salon Scraper API is running.');
});

app.get('/scrape/guitarsalon', async (req, res) => {
  console.log('[Route Hit] /scrape/guitarsalon');
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

app.get('/scrape/guitarsalon-puppeteer', async (req, res) => {
  console.log('[Route Hit] /scrape/guitarsalon-puppeteer');
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
  console.log(`✅ Server listening on port ${PORT}`);
});
