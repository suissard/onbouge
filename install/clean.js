const { runCommand, checkProd } = require('./utils');

async function main() {
  try {
    // Check if we are in production and prompt user if needed
    await checkProd();

    console.log('Cleaning up project...');
    
    // Stop containers and remove volumes/orphans
    await runCommand('sudo docker compose down -v --remove-orphans', [], { shell: true });
    
    // Remove data directories
    await runCommand('sudo rm -rf data_mysql data_caddy data_strapi', [], { shell: true });
    
    console.log('✅ Cleanup completed successfully.');
  } catch (e) {
    console.error('❌ Cleanup failed:', e.message);
    process.exit(1);
  }
}

main();
