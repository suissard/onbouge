const { runCommand, waitForStrapi } = require('../utils');

async function main() {
  try {
    console.log('\n=== Installing Strapi Schemas and Custom Code ===');
    await runCommand('node', ['install/strapi/install_schemas.js']);

    console.log('Copying custom code...');
    // Copy custom routes, controllers, and lifecycles
    // We use docker cp to copy from host to container
    try {
        await runCommand('docker', ['cp', 'install/strapi/custom/api/poi/routes/custom-poi.js', 'strapi:/opt/app/strapi/src/api/poi/routes/']);
        await runCommand('docker', ['cp', 'install/strapi/custom/api/poi/controllers/poi.js', 'strapi:/opt/app/strapi/src/api/poi/controllers/']);
        await runCommand('docker', ['cp', 'install/strapi/custom/api/poi/content-types/poi/lifecycles.js', 'strapi:/opt/app/strapi/src/api/poi/content-types/poi/']);
        console.log('Custom code installed.');
    } catch (e) {
        console.error('Failed to copy custom code:', e.message);
    }

    // Restart Strapi to apply schemas
    console.log('\n=== Restarting Strapi to apply schemas ===');
    await runCommand('docker', ['compose', 'restart', 'strapi']);

    // Wait for Strapi again
    await waitForStrapi();
    process.exit(0);
  } catch (e) {
    console.error('\n❌ Schema installation failed:', e.message);
    process.exit(1);
  }
}

main();
