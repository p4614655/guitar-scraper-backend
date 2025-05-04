const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { extractProductInfo } = require('./scraper/extractProduct');
const scrapeSeleniumRoute = require('./routes/scrape-selenium');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Puppeteer route
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const productInfo = await extractProductInfo(url);
    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Selenium GET route
app.use('/api', scrapeSeleniumRoute);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
