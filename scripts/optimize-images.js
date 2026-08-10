import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const sharpModule = await import('sharp').catch(() => null);
    if (!sharpModule) {
      console.log('Sharp is not installed in node_modules, installing or skipping sharp conversion...');
      return;
    }
    const sharp = sharpModule.default;
    const publicDir = path.resolve(__dirname, '../public');
    
    const files = fs.readdirSync(publicDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        const filePath = path.join(publicDir, file);
        const webpPath = path.join(publicDir, path.basename(file, ext) + '.webp');
        
        console.log(`Optimizing ${file}...`);
        await sharp(filePath)
          .webp({ quality: 80 })
          .toFile(webpPath);
          
        const origSize = fs.statSync(filePath).size;
        const newSize = fs.statSync(webpPath).size;
        console.log(`Converted ${file}: ${(origSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB`);
      }
    }
  } catch (err) {
    console.error('Error optimizing images:', err);
  }
}

run();
