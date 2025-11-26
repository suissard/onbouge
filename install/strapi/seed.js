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
      email: 'admin@gmail.com',
      password: 'Password123456789!'
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
    baseURL: `${STRAPI_URL}/content-manager/collection-types`,
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

  // 1b. Fetch Authenticated Role
  let authenticatedRoleId;
  try {
    // Try fetching roles from the plugin endpoint which is usually accessible to Admin
    const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
        headers: { Authorization: `Bearer ${jwt}` }
    });
    const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
    const authRole = roles.find(r => r.type === 'authenticated');
    if (authRole) {
      authenticatedRoleId = authRole.id;
      console.log(`Found Authenticated Role ID: ${authenticatedRoleId}`);
    } else {
      console.warn('Could not find Authenticated role. Users will be created without a role (might cause issues).');
    }
  } catch (e) {
    console.error('Failed to fetch roles:', e.message);
  }

  // 2. Seed Sports
  console.log('Seeding Sports...');
  const sports = readData('sports.json');
  for (const item of sports) {
    try {
      // Check if exists (by title/name)
      // Content Manager API filtering syntax might differ slightly, but usually supports standard filters
      const existing = await api.get(`/api::sport.sport?filters[title][$eq]=${encodeURIComponent(item.title)}`);
      let sportId;
      if (existing.data.results && existing.data.results.length > 0) {
        const entry = existing.data.results[0];
        sportId = entry.documentId || entry.id;
        // Update existing using documentId if available, else id
        const updateId = entry.documentId || entry.id;
        await api.put(`/api::sport.sport/${updateId}`, {
            title: item.title,
            publishedAt: new Date()
        });
      } else {
        // Create new
        const res = await api.post('/api::sport.sport', { 
            title: item.title,
            publishedAt: new Date()
        });
        const entry = res.data.data || res.data;
        sportId = entry.documentId || entry.id;
        console.log(`Created Sport: ${item.title} (ID: ${sportId})`);
      }
      idMap.sports[item.id] = sportId;
    } catch (e) {
      console.error(`Failed to seed sport ${item.title}:`, e.message, e.response?.data);
    }
  }

  // 3. Seed POIs
  console.log('Seeding POIs...');
  const pois = readData('pois.json');
  for (const item of pois) {
    try {
      const existing = await api.get(`/api::poi.poi?filters[title][$eq]=${encodeURIComponent(item.title)}`);
      let poiId;
      if (existing.data.results && existing.data.results.length > 0) {
        const entry = existing.data.results[0];
        poiId = entry.documentId || entry.id;
        // Update existing
        const updateId = entry.documentId || entry.id;
        await api.put(`/api::poi.poi/${updateId}`, {
            title: item.title,
            description: item.description,
            publishedAt: new Date()
        });
      } else {
        // Create new
        const res = await api.post('/api::poi.poi', { 
            title: item.title,
            description: item.description,
            publishedAt: new Date()
        });
        const entry = res.data.data || res.data;
        poiId = entry.documentId || entry.id;
        console.log(`Created POI: ${item.title} (ID: ${poiId})`);
      }
      idMap.pois[item.id] = poiId;
    } catch (e) {
      console.error(`Failed to seed POI ${item.title}:`, e.message, e.response?.data);
    }
  }

  // 4. Seed Profiles
  console.log('Seeding Profiles...');
  const profiles = readData('profiles.json');
  for (const item of profiles) {
    try {
      const existing = await api.get(`/api::profile.profile?filters[username][$eq]=${encodeURIComponent(item.username)}`);
      let profileId;
      let profileDocId;
      if (existing.data.results && existing.data.results.length > 0) {
        const entry = existing.data.results[0];
        profileId = entry.documentId || entry.id;
        profileDocId = entry.documentId || entry.id;
      }

      // 4a. Create/Find User
      let userId = null;
      if (authenticatedRoleId) {
        const userEmail = item.email || `${item.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`;
        try {
          // Check if user exists
          const existingUser = await api.get(`/plugin::users-permissions.user?filters[email][$eq]=${encodeURIComponent(userEmail)}`);
          if (existingUser.data.results && existingUser.data.results.length > 0) {
            const u = existingUser.data.results[0];
            userId = u.documentId || u.id;
          } else {
            // Create User
            const userRes = await api.post('/plugin::users-permissions.user', {
              username: item.username,
              email: userEmail,
              password: 'UserPassword123!',
              confirmed: true,
              blocked: false,
              role: authenticatedRoleId
            });

            const u = userRes.data.data || userRes.data;
            userId = u.documentId || u.id;
            console.log(`Created User for profile ${item.username} (ID: ${userId})`);
          }
          idMap.users[item.id] = userId; // Map old profile ID to new User ID if needed
        } catch (e) {
          console.error(`Failed to create user for ${item.username}:`, e.message, e.response?.data);
        }
      }

      if (profileId) {
        // Update existing
         await api.put(`/api::profile.profile/${profileDocId}`, {
            username: item.username,
            description: item.description,
            user: userId,
            publishedAt: new Date()
         });
      } else {
        // Create new
        const res = await api.post('/api::profile.profile', {
            username: item.username,
            description: item.description,
            user: userId,
            publishedAt: new Date()
        });
        const entry = res.data.data || res.data;
        profileId = entry.documentId || entry.id;
        console.log(`Created Profile: ${item.username} (ID: ${profileId})`);
      }
      idMap.profiles[item.id] = profileId;
    } catch (e) {
      console.error(`Failed to seed Profile ${item.username}:`, e.message, e.response?.data);
    }
  }

  // 6. Seed Events
  console.log('Seeding Events...');
  const events = readData('events.json');
  for (const item of events) {
    try {
      const existing = await api.get(`/api::event.event?filters[title][$eq]=${encodeURIComponent(item.title)}`);
      let eventId;
      let eventDocId;
      if (existing.data.results && existing.data.results.length > 0) {
        const entry = existing.data.results[0];
        eventId = entry.id;
        eventDocId = entry.documentId || entry.id;
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
        profiles: profileIds,
        publishedAt: new Date()
      };

      if (eventId) {
        await api.put(`/api::event.event/${eventDocId}`, payload);
      } else {
        await api.post('/api::event.event', payload);
      }
    } catch (e) {
      console.error(`Failed to seed Event ${item.title}:`, e.message, e.response?.data);
    }
  }

  console.log('Seeding completed!');
  rl.close();
}

main();
