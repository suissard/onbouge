const { runCommand } = require('./utils');
const MultiStepLoader = require('./loader');

async function main() {
  const steps = [
    { name: 'Prerequisites', script: 'install/steps/00_versions.js' },
    { name: 'Dependencies', script: 'install/steps/00_deps.js' },
    { name: 'Docker', script: 'install/steps/01_docker.js' },
    { name: 'Strapi Admin', script: 'install/steps/02_strapi_admin.js' },
    { name: 'Schemas', script: 'install/steps/03_schemas.js' },
    { name: 'Spatial Data', script: 'install/steps/04_spatial.js' },
    
    { name: 'Permissions', script: 'install/seed/steps/05_permissions.js', key: 'permissions' },
    { name: 'Admin User', script: 'install/seed/steps/06_admin_user.js', key: 'admin_user' },
    { name: 'Permissions', script: 'install/seed/steps/05_permissions.js', key: 'permissions' }, // repeter esl  ligne deux fois permet de remplir les test en une fois, si l'un arrive
 
  ];

  const loader = new MultiStepLoader(steps);

  try {
    loader.start();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      loader.startStep(i);
      let stepLog = [];
      
      try {
         await runCommand('node', [step.script], {}, (data) => {
            stepLog.push(data);
            // Clean up data string to fit nicely
            let cleanData = data.replace(/\n/g, ' ').substring(0, 50);
            if (cleanData.length === 50) cleanData += '...';
            loader.updateStep(i, cleanData);
         }); 
         loader.succeedStep(i);
      } catch (e) {
         let errorDetail = 'Failed';
         // Attempt to extract a meaningful error message
         const fullLog = stepLog.join('\n');
         // Look for lines that look like errors
         const errorMatch = fullLog.match(/(?:Error:|Exception:|Failure:|fatal:).*/i);
         
         if (errorMatch) {
             errorDetail = errorMatch[0].trim();
         } else {
             // Fallback: use the last non-empty line of output
             const lastLine = stepLog.filter(l => l.trim().length > 0).pop();
             if (lastLine) {
                 errorDetail = lastLine.replace(/\n/g, ' ').trim();
             } else {
                 errorDetail = e.message;
             }
         }
         
         // Truncate if necessary (though loader also truncates, we sanitize here)
         if (errorDetail.length > 90) errorDetail = errorDetail.substring(0, 90) + '...';

         loader.failStep(i, errorDetail);
         loader.stop();
         console.error(`\n❌ Error in step "${step.name}":`);
         console.error('----------------------------------------');
         console.error(stepLog.join('\n'));
         console.error('----------------------------------------');
         console.error(`Error details: ${e.message}`);
         
         if (stepLog.join('\n').includes('permission denied')) {
             console.error('\n💡 Hint: You might need to run this command with sudo or add your user to the docker group.');
         }
         
         throw e;
      }
    }

    loader.stop();
    console.log('\n✅ Setup completed successfully!');
    console.log('✅ You can now access the app at http://localhost:3000');
    console.log('To seed mock data, run: npm run seed');
    process.exit(0);

  } catch (e) {
    loader.stop();
    console.error('\n❌ Setup failed:', e.message);
    process.exit(1);
  }
}

main();
