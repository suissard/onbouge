const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const DATA_DIR = path.join(__dirname, '../../frontend/src/data');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log(`Starting seed process on ${STRAPI_URL}...`);

  // 1. Authentication
  let jwt;
  try {
    // Try default admin credentials first
    const loginRes = await axios.post(`${STRAPI_URL}/admin/login`, {
      email: 'admin@example.com',
      password: 'Password123!'
    });
    jwt = loginRes.data.data.token;
    console.log('Logged in with default credentials.');
  } catch (e) {
    console.log('Could not login with default credentials.');
    const email = await askQuestion('Admin Email: ');
    const password = await askQuestion('Admin Password: ');
    
    try {
      const loginRes = await axios.post(`${STRAPI_URL}/admin/login`, {
        email,
        password
      });
      jwt = loginRes.data.data.token;
      console.log('Logged in successfully.');
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      process.exit(1);
    }
  }

  const api = axios.create({
    baseURL: `${STRAPI_URL}/api`,
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });

  // Helper to read JSON
  const readData = (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content).data;
  };

  // ID Mapping: { collectionName: { oldId: newId } }
  const idMap = {
    sports: {},
    pois: {},
    profiles: {},
    users: {}
  };

  // 2. Seed Sports
  console.log('Seeding Sports...');
  const sports = readData('sports.json');
  for (const item of sports) {
    try {
      // Check if exists (by title/name)
      const existing = await api.get(`/sports?filters[title][$eq]=${encodeURIComponent(item.title)}`);
      if (existing.data.data.length > 0) {
        idMap.sports[item.id] = existing.data.data[0].id;
        continue;
      }
      
      const res = await api.post('/sports', { data: { title: item.title } });
      idMap.sports[item.id] = res.data.data.id;
    } catch (e) {
      console.error(`Failed to seed sport ${item.title}:`, e.message);
    }
  }

  // 3. Seed POIs
  console.log('Seeding POIs...');
  const pois = readData('pois.json');
  for (const item of pois) {
    try {
      const existing = await api.get(`/pois?filters[title][$eq]=${encodeURIComponent(item.title)}`);
      if (existing.data.data.length > 0) {
        idMap.pois[item.id] = existing.data.data[0].id;
        continue;
      }

      const res = await api.post('/pois', { data: { 
        title: item.title,
        description: item.description,
        // Add other fields as needed
      }});
      idMap.pois[item.id] = res.data.data.id;
    } catch (e) {
      console.error(`Failed to seed POI ${item.title}:`, e.message);
    }
  }

  // 4. Seed Profiles
  console.log('Seeding Profiles...');
  const profiles = readData('profiles.json');
  for (const item of profiles) {
    try {
      const existing = await api.get(`/profiles?filters[username][$eq]=${encodeURIComponent(item.username)}`);
      if (existing.data.data.length > 0) {
        idMap.profiles[item.id] = existing.data.data[0].id;
        continue;
      }

      const res = await api.post('/profiles', { data: {
        username: item.username,
        description: item.description,
        // Map sports if profile has sports
      }});
      idMap.profiles[item.id] = res.data.data.id;
    } catch (e) {
      console.error(`Failed to seed Profile ${item.username}:`, e.message);
    }
  }

  // 5. Seed Users (and link to Profiles)
  // Note: Creating users usually requires a different endpoint or admin permissions
  // We'll skip creating users for now as it's complex with auth, but we can link existing users if needed.
  // Or we can use the content-manager endpoint for users-permissions/users if we have admin token.
  
  // 6. Seed Events
  console.log('Seeding Events...');
  const events = readData('events.json');
  for (const item of events) {
    try {
      const existing = await api.get(`/events?filters[title][$eq]=${encodeURIComponent(item.title)}`);
      if (existing.data.data.length > 0) {
        continue;
      }

      // Map relations
      const sportIds = item.sports?.map(s => idMap.sports[s.id]).filter(id => id) || [];
      const poiId = item.poi ? idMap.pois[item.poi.id] : null;
      const profileIds = item.profiles?.map(p => idMap.profiles[p.id]).filter(id => id) || [];

      const payload = {
        title: item.title,
        description: item.description,
        date: item.date,
        sports: sportIds,
        poi: poiId,
        profiles: profileIds
      };

      await api.post('/events', { data: payload });
    } catch (e) {
      console.error(`Failed to seed Event ${item.title}:`, e.message);
    }
  }

  console.log('Seeding completed!');
  rl.close();
}

main();
