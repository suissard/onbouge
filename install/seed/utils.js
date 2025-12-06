const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load .env
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2 && !line.startsWith('#')) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const DATA_DIR = path.join(__dirname, '../../frontend/src/data');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function login() {
  try {
    // Try default admin credentials first
    const loginRes = await axios.post(`${STRAPI_URL}/admin/login`, {
      email: process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com',
      password: process.env.STRAPI_ADMIN_PASSWORD || 'Password123456789!'
    });
    return loginRes.data.data.token;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    console.log('Could not login with default credentials.');
    // Only prompt if we are in a TTY and not in a child process that can't handle it
    if (process.stdout.isTTY) {
        const email = await askQuestion('Admin Email: ');
        const password = await askQuestion('Admin Password: ');
        
        try {
          const loginRes = await axios.post(`${STRAPI_URL}/admin/login`, {
            email,
            password
          });
          return loginRes.data.data.token;
        } catch (err) {
          console.error('Login failed:', err.response?.data || err.message);
          process.exit(1);
        }
    } else {
        console.error('Login failed and cannot prompt for credentials (non-interactive).');
        process.exit(1);
    }
  }
}

async function getAuthenticatedApi() {
  let jwt = process.env.STRAPI_JWT;

  if (!jwt) {
    jwt = await login();
  }

  return axios.create({
    baseURL: `${STRAPI_URL}/content-manager/collection-types`,
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
}

async function getJwt() {
    if (process.env.STRAPI_JWT) return process.env.STRAPI_JWT;
    return await login();
}

const readData = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content).data;
};

const publishEntry = async (api, model, id) => {
  try {
    await api.post(`/${model}/${id}/actions/publish`, {
      date: new Date()
    });
  } catch (e) {
    // Ignore if already published
  }
};

const delay = (ms=100) => new Promise(resolve => setTimeout(resolve, ms));

const logProgress = (current, total, message = '') => {
    const percentage = Math.min(Math.max(current / total, 0), 1);
    const barLength = 20;
    const filledLength = Math.round(barLength * percentage);
    const emptyLength = barLength - filledLength;
    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    const percentStr = (percentage * 100).toFixed(0);
    
    // Format: PROGRESS: [████░░░░░░] 50% | 5/10 | Message
    const log = `PROGRESS: [${bar}] ${percentStr}% | ${current}/${total} | ${message}`;
    console.error(log);
};

module.exports = {
  getAuthenticatedApi,
  getJwt,
  readData,
  publishEntry,
  delay,
  logProgress,
  STRAPI_URL,
  rl
};
