const { execSync } = require('child_process');

try {
  console.log('Checking if Vercel is installed...');
  try {
    execSync('npx vercel --version', { stdio: 'ignore' });
    console.log('Vercel CLI is ready.');
  } catch (e) {
    console.log('Installing Vercel CLI locally so you can upload...');
    execSync('npm install vercel --save-dev', { stdio: 'inherit' });
  }

  console.log('\nStarting upload to Vercel Cloud...');
  console.log('====================================');
  console.log('This will upload your HTML, CSS, JS, and the photos folder.');
  console.log('If this is your first time, you will be prompted to log in and set up a project name.');
  console.log('====================================\n');
  
  // Run vercel production deployment
  execSync('npx vercel --prod', { stdio: 'inherit' });
  
  console.log('\nUpload complete! Your website is now live in the cloud.');
} catch (error) {
  console.error('\nDeployment failed:', error.message);
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure you have Node.js installed.');
  console.log('2. Try running: npm install -g vercel');
  console.log('3. Then run: vercel --prod');
}
