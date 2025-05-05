const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { extractProductInfo } = require('./scraper/extractProduct');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL query param' });

  try {
    const data = await extractProductInfo(url);
    res.json(data);
  } catch (error) {
    console.error('[Scrape Error]', error.message);
    res.status(500).json({ error: 'Failed to scrape product info.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
