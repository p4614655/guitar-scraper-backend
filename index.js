// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const scrapeGuitarSalonSelenium = require('./shops/scrapeGuitarSalon.selenium'); // 🟢 use Selenium here

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Primary scrape route using Selenium now
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const productInfo = await scrapeGuitarSalonSelenium(url);
    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
