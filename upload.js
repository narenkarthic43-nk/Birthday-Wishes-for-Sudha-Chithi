const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, 'photos');
const WISHES_HTML = path.join(__dirname, 'wishes.html');
const WISHES_JS = path.join(__dirname, 'wishes.js');

// Order of images as they appear in the HTML
const imageFiles = [
  'sudha_hero.jpeg',
  'sudha_hero (1).jpeg',
  'sudha_hero (2).jpeg',
  'sudha_hero (3).jpeg',
  'sudha_hero (4).jpeg',
  'sudha_hero (5).jpeg',
  'sudha_hero (6).jpeg',
  'sudha_hero (7).jpeg',
  'sudha_hero (8).jpeg',
  'sudha_hero (9).jpeg',
  'sudha_hero (10).jpeg',
  'sudha_hero (11).jpeg',
  'sudha_hero (12).jpeg',
  'sudha_hero (13).jpeg',
  'sudha_hero (14).jpeg',
  'sudha_hero (15).jpeg',
  'sudha_hero (16).jpeg'
];

async function uploadFile(fileName) {
  const filePath = path.join(PHOTOS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, fileName);

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed for ${fileName}: ${response.statusText}`);
  }

  const url = await response.text();
  return url.trim();
}

async function run() {
  console.log('Starting cloud upload for 17 images...');
  const urlMap = {};

  for (const file of imageFiles) {
    try {
      console.log(`Uploading ${file}...`);
      const url = await uploadFile(file);
      if (url) {
        console.log(`Uploaded! URL: ${url}`);
        urlMap[file] = url;
      }
    } catch (err) {
      console.error(`Error uploading ${file}:`, err.message);
    }
  }

  if (Object.keys(urlMap).length === 0) {
    console.error('No images uploaded. Aborting file updates.');
    return;
  }

  console.log('\nAll uploads finished. Updating wishes.html and wishes.js...');
  let htmlContent = fs.readFileSync(WISHES_HTML, 'utf8');
  let jsContent = fs.readFileSync(WISHES_JS, 'utf8');

  for (const [file, url] of Object.entries(urlMap)) {
    // Replace local paths in HTML
    const localHtmlPath = `photos/${file}`;
    htmlContent = htmlContent.replaceAll(localHtmlPath, url);

    // Replace local paths in JS array
    const localJsPath = `photos/${file}`;
    jsContent = jsContent.replaceAll(localJsPath, url);
  }

  fs.writeFileSync(WISHES_HTML, htmlContent, 'utf8');
  fs.writeFileSync(WISHES_JS, jsContent, 'utf8');
  console.log('\nSuccess! wishes.html and wishes.js have been updated with cloud URLs!');
}

run();
