/**
 * This script converts SVG icons to PNG format using sharp.
 * To use it, you need to install sharp: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define the sizes
const sizes = [16, 48, 128];

// Convert each SVG file to PNG
async function convertSvgToPng() {
    for (const size of sizes) {
        const svgPath = path.join(__dirname, `icon${size}.svg`);
        const pngPath = path.join(__dirname, `icon${size}.png`);

        if (fs.existsSync(svgPath)) {
            try {
                console.log(`Converting icon${size}.svg to PNG...`);
                await sharp(svgPath)
                    .png()
                    .toFile(pngPath);
                console.log(`Created icon${size}.png successfully`);
            } catch (error) {
                console.error(`Error converting icon${size}.svg:`, error);
            }
        } else {
            console.error(`SVG file not found: icon${size}.svg`);
        }
    }
}

convertSvgToPng().then(() => {
    console.log('Icon conversion completed.');
}).catch(err => {
    console.error('Error during conversion:', err);
}); 