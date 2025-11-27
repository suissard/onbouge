const { runCommand } = require('./utils');
const ProgressBar = require('./progress');

async function main() {
  const steps = [
    { name: 'Dependencies', script: 'install/steps/00_deps.js' },
    { name: 'Docker', script: 'install/steps/01_docker.js' },
    { name: 'Portainer', script: 'install/steps/02_portainer.js' },
    { name: 'Strapi Admin', script: 'install/steps/03_strapi_admin.js' },
    { name: 'Schemas', script: 'install/steps/04_schemas.js' },
    { name: 'Spatial Data', script: 'install/steps/05_spatial.js' }
  ];

  const progressBar = new ProgressBar(steps.length, 'Setup Progress');

  try {
    console.log('🚀 Starting Setup Process...');
    progressBar.update(0, 'Starting...');

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      progressBar.update(i, `Running ${step.name}...`);
      
      // Capture output to avoid messing up the progress bar, 
      // but we might want to log it to a file or show it if verbose.
      // For now, we'll just let it print to stdout but it might look a bit messy 
      // mixed with the progress bar. 
      // To keep it clean, we could silence the sub-scripts or just accept the interleaved output.
      // Given the user asked for "aesthetic loading", let's try to silence the sub-scripts 
      // and only show errors.
      
      try {
         await runCommand('node', [step.script], { stdio: 'pipe' }); 
      } catch (e) {
         // If silent, we need to re-run or show error. 
         // For simplicity in this iteration, let's just run them.
         // Actually, runCommand uses 'inherit' by default. Let's override it to 'ignore' or 'pipe' 
         // to keep the progress bar clean, but that hides important info.
         // A better approach for "aesthetic" is to clear screen or just print the bar at the bottom.
         // Let's stick to the simple bar for now, but maybe we should print the step name clearly.
         
         // Re-running with inherit to show output if it fails is complex.
         // Let's just run it. The progress bar will be redrawn after each step.
         await runCommand('node', [step.script], { stdio: 'inherit' });
      }
      
      progressBar.update(i + 1, `${step.name} completed`);
    }

    progressBar.finish('Setup completed successfully!');
    console.log('\n✅ You can now access the app at http://localhost:3000');
    console.log('To seed mock data, run: npm run seed');
    process.exit(0);

  } catch (e) {
    console.error('\n❌ Setup failed:', e.message);
    process.exit(1);
  }
}

main();
