const { runCommand, waitForStrapi, loadEnv } = require('../utils');

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
        console.log('Strapi Admin created (or already exists).');
    } catch (e) {
        console.log('Note: Admin creation might have failed if user already exists or other error. Continuing...');
    }
  } catch (e) {
    console.error('\n❌ Strapi admin setup failed:', e.message);
    process.exit(1);
  }
}

main();
