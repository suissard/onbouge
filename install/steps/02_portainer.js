const https = require('https');
const { loadEnv } = require('../utils');

async function main() {
  try {
    const envConfig = loadEnv();
    console.log('\n=== Creating Portainer Admin User ===');
    const portainerPassword = envConfig.PORTAINER_ADMIN_PASSWORD || 'Password123!123';
    
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
  } catch (e) {
    console.error('\n❌ Portainer setup failed:', e.message);
    process.exit(1);
  }
}

main();
