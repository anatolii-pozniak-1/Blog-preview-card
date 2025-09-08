const { test, expect } = require('@playwright/test');
const path = require('path');

test('index.html visual regression', async ({ page }) => {
  const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');
  await page.goto(fileUrl);
  await expect(page).toHaveScreenshot('index.png', { fullPage: true });
});
