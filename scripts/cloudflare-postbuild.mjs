import fs from 'fs';
import path from 'path';

// Get absolute path to the .open-next directory
const openNextDir = path.resolve('.open-next');
const workerSrc = path.join(openNextDir, 'worker.js');
const workerDest = path.join(openNextDir, '_worker.js');
const assetsDir = path.join(openNextDir, 'assets');

console.log('--- Running Cloudflare Pages Post-Build Script ---');

// 1. Rename worker.js to _worker.js
if (fs.existsSync(workerSrc)) {
  fs.renameSync(workerSrc, workerDest);
  console.log('✅ Renamed worker.js to _worker.js');
} else {
  console.log('⚠️ worker.js not found in .open-next');
}

// 2. Copy the contents of the assets/ directory to the root of .open-next/
// Cloudflare Pages expects static assets at the root of the output directory
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, openNextDir, { recursive: true });
  console.log('✅ Copied static assets to the root of .open-next');
} else {
  console.log('⚠️ assets directory not found in .open-next');
}

// 3. Generate _routes.json for Cloudflare Pages
// This ensures static assets are served directly by CF Pages and not routed to _worker.js (which 404s them)
const routesJson = {
  version: 1,
  include: ["/*"],
  exclude: [
    "/_next/static/*",
    "/favicon.ico",
    "/manifest.json",
    "/icon.svg",
    "/sw.js"
  ]
};

fs.writeFileSync(
  path.join(openNextDir, '_routes.json'),
  JSON.stringify(routesJson, null, 2)
);
console.log('✅ Generated _routes.json for proper static asset routing');

console.log('--- Post-Build Script Complete ---');
