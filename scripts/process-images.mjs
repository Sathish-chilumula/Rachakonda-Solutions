import sharp from 'sharp';

async function process() {
  console.log('Processing founder and logo images...');
  
  // 1. Founder portrait
  await sharp('public/images/founder_prashanth_raw.jpg')
    .resize(600, 750, { fit: 'cover', position: 'top' })
    .webp({ quality: 85 })
    .toFile('public/images/founder-prashanth.webp');

  await sharp('public/images/founder_prashanth_raw.jpg')
    .resize(600, 750, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 85, progressive: true })
    .toFile('public/images/founder-prashanth.jpg');

  // Square avatar for team cards
  await sharp('public/images/founder_prashanth_raw.jpg')
    .resize(400, 400, { fit: 'cover', position: 'top' })
    .webp({ quality: 85 })
    .toFile('public/images/founder-prashanth-square.webp');

  await sharp('public/images/founder_prashanth_raw.jpg')
    .resize(400, 400, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 85, progressive: true })
    .toFile('public/images/founder-prashanth-square.jpg');

  // 2. Official Logo
  await sharp('public/images/logo_raw.jpg')
    .resize(600, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .webp({ quality: 90 })
    .toFile('public/images/logo.webp');

  await sharp('public/images/logo_raw.jpg')
    .resize(600, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile('public/images/logo.png');

  // Small logo icon
  await sharp('public/images/logo_raw.jpg')
    .resize(128, 128, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile('public/logo-icon.png');

  console.log('✅ Finished generating all founder and logo variants successfully!');
}

process().catch(err => {
  console.error('Error processing images:', err);
  process.exit(1);
});
