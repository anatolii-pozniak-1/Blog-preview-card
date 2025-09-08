#!/usr/bin/env node
// generate-report.js
// Usage: node generate-report.js <has_changes.txt> <current.png> <reference.png> <diff.png> <output.html>

import fs from "fs";

const [,, hasChangesPath, currentPath, referencePath, diffPath, outputPath] = process.argv;

if (!hasChangesPath || !currentPath || !referencePath || !diffPath || !outputPath) {
  console.error("Usage: node generate-report.js <has_changes.txt> <current.png> <reference.png> <diff.png> <output.html>");
  process.exit(1);
}

const hasChanges = fs.readFileSync(hasChangesPath, "utf8").trim() === "true";
const status_class = hasChanges ? "status-changed" : "status-unchanged";
const status_text = hasChanges ? "CHANGED" : "UNCHANGED";
const date = new Date().toLocaleString();

const html = `<!DOCTYPE html>
<html>
<head>
  <title>Snapshot Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .comparison { border: 1px solid #ccc; margin: 20px 0; padding: 20px; }
    .images { display: flex; gap: 20px; flex-wrap: wrap; }
    .image-container { flex: 1; min-width: 300px; }
    .image-container img { max-width: 100%; height: auto; border: 1px solid #ddd; }
    .status-changed { background-color: #fff3cd; }
    .status-unchanged { background-color: #f8f9fa; }
    h1 { color: #333; }
    h2 { color: #666; }
  </style>
</head>
<body>
  <h1>HTML/CSS Snapshot Test Report</h1>
  <p>Generated on: ${date}</p>
  <div class="comparison ${status_class}">
    <h2>index.html - ${status_text}</h2>
    <div class="images">
      <div class="image-container">
        <h3>Current</h3>
        <img src="current/current.png" alt="Current snapshot">
      </div>
      <div class="image-container">
        <h3>Reference</h3>
        <img src="../../.github/snapshots/reference.png" alt="Reference snapshot">
      </div>
      <div class="image-container">
        <h3>Difference</h3>
        <img src="diff/diff.png" alt="Difference">
      </div>
    </div>
  </div>
</body></html>
`;

fs.writeFileSync(outputPath, html);
console.log(`Report generated: ${outputPath}`);
