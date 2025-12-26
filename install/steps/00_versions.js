const { runCommand } = require('../utils');

async function getVersion(command, args) {
  let output = '';
  try {
    await runCommand(command, args, {}, (data) => {
      output += data;
    });
    return output.trim();
  } catch (e) {
    return null;
  }
}

function compareVersions(v1, v2) {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

async function main() {
  console.log('\n=== Checking System Prerequisites ===');
  
  const checks = [
    {
      name: 'Node.js',
      command: 'node',
      args: ['-v'],
      required: '22.0.0',
      parse: (out) => out.replace(/^v/, '')
    },
    {
      name: 'npm',
      command: 'npm',
      args: ['-v'],
      required: '10.0.0',
      parse: (out) => out
    },
    {
      name: 'Docker',
      command: 'docker',
      args: ['-v'],
      required: '24.0.0',
      parse: (out) => {
        const match = out.match(/version (\d+\.\d+\.\d+)/);
        return match ? match[1] : out;
      }
    },
    {
      name: 'Docker Compose',
      command: 'docker',
      args: ['compose', 'version'],
      required: '2.0.0',
      parse: (out) => {
        const match = out.match(/version v?(\d+\.\d+\.\d+)/);
        return match ? match[1] : out;
      }
    }
  ];

  let allPassed = true;

  for (const check of checks) {
    const rawVersion = await getVersion(check.command, check.args);
    if (!rawVersion) {
      console.error(`❌ ${check.name} is not installed or not in PATH.`);
      allPassed = false;
      continue;
    }

    const version = check.parse(rawVersion);
    if (compareVersions(version, check.required) >= 0) {
      console.log(`✅ ${check.name}: ${version} (required >= ${check.required})`);
    } else {
      console.error(`❌ ${check.name}: ${version} (required >= ${check.required})`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.error('\n❌ System prerequisites check failed. Please upgrade the missing packages.');
    process.exit(1);
  } else {
    console.log('\n✅ All system prerequisites are met!');
  }
}

main();
