const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
app.use(cors());
app.use(express.json());

// Chuỗi Cookie lấy từ tài khoản Shopee Affiliate của bạn
const SHOPEE_COOKIES = [
  // Ví dụ: { name: 'SPC_EC', value: 'xxxx', domain: '.shopee.vn' }
];

app.post('/api/convert', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Vui lòng cung cấp URL Shopee' });

  let browser = null;
  try {
    // Khởi tạo Chromium ngầm
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Set Cookie nếu có
    if (SHOPEE_COOKIES.length > 0) {
      await page.setCookie(...SHOPEE_COOKIES);
    }

    // Truy cập trang Custom Link của Shopee
    await page.goto('https://affiliate.shopee.vn/offer/custom_link', { 
      waitUntil: 'domcontentloaded', 
      timeout: 20000 
    });

    // Nhập URL vào ô input
    const textareaSelector = 'textarea[placeholder*="shopee"]';
    await page.waitForSelector(textareaSelector, { timeout: 10000 });
    await page.type(textareaSelector, url);

    // Bấm nút Lấy link
    await page.click('button.btn-primary');

    // Lấy kết quả
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
app.listen(PORT, () => console.log(`Server đang chạy trên port ${PORT}`));
