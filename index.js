const express = require('express');
const cors = require('cors');
const scrapeGuitarSalon = require('./shops/scrapeGuitarSalon.selenium');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ GET route (for Hoppscotch and simple testing)
app.get('/scrape/guitarsalon', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const data = await scrapeGuitarSalon(url);
    res.json(data);
  } catch (err) {
    console.error('[GET] Scrape failed:', err.message);
    res.status(500).json({ error: 'Scraping failed.' });
  }
});

// ✅ POST route (for automation or frontend usage)
app.post('/scrape/guitarsalon', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const data = await scrapeGuitarSalon(url);
    res.json(data);
  } catch (err) {
    console.error('[POST] Scrape failed:', err.message);
    res.status(500).json({ error: 'Scraping failed.' });
  }
});

// Default home route
app.get('/', (req, res) => {
  res.send('Guitar Salon Scraper API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
