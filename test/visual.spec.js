import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
test('compare page to specific file', async ({ page }) => {
  const screenshotPath = 'test-results/current.png';
  const referencePath = 'test-results/my-reference.png';

  await page.goto('file://' + path.resolve(__dirname, '../index.html'));
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const img1 = PNG.sync.read(fs.readFileSync(screenshotPath));
  const img2 = PNG.sync.read(fs.readFileSync(referencePath));

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    img1.data, img2.data, diff.data, width, height, { threshold: 0.1 }
  );

  fs.writeFileSync('test-results/diff.png', PNG.sync.write(diff));

  expect(mismatchedPixels).toBeLessThan(100); // adjust threshold as needed
});
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('index.html visual regression', async ({ page }) => {
  const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');
  await page.goto(fileUrl);
  await expect(page).toHaveScreenshot('index.png', { fullPage: true });
});
