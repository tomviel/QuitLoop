// Generates all required PWA icon sizes using sharp + SVG
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSVG(size) {
  const padding = Math.round(size * 0.12);
  const circleR = Math.round((size / 2) - padding);
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = Math.round(size * 0.28);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0A0A0A"/>
  <circle cx="${cx}" cy="${cy}" r="${circleR}" fill="#C0392B"/>
  <text
    x="${cx}"
    y="${cy}"
    font-family="Arial, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
    letter-spacing="-1"
  >QL</text>
</svg>`;
}

async function main() {
  for (const size of sizes) {
    const svg = generateSVG(size);
    const svgBuffer = Buffer.from(svg);
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer).png().toFile(outputPath);
    console.log(`Generated ${outputPath}`);
  }

  // Apple touch icon (180x180)
  const appleIconSvg = generateSVG(180);
  await sharp(Buffer.from(appleIconSvg)).png().toFile(join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Favicon 32x32
  const faviconSvg = generateSVG(32);
  await sharp(Buffer.from(faviconSvg)).png().toFile(join(iconsDir, 'favicon-32x32.png'));

  // Favicon 16x16
  const favicon16Svg = generateSVG(16);
  await sharp(Buffer.from(favicon16Svg)).png().toFile(join(iconsDir, 'favicon-16x16.png'));

  console.log('All icons generated successfully!');
}

main().catch(console.error);
