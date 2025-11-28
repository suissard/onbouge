const http = require('http');
const { runCommand, waitForStrapi, loadEnv } = require('../utils');

function loginAdmin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 1337,
      path: '/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    req.on('error', (e) => resolve(false));
    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    await waitForStrapi();

    console.log('\n=== Creating Strapi Admin User ===');
    const envConfig = loadEnv();
    const email = envConfig.STRAPI_ADMIN_EMAIL || 'admin@example.com';
    const password = envConfig.STRAPI_ADMIN_PASSWORD || 'Password123!';
    const firstname = envConfig.STRAPI_ADMIN_FIRSTNAME || 'Admin';
    const lastname = envConfig.STRAPI_ADMIN_LASTNAME || 'User';

    try {
        await runCommand('docker', [
            'compose', 'exec', '-w', '/opt/app/strapi', 'strapi', 
            'npm', 'run', 'strapi', 'admin:create', '--', 
            `--email=${email}`, 
            `--password=${password}`, 
            `--firstname=${firstname}`, 
            `--lastname=${lastname}`
        ]);
        console.log('Strapi Admin created.');
    } catch (e) {
        console.log('Admin creation failed (user likely exists). Attempting login...');
        const success = await loginAdmin(email, password);
        if (success) {
            console.log('✅ Admin authenticated successfully.');
        } else {
            console.log('⚠️ Could not login as admin. Credentials might be different or Strapi is not responding.');
        }
    }
    process.exit(0);
  } catch (e) {
    console.error('\n❌ Strapi admin setup failed:', e.message);
    process.exit(1);
  }
}

main();
