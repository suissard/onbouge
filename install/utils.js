const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const STRAPI_URL = 'http://localhost:1337';
const MAX_RETRIES = 60; // 5 minutes approx (if 5s interval)
const RETRY_INTERVAL = 5000;

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`> ${command} ${args.join(' ')}`);
    const child = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
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
      process.stdout.write('.');
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
      const parts = line.split('=');
      if (parts.length >= 2 && !line.startsWith('#')) {
        envConfig[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
    return envConfig;
  } catch (e) {
    console.warn('Warning: Could not load .env file');
    return {};
  }
}

module.exports = {
  runCommand,
  checkStrapi,
  waitForStrapi,
  loadEnv,
  STRAPI_URL
};
