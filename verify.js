import { chromium } from "playwright";
import fs from "fs";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { spawn } from "child_process";

// Config
const SERVER_PORT = 8080;
const LOCAL_SERVER = process.env.LOCAL_SERVER || "true"; // "true" = start http-server
const STUDENT_URL = process.env.STUDENT_URL || null;

async function startStaticServer() {
  return new Promise((resolve, reject) => {
    console.log("🚀 Starting static server...");
    const server = spawn("npx", ["http-server", ".", "-p", SERVER_PORT], {
      shell: true,
      stdio: "inherit",
    });

    // give it 2s to boot
    setTimeout(() => resolve(server), 2000);

    server.on("error", (err) => reject(err));
  });
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let baseUrl;

  if (STUDENT_URL) {
    // case 1: remote hosted (GitHub Pages etc.)
    baseUrl = STUDENT_URL;
    console.log("🌍 Using remote URL:", baseUrl);
  } else if (LOCAL_SERVER === "true") {
    // case 2: local http server
    await startStaticServer();
    baseUrl = `http://localhost:${SERVER_PORT}/index.html`;
    console.log("🖥 Using local server at", baseUrl);
  } else {
    // case 3: fallback file://
    baseUrl = `file://${process.cwd()}/index.html`;
    console.log("📂 Using local file URL:", baseUrl);
  }

  // define viewports from a schema (can be JSON later)
  const viewports = [
    { name: "desktop", width: 1280, height: 800 },
    { name: "mobile", width: 375, height: 667 },
  ];

  if (!fs.existsSync("results")) fs.mkdirSync("results");

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const screenshotPath = `results/${vp.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const referencePath = `references/${vp.name}.png`;
    if (!fs.existsSync(referencePath)) {
      console.warn(`⚠️ No reference found for ${vp.name}, skipping comparison.`);
      continue;
    }

    const img1 = PNG.sync.read(fs.readFileSync(referencePath));
    const img2 = PNG.sync.read(fs.readFileSync(screenshotPath));
    const { width, height } = img1;

    const diff = new PNG({ width, height });
    const mismatches = pixelmatch(img1.data, img2.data, diff.data, width, height, {
      threshold: 0.1,
    });

    fs.writeFileSync(`results/${vp.name}-diff.png`, PNG.sync.write(diff));

    console.log(`${vp.name}: ${mismatches} mismatches`);
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});