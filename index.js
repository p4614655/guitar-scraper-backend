// Version 1.7.7
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { extractProductInfo } = require('./scraper/extractProduct');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Guitar scraper backend running.');
});

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const productInfo = await extractProductInfo(url);
    res.json(productInfo);
  } catch (error) {
    console.error('Error extracting product info:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
