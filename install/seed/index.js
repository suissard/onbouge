const { runCommand } = require('../utils');
const { getJwt } = require('./utils');
const MultiStepLoader = require('../loader');
const { spawn } = require('child_process');

function runScript(scriptPath, env = {}, onProgress) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], { 
        env: { ...process.env, ...env },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
      // If the sub-script outputs JSON at the end, we don't want to show that as "progress" usually,
      // but if it outputs other things, we might. 
      // For now, let's assume stdout is mostly the final JSON, so we might not want to show it 
      // unless it's NOT json. But detecting that is hard.
      // Let's just NOT show stdout as progress for seed scripts, as they are designed to output JSON.
    });

    child.stderr.on('data', (data) => {
      stderr += data;
      if (onProgress) {
          const lines = data.toString().split('\n');
          for (const line of lines) {
              if (line.startsWith('PROGRESS: ')) {
                  const progressText = line.replace('PROGRESS: ', '').trim();
                  onProgress(progressText);
              }
          }
      }
    });

    child.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr || `Script failed with code ${code}`));
    });
  });
}

async function main() {
  const steps = [
   { name: 'Profiles (Create)', script: 'install/seed/steps/03_profiles.js', key: 'profiles' },
    { name: 'Activities', script: 'install/seed/steps/01_activities.js', key: 'activities' },
    { name: 'Profiles (Link)', script: 'install/seed/steps/03_profiles.js', key: 'profiles' },
    { name: 'POIs', script: 'install/seed/steps/02_pois.js', key: 'pois' },
    { name: 'Events', script: 'install/seed/steps/04_events.js', key: 'events' }
  ];

  const loader = new MultiStepLoader(steps);
  const idMap = { activities: {}, pois: {}, profiles: {}, users: {} };

  try {
    loader.start();

    // Login once to get JWT
    // We can't easily show this as a step unless we add it to steps array, 
    // but the user might expect "Starting..." then the steps.
    // Let's just do it before the loop.
    
    // Actually, getting JWT might take a moment, maybe we should add it as a hidden step or just wait?
    // Let's just run it.
    const jwt = await getJwt();
    if (!jwt) {
        throw new Error('Could not authenticate with Strapi. Please check your credentials.');
    }
    const globalEnv = { STRAPI_JWT: jwt };

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      loader.startStep(i);
      
      try {
        // Pass ID map and JWT to sub-scripts via env
        const env = { 
            ...globalEnv,
            ID_MAP: JSON.stringify(idMap) 
        };
        
        const output = await runScript(step.script, env, (data) => {
            loader.updateStep(i, data);
        });
        
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
        loader.succeedStep(i);
      } catch (e) {
         let errorDetail = e.message;
         
         // Extract a concise error message
         const lines = errorDetail.split('\n');
         const errorMatch = errorDetail.match(/(?:Error:|Exception:|Failure:|fatal:).*/i);
         
         if (errorMatch) {
             errorDetail = errorMatch[0].trim();
         } else {
             const lastLine = lines.filter(l => l.trim().length > 0).pop();
             if (lastLine) errorDetail = lastLine.trim();
         }

         if (errorDetail.length > 90) errorDetail = errorDetail.substring(0, 90) + '...';

         loader.failStep(i, errorDetail);
         loader.stop();
         console.error(`\n❌ Step ${step.name} failed:`, e.message);
         throw e; 
      }
    }

    loader.stop();
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);

  } catch (e) {
    loader.stop();
    console.error('\n❌ Seeding failed:', e.message);
    process.exit(1);
  }
}

main();
