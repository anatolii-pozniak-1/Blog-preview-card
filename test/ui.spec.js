import { test, expect } from "@playwright/test";
import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const PORT = 8080;
const STUDENT_URL = process.env.STUDENT_URL || `http://localhost:${PORT}/index.html`;

// Helper: compare actual screenshot with reference
async function compareScreenshots(page, name, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(STUDENT_URL, { waitUntil: "networkidle" });

  const actualPath = `results/${name}.png`;
  await page.screenshot({ path: actualPath, fullPage: true });

  const referencePath = `references/${name}.png`;
  if (!fs.existsSync(referencePath)) {
    throw new Error(`❌ Missing reference image: ${referencePath}`);
  }

  const refImg = PNG.sync.read(fs.readFileSync(referencePath));
  const actImg = PNG.sync.read(fs.readFileSync(actualPath));

  if (refImg.width !== actImg.width || refImg.height !== actImg.height) {
    throw new Error(`❌ Dimension mismatch for ${name}`);
  }

  const diff = new PNG({ width: refImg.width, height: refImg.height });
  const mismatches = pixelmatch(refImg.data, actImg.data, diff.data, refImg.width, refImg.height, {
    threshold: 0.1,
  });

  fs.writeFileSync(`results/${name}-diff.png`, PNG.sync.write(diff));
  expect(mismatches, `${name} mismatch count`).toBeLessThan(500);
}

test.describe("Visual regression", () => {
  test("desktop matches reference", async ({ page }) => {
    await compareScreenshots(page, "desktop", 1280, 800);
  });

  test("mobile matches reference", async ({ page }) => {
    await compareScreenshots(page, "mobile", 375, 667);
  });
});