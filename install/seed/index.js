const { runCommand } = require('../utils');
const { getJwt } = require('./utils');
const ProgressBar = require('../progress');
const { exec } = require('child_process');

function runScript(scriptPath, env = {}) {
  return new Promise((resolve, reject) => {
    // Increase maxBuffer to 10MB to handle large JSON output
    const child = exec(`node ${scriptPath}`, { 
        env: { ...process.env, ...env },
        maxBuffer: 1024 * 1024 * 10 
    });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
    });

    child.stderr.on('data', (data) => {
      stderr += data;
    });

    child.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr || `Script failed with code ${code}`));
    });
  });
}

async function main() {
  const steps = [
    { name: 'Sports', script: 'install/seed/steps/01_sports.js', key: 'sports' },
    { name: 'POIs', script: 'install/seed/steps/02_pois.js', key: 'pois' },
    { name: 'Profiles', script: 'install/seed/steps/03_profiles.js', key: 'profiles' },
    { name: 'Events', script: 'install/seed/steps/04_events.js', key: 'events' },
    { name: 'Permissions', script: 'install/seed/steps/05_permissions.js', key: 'permissions' }
  ];

  const progressBar = new ProgressBar(steps.length, 'Seeding Progress');
  const idMap = { sports: {}, pois: {}, profiles: {}, users: {} };

  try {
    console.log('🌱 Starting Seed Process...');
    progressBar.update(0, 'Starting...');

    // Login once to get JWT
    const jwt = await getJwt();
    if (!jwt) {
        throw new Error('Could not authenticate with Strapi. Please check your credentials.');
    }
    const globalEnv = { STRAPI_JWT: jwt };

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      progressBar.update(i, `Seeding ${step.name}...`);
      
      try {
        // Pass ID map and JWT to sub-scripts via env
        const env = { 
            ...globalEnv,
            ID_MAP: JSON.stringify(idMap) 
        };
        const output = await runScript(step.script, env);
        
        // Parse output to update ID map
        if (output && output.startsWith('{')) {
            try {
                const data = JSON.parse(output);
                if (step.key === 'profiles') {
                    Object.assign(idMap.profiles, data.profiles);
                    Object.assign(idMap.users, data.users);
                } else if (step.key) {
                    Object.assign(idMap[step.key], data);
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }
      } catch (e) {
         // console.error(`\n❌ Step ${step.name} failed:`, e.message);
         throw e; // Fail fast if a step fails
      }
      
      progressBar.update(i + 1, `${step.name} seeded`);
    }

    progressBar.finish('Seeding completed successfully!');
    process.exit(0);

  } catch (e) {
    console.error('\n❌ Seeding failed:', e.message);
    process.exit(1);
  }
}

main();
