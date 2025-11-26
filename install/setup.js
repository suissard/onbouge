const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const STRAPI_URL = 'http://localhost:1337';
const MAX_RETRIES = 60; // 5 minutes approx (if 5s interval)
const RETRY_INTERVAL = 5000;

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`> ${command} ${args.join(' ')}`);
    const child = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

function checkStrapi() {
  return new Promise((resolve, reject) => {
    const req = http.get(STRAPI_URL, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) resolve();
      else reject(new Error(`Status ${res.statusCode}`));
    });
    req.on('error', reject);
    req.end();
  });
}

async function waitForStrapi() {
  console.log('Waiting for Strapi to be ready...');
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await checkStrapi();
      console.log('Strapi is ready!');
      return;
    } catch (e) {
      process.stdout.write('.');
      await new Promise(r => setTimeout(r, RETRY_INTERVAL));
    }
  }
  throw new Error('Timeout waiting for Strapi');
}

async function main() {
  try {
    // 0. Install Dependencies
    console.log('\n=== Installing Dependencies ===');
    console.log('Installing dependencies in install/strapi...');
    await runCommand('npm', ['install'], { cwd: 'install/strapi' });
    
    console.log('Installing dependencies in frontend...');
    await runCommand('npm', ['install'], { cwd: 'frontend' });

    // 1. Start Docker
    console.log('\n=== Starting Docker Containers ===');
    await runCommand('docker', ['compose', 'up', '-d']);

    // Load env vars from .env file
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    const envConfig = {};
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2 && !line.startsWith('#')) {
        envConfig[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });

    // 1b. Create Portainer Admin (via API)
    console.log('\n=== Creating Portainer Admin User ===');
    const portainerPassword = envConfig.PORTAINER_ADMIN_PASSWORD || 'Password123!123';
    
    const https = require('https');
    const portainerData = JSON.stringify({ username: "admin", password: portainerPassword });
    
    const portainerReq = https.request({
        hostname: 'localhost',
        port: 9443,
        path: '/api/users/admin/init',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': portainerData.length
        },
        rejectUnauthorized: false // Ignore self-signed cert
    }, (res) => {
        if (res.statusCode === 200 || res.statusCode === 204) {
            console.log('Portainer Admin created.');
        } else if (res.statusCode === 409) {
            console.log('Portainer Admin already initialized.');
        } else {
            console.log(`Portainer init returned status: ${res.statusCode}`);
        }
    });
    
    portainerReq.on('error', (e) => {
        console.log('Could not connect to Portainer to init admin (is it running?): ' + e.message);
    });
    
    portainerReq.write(portainerData);
    portainerReq.end();

    // 2. Wait for Strapi
    await waitForStrapi();

    // 2b. Create Strapi Admin
    console.log('\n=== Creating Strapi Admin User ===');
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
        console.log('Strapi Admin created (or already exists).');
    } catch (e) {
        console.log('Note: Admin creation might have failed if user already exists or other error. Continuing...');
    }


    // 3. Install Schemas
    console.log('\n=== Installing Strapi Schemas ===');
    await runCommand('node', ['install/strapi/install_schemas.js']);

    // 4. Restart Strapi to apply schemas
    console.log('\n=== Restarting Strapi to apply schemas ===');
    await runCommand('docker', ['compose', 'restart', 'strapi']);

    // 5. Wait for Strapi again
    await waitForStrapi();

    console.log('\n✅ Setup completed successfully!');
    console.log('You can now access the app at http://localhost:3000');
    console.log('To seed mock data, run: npm run seed');
    process.exit(0);

  } catch (e) {
    console.error('\n❌ Setup failed:', e.message);
    process.exit(1);
  }
}

main();
