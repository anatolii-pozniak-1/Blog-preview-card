#!/usr/bin/env node
// compare-images.js
// Usage: node compare-images.js <reference.png> <current.png> <diff.png> [threshold] [matchPercent]

import fs from "fs";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const [,, refPath, currentPath, diffPath, thresholdArg, matchPercentArg] = process.argv;

if (!refPath || !currentPath || !diffPath) {
  console.error("Usage: node compare-images.js <reference.png> <current.png> <diff.png> [threshold] [matchPercent]");
  process.exit(1);
}

const threshold = thresholdArg ? parseFloat(thresholdArg) : 0.1;
const minMatchPercent = matchPercentArg ? parseFloat(matchPercentArg) : 0.8;

const img1 = PNG.sync.read(fs.readFileSync(refPath));
const img2 = PNG.sync.read(fs.readFileSync(currentPath));
const { width, height } = img1;
const diff = new PNG({ width, height });
const mismatches = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold });
fs.writeFileSync(diffPath, PNG.sync.write(diff));
const totalPixels = width * height;
const percentMatch = 1 - mismatches / totalPixels;
const hasChanges = percentMatch < minMatchPercent;
fs.writeFileSync("snapshots/has_changes.txt", hasChanges ? "true" : "false");
console.log(`Pixelmatch: ${mismatches} mismatches, match: ${(percentMatch*100).toFixed(2)}%`);
if (hasChanges) process.exit(2);
