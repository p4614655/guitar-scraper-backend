// index.js — v1.9.1
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { extractProductInfo } = require('./scraper/extractProduct');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/scrape-selenium', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter.' });
  }

  try {
    const productInfo = await extractProductInfo(url, 'selenium');
    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
