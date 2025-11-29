#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Source and destination directories
const srcDir = path.join(__dirname, '..', 'src', 'test', 'fixtures');
const destDir = path.join(__dirname, '..', 'out', 'test', 'fixtures');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created directory: ${destDir}`);
}

// Copy all files from source to destination
const files = fs.readdirSync(srcDir);
let copiedCount = 0;

files.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    // Only copy files, not directories
    if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`Copied: ${file}`);
        copiedCount++;
    }
});

console.log(`\nSuccessfully copied ${copiedCount} fixture files to ${destDir}`);
