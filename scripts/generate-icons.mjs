// Generates all required PWA icon sizes from the QuitLoop logo SVG using sharp.
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// ── Source logo SVG (viewBox 0 0 500 500, scaled by sharp at render time) ────
function getLogoSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ring-grad" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%"   stop-color="#FFFFFF"/>
      <stop offset="40%"  stop-color="#CCCCCC"/>
      <stop offset="100%" stop-color="#666666"/>
    </linearGradient>
    <linearGradient id="tail-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#CCCCCC"/>
      <stop offset="100%" stop-color="#444444"/>
    </linearGradient>
    <linearGradient id="dot-grad" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%"   stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#888888"/>
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="#0A0A0A" rx="100"/>
  <circle cx="232" cy="225" r="108" fill="none"
    stroke="url(#ring-grad)" stroke-width="38"/>
  <line x1="308" y1="304" x2="406" y2="406"
    stroke="url(#tail-grad)" stroke-width="38" stroke-linecap="round"/>
  <circle cx="232" cy="225" r="22" fill="url(#dot-grad)"/>
  <circle cx="226" cy="219" r="7" fill="white" opacity="0.4"/>
</svg>`;
}

async function main() {
  // PWA icons — all sizes
  for (const size of sizes) {
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(Buffer.from(getLogoSVG(size))).resize(size, size).png().toFile(outputPath);
    console.log(`✓ icon-${size}x${size}.png`);
  }

  // Apple touch icon (180×180)
  await sharp(Buffer.from(getLogoSVG(180)))
    .resize(180, 180)
    .png()
    .toFile(join(iconsDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // Favicon PNGs (16 and 32)
  for (const size of [16, 32]) {
    await sharp(Buffer.from(getLogoSVG(size)))
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `favicon-${size}x${size}.png`));
    console.log(`✓ favicon-${size}x${size}.png`);
  }

  // Static SVG for use as an SVG favicon or external reference
  const svgPath = join(__dirname, '..', 'public', 'logo.svg');
  writeFileSync(svgPath, getLogoSVG(500));
  console.log('✓ logo.svg');

  console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
