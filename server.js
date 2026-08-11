const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core');

const app = express();
app.use(cors());
app.use(express.json());

const SHOPEE_COOKIES = [
  // Dán Cookie Shopee Affiliate của bạn vào đây (nếu có)
];

app.post('/api/convert', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Vui lòng cung cấp URL Shopee' });

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    if (SHOPEE_COOKIES.length > 0) {
      await page.setCookie(...SHOPEE_COOKIES);
    }

    await page.goto('https://affiliate.shopee.vn/offer/custom_link', { 
      waitUntil: 'domcontentloaded', 
      timeout: 25000 
    });

    const textareaSelector = 'textarea[placeholder*="shopee"]';
    await page.waitForSelector(textareaSelector, { timeout: 10000 });
    await page.type(textareaSelector, url);

    await page.click('button.btn-primary');

    const resultSelector = '.custom-link-result input';
    await page.waitForSelector(resultSelector, { timeout: 10000 });
    const affLink = await page.$eval(resultSelector, el => el.value);

    await browser.close();
    return res.json({ success: true, affLink });

  } catch (err) {
    if (browser) await browser.close();
    console.error('Lỗi khi lấy link:', err.message);
    return res.status(500).json({ error: 'Không thể xử lý link: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
