const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImages() {
    const input = path.join(__dirname, 'assets', 'logo.jpg');
    const outputLogo = path.join(__dirname, 'assets', 'logo.png');
    const outputIcon = path.join(__dirname, 'assets', 'icon.png');
    const outputAdaptive = path.join(__dirname, 'assets', 'adaptive-icon.png');
    const outputSplash = path.join(__dirname, 'assets', 'splash.png');

    if (!fs.existsSync(input)) {
        console.error('Error: assets/logo.jpg not found');
        process.exit(1);
    }

    console.log('Processing logo.jpg...');

    // Standard Icon & Logo (1024x1024)
    await sharp(input)
        .resize(1024, 1024)
        .toFormat('png')
        .toFile(outputLogo);
    console.log('Created logo.png');

    // Icon (1024x1024) - same as logo for Expo
    fs.copyFileSync(outputLogo, outputIcon);
    console.log('Created icon.png');

    // Adaptive Icon (Foreground) - 1024x1024 is fine, often 432x432 is used for inner content but Expo recommends 1024
    await sharp(input)
        .resize(1024, 1024)
        .toFormat('png')
        .toFile(outputAdaptive);
    console.log('Created adaptive-icon.png');

    // Splash Screen (Resize to contain within typical phone screen, e.g. 1284x2778 or similar, or just a high res square to be centered)
    // Expo splash image is usually centered. Keeping it 1024w is fine.
    await sharp(input)
        .resize(1284, 2778, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toFormat('png')
        .toFile(outputSplash);
    console.log('Created splash.png');
}

processImages().catch(err => {
    console.error(err);
    process.exit(1);
});
