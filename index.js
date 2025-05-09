// index.js – Version 1.8.0
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const extractProductInfo = require('./scraper/extractProduct');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔎 POST route for Puppeteer/Selenium scraping
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const data = await extractProductInfo(url);
    res.json(data);
  } catch (err) {
    console.error('[Server Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
