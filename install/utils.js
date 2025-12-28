const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const STRAPI_URL = 'http://localhost:1337';
const MAX_RETRIES = 60; // 5 minutes approx (if 5s interval)
const RETRY_INTERVAL = 5000;

function runCommand(command, args, options = {}, onData = null) {
  return new Promise((resolve, reject) => {
    // If onData is provided, we must use pipe to capture output
    const spawnOptions = { 
      stdio: onData ? ['inherit', 'pipe', 'pipe'] : 'inherit', 
      shell: true, 
      ...options 
    };
    
    // Fix for DEP0190: When shell is true, args are not escaped.
    // We should either not use shell: true or construct the command string manually.
    // For simplicity and compatibility, we'll keep shell: true but handle the command construction if needed,
    // OR we can just set shell: false since we are running simple commands.
    // However, 'npm' on Windows might need shell.
    // Let's try to use shell: false by default unless specified, or just ignore the warning?
    // Better: if shell is true, we should pass the full command string as the first arg and empty args array.
    
    let finalCommand = command;
    let finalArgs = args;
    
    if (spawnOptions.shell) {
        // If shell is true, node warns about passing args.
        // We can construct the command string.
        // Simple joining for now, assuming args don't have spaces that need complex escaping for this setup.
        finalCommand = `${command} ${args.join(' ')}`;
        finalArgs = [];
    }

    // console.log(`> ${finalCommand}`); 
    const child = spawn(finalCommand, finalArgs, spawnOptions);

    if (onData) {
      child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => onData(line.trim()));
      });
      
      child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => onData(line.trim()));
      });
    }

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

function checkStrapi() {
  return new Promise((resolve, reject) => {
    const req = http.get(STRAPI_URL, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) resolve();
      else reject(new Error(`Status ${res.statusCode}`));
    });
    req.on('error', reject);
    req.end();
  });
}

async function waitForStrapi() {
  console.log('Waiting for Strapi to be ready...');
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await checkStrapi();
      console.log('Strapi is ready!');
      return;
    } catch (e) {
      console.log(`Waiting for Strapi... (${i}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, RETRY_INTERVAL));
    }
  }
  throw new Error('Timeout waiting for Strapi');
}

function loadEnv() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envConfig = {};
    envContent.split('\n').forEach(line => {
      // Strip comments
      const lineWithoutComment = line.split('#')[0].trim();
      if (!lineWithoutComment) return;

      const parts = lineWithoutComment.split('=');
      if (parts.length >= 2) {
        envConfig[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
    return envConfig;
  } catch (e) {
    console.warn('Warning: Could not load .env file');
    return {};
  }
}

async function checkProd() {
  const env = loadEnv();
  // Check string value 'true' (case insensitive)
  if (env.PROD && env.PROD.toLowerCase() === 'true') {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      console.log('\n⚠️  WARNING: You are in PRODUCTION mode (PROD=true) ⚠️');
      console.log('This action is potentially destructive.');
      readline.question('Are you sure you want to continue? (yes/no): ', (answer) => {
        readline.close();
        if (answer.toLowerCase() === 'yes') {
          resolve();
        } else {
          console.log('Action cancelled.');
          process.exit(1);
        }
      });
    });
  }
}

module.exports = {
  runCommand,
  checkStrapi,
  waitForStrapi,
  loadEnv,
  checkProd,
  STRAPI_URL
};
