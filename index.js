// Version 1.7.9 – index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { extractProductInfo } = require('./scraper/extractProduct');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🟢 Guitar Scraper Backend is running.');
});

// ✅ Puppeteer-based POST route (optional)
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const productInfo = await extractProductInfo(url);
    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Selenium-based GET route for Hoppscotch testing
app.get('/api/scrape-selenium', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const data = await extractProductInfo(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
