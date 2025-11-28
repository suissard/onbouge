const { runCommand } = require('../utils');

async function main() {
  try {
    console.log('\n=== Installing Dependencies ===');
    console.log('Installing dependencies in install/strapi...');
    await runCommand('npm', ['install'], { cwd: 'install/strapi' });
    
    console.log('Installing dependencies in frontend...');
    await runCommand('npm', ['install'], { cwd: 'frontend' });
  } catch (e) {
    console.error('\n❌ Dependencies installation failed:', e.message);
    process.exit(1);
  }
}

main();
