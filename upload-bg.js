const fs = require('fs');
const path = require('path');

const STYLE_CSS = path.join(__dirname, 'style.css');
const PHOTO_FILE = 'WhatsApp Image 2026-06-07 at 11.09.57 PM.jpeg';
const PHOTO_PATH = path.join(__dirname, 'photos', PHOTO_FILE);

async function uploadFile() {
  if (!fs.existsSync(PHOTO_PATH)) {
    console.error(`File not found: ${PHOTO_PATH}`);
    return;
  }

  console.log(`Uploading background image: ${PHOTO_FILE}...`);
  const fileBuffer = fs.readFileSync(PHOTO_PATH);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, PHOTO_FILE);

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const url = await response.text();
  const cloudUrl = url.trim();
  console.log(`Uploaded! Cloud URL: ${cloudUrl}`);

  console.log('Updating style.css...');
  let cssContent = fs.readFileSync(STYLE_CSS, 'utf8');
  
  // Replace the local URL with the cloud URL
  const localCssPath = "photos/WhatsApp%20Image%202026-06-07%20at%2011.09.57%20PM.jpeg";
  cssContent = cssContent.replace(localCssPath, cloudUrl);

  fs.writeFileSync(STYLE_CSS, cssContent, 'utf8');
  console.log('Success! style.css has been updated with the cloud browser link.');
}

uploadFile().catch(err => {
  console.error('Error:', err.message);
});
