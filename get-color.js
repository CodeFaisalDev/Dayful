const sharp = require('sharp');
const path = require('path');

async function getColor() {
    const image = sharp(path.join(__dirname, 'assets', 'logo.jpg'));
    const { data, info } = await image
        .extract({ left: 0, top: 0, width: 1, height: 1 })
        .raw()
        .toBuffer({ resolveWithObject: true });

    const r = data[0];
    const g = data[1];
    const b = data[2];

    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    console.log(`Background Color: ${hex}`);
}

getColor().catch(console.error);
