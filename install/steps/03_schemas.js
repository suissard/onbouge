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
        await runCommand('docker', ['cp', 'install/strapi/custom/api/event/content-types/event/lifecycles.js', 'strapi:/opt/app/strapi/src/api/event/content-types/event/']);
        await runCommand('docker', ['cp', 'install/strapi/custom/api/activity/content-types/activity/lifecycles.js', 'strapi:/opt/app/strapi/src/api/activity/content-types/activity/']);
        await runCommand('docker', ['cp', 'install/strapi/custom/api/profile/content-types/profile/lifecycles.js', 'strapi:/opt/app/strapi/src/api/profile/content-types/profile/']);

        // Copy custom utils and policies
        await runCommand('docker', ['exec', 'strapi', 'mkdir', '-p', '/opt/app/strapi/src/utils', '/opt/app/strapi/src/policies']);

        await runCommand('docker', ['cp', 'install/strapi/custom/policies/is-owner.js', 'strapi:/opt/app/strapi/src/policies/']);

        // Copy custom routes with policies
        await runCommand('docker', ['cp', 'install/strapi/custom/api/event/routes/event.js', 'strapi:/opt/app/strapi/src/api/event/routes/']);
        await runCommand('docker', ['cp', 'install/strapi/custom/api/poi/routes/poi.js', 'strapi:/opt/app/strapi/src/api/poi/routes/']);
        await runCommand('docker', ['cp', 'install/strapi/custom/api/profile/routes/profile.js', 'strapi:/opt/app/strapi/src/api/profile/routes/']);
        await runCommand('docker', ['cp', 'install/strapi/custom/api/activity/routes/activity.js', 'strapi:/opt/app/strapi/src/api/activity/routes/']);
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
