const { runCommand } = require('../utils');

async function main() {
  try {
    console.log('\n=== Starting Docker Containers ===');
    await runCommand('docker', ['compose', 'up', '-d']);
  } catch (e) {
    console.error('\n❌ Docker start failed:', e.message);
    process.exit(1);
  }
}

main();
