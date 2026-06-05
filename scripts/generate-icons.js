#!/usr/bin/env node
// Run: node scripts/generate-icons.js
// Generates simple placeholder icons. Replace with real ones before launch.

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function makeSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0f172a"/>
  <rect x="${size*0.1}" y="${size*0.1}" width="${size*0.8}" height="${size*0.8}" rx="${size*0.15}" fill="#1e293b"/>
  <text x="50%" y="55%" font-family="system-ui" font-weight="900" font-size="${size*0.45}" fill="#6366f1" text-anchor="middle" dominant-baseline="middle">💰</text>
</svg>`;
}

// Write SVG icons (browsers accept SVG for PWA)
['192', '512'].forEach(size => {
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}.svg`),
    makeSvg(parseInt(size))
  );
  console.log(`✓ Created icon-${size}.svg`);
});

// Apple touch icon
fs.writeFileSync(
  path.join(iconsDir, 'apple-touch-icon.svg'),
  makeSvg(180)
);
console.log('✓ Created apple-touch-icon.svg');

console.log('\n⚠️  These are placeholder icons. For a real app:');
console.log('   → Use https://realfavicongenerator.net to generate proper icons');
console.log('   → Replace the SVG files with proper PNG files');
