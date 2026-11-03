import fs from 'node:fs';
import path from 'node:path';

// Generate static OG fallback SVG and icons if needed
const ROOT = path.resolve();
const PUBLIC_BRAND = path.join(ROOT, 'apps/web/public/brand');

async function main() {
  console.log('--- Pegbox Brand Asset Verification ---');
  if (!fs.existsSync(PUBLIC_BRAND)) {
    console.error('Missing public/brand folder.');
    process.exit(1);
  }

  const requiredIcons = [
    'pegbox-icon.svg',
    'pegbox-logo.svg',
    'pegbox-favicon.svg',
    'png/favicon.ico',
    'png/icon-192.png',
    'png/icon-512.png',
    'png/apple-touch-icon.png',
  ];

  for (const item of requiredIcons) {
    const p = path.join(PUBLIC_BRAND, item);
    if (!fs.existsSync(p)) {
      console.warn(`Warning: Missing ${item}`);
    } else {
      console.log(`✓ Verified ${item}`);
    }
  }

  // Create static social OG card SVG
  const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#FFFFFF"/>
    <rect x="80" y="80" width="56" height="56" rx="14" fill="#6D4AFF"/>
    <rect x="96" y="96" width="24" height="24" rx="6" fill="#FFFFFF"/>
    <text x="156" y="122" font-family="system-ui, sans-serif" font-weight="bold" font-size="42" fill="#0F1222">Peg<tspan fill="#6D4AFF">box</tspan></text>
    <text x="80" y="320" font-family="system-ui, sans-serif" font-weight="bold" font-size="64" fill="#0F1222">Pick a tool. Drop a file. Done.</text>
    <text x="80" y="380" font-family="system-ui, sans-serif" font-size="28" fill="#5B6078">Browser-native file tools for creators. 100% Free · Zero uploads.</text>
    <line x1="80" y1="520" x2="1120" y2="520" stroke="#E4E6F0" stroke-width="2"/>
    <text x="80" y="565" font-family="system-ui, sans-serif" font-weight="600" font-size="20" fill="#0F1222">Runs in your browser · Your files never leave your device</text>
    <text x="1120" y="565" text-anchor="end" font-family="system-ui, sans-serif" font-weight="600" font-size="20" fill="#6D4AFF">pegbox.vercel.app</text>
  </svg>`;

  fs.writeFileSync(path.join(PUBLIC_BRAND, 'og-card.svg'), ogSvg);
  console.log('✓ Generated public/brand/og-card.svg');
}

main().catch(console.error);

