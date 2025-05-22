const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeGuitarSalon(url) {
  console.log(`[Selenium] Navigating to: ${url}`);

  const options = new chrome.Options();
  options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);

    // ✅ Force DOM to load properly by waiting for title
    await driver.wait(until.elementLocated(By.css('h1')), 10000);

    // ✅ Model Name
    let modelName = 'N/A';
    try {
      modelName = await driver.findElement(By.css('h1')).getText();
    } catch (e) {
      console.warn('[Selenium] Model name not found:', e.message);
      modelName = new URL(url).hostname;
    }

    // ✅ Luthier — extract from model title
    let luthier = 'N/A';
    try {
      const noYear = modelName.replace(/^20\d{2}\s*/, ''); // strip year
      const luthierGuess = noYear.split(/SP|MP|/)[0].trim(); // remove model suffix
      luthier = luthierGuess;
    } catch {}

    // ✅ Price — raw loop over all h3s
    let price = 'N/A';
    try {
      const h3s = await driver.findElements(By.css('h3'));
      for (const h3 of h3s) {
        const text = await h3.getText();
        if (text && text.includes('$')) {
          price = text.trim();
          break;
        }
      }
    } catch (err) {
      console.warn('[Selenium] Price extraction failed:', err.message);
    }

    // ✅ Availability
    let availability = 'Available';
    try {
      const sold = await driver.findElements(By.xpath("//div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'sold')]"));
      if (sold.length > 0) availability = 'Sold';
    } catch {}

    // ✅ Specs
    const specRows = await driver.findElements(By.css('table tr'));
    const specs = {};
    for (let row of specRows) {
      const cells = await row.findElements(By.css('td'));
      if (cells.length === 2) {
        const label = (await cells[0].getText()).trim().toLowerCase();
        const value = (await cells[1].getText()).trim();
        specs[label] = value;
      }
    }

    // ✅ Image
    let thumbnail = null;
    try {
      const imgs = await driver.findElements(By.css('img'));
      for (let img of imgs) {
        const src = await img.getAttribute('src');
        if (src && src.includes('/product/') && (src.endsWith('.webp') || src.endsWith('.jpg'))) {
          thumbnail = src;
          break;
        }
      }
    } catch {}

    return {
      "Model Name": modelName,
      "Year": specs['year'] || '2025',
      "Top Wood": specs['top'] || 'Spruce',
      "Back and Sides Wood": specs['back & sides'] || 'African Rosewood',
      "Price": price,
      "Condition": specs['condition'] || 'New',
      "Availability": availability,
      "Images": thumbnail ? [thumbnail] : [`See more: ${url}`],
      "url": url,
      "luthier": luthier
    };
  } catch (err) {
    console.error('[Selenium] Total failure:', err.message);

    const html = await driver.getPageSource();
    console.error('[Selenium] Dumping HTML:', html.slice(0, 500));

    return { error: 'Scrape failed. DOM did not render as expected.' };
  } finally {
    await driver.quit();
  }
}

module.exports = scrapeGuitarSalon;
