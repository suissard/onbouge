const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load .env manually
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
console.log(process.env);
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
      email: process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com',
      password: process.env.STRAPI_ADMIN_PASSWORD || 'Password123456789!'
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

  // Helper to publish
  const publishEntry = async (model, id) => {
    try {
      await api.post(`/${model}/${id}/actions/publish`, {
        date: new Date()
      });
      console.log(`Published ${model} ID: ${id}`);
    } catch (e) {
      // If already published or error, just log warning
      console.warn(`Failed to publish ${model} ${id}:`, e.message);
    }
  };

  // 2. Seed Sports
  console.log('Seeding Sports...');
  const sports = readData('sports.json');
  for (const item of sports) {
    try {
      const existing = await api.get(`/api::sport.sport?filters[title][$eq]=${encodeURIComponent(item.title)}`);
      let sportId;
      if (existing.data.results && existing.data.results.length > 0) {
        const entry = existing.data.results[0];
        sportId = entry.documentId || entry.id;
        const updateId = entry.documentId || entry.id;
        await api.put(`/api::sport.sport/${updateId}`, {
            title: item.title
        });
      } else {
        const res = await api.post('/api::sport.sport', { 
            title: item.title
        });
        const entry = res.data.data || res.data;
        sportId = entry.documentId || entry.id;
        console.log(`Created Sport: ${item.title} (ID: ${sportId})`);
      }
      await publishEntry('api::sport.sport', sportId);
      idMap.sports[item.id] = sportId;
    } catch (e) {
      console.error(`Failed to seed sport ${item.title}:`, e.message, e.response?.data);
    }
  }

  // 3. Seed POIs
  console.log('Seeding POIs...');
  const pois = readData('pois.json');
  for (const item of pois) {
    const lat = item.latitude || (48.8 + Math.random() * 0.1);
    const lng = item.longitude || (2.3 + Math.random() * 0.1);

    try {
      const existing = await api.get(`/api::poi.poi?filters[title][$eq]=${encodeURIComponent(item.title)}`);
      let poiId;
      if (existing.data.results && existing.data.results.length > 0) {
        const entry = existing.data.results[0];
        poiId = entry.documentId || entry.id;
        const updateId = entry.documentId || entry.id;
        await api.put(`/api::poi.poi/${updateId}`, {
            title: item.title,
            description: item.description,
            latitude: lat,
            longitude: lng
        });
      } else {
        const res = await api.post('/api::poi.poi', { 
            title: item.title,
            description: item.description,
            latitude: lat,
            longitude: lng
        });
        const entry = res.data.data || res.data;
        poiId = entry.documentId || entry.id;
        console.log(`Created POI: ${item.title} (ID: ${poiId})`);
      }
      await publishEntry('api::poi.poi', poiId);
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
          const existingUser = await api.get(`/plugin::users-permissions.user?filters[email][$eq]=${encodeURIComponent(userEmail)}`);
          if (existingUser.data.results && existingUser.data.results.length > 0) {
            const u = existingUser.data.results[0];
            userId = u.documentId || u.id;
          } else {
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
          idMap.users[item.id] = userId;
        } catch (e) {
          console.error(`Failed to create user for ${item.username}:`, e.message, e.response?.data);
        }
      }

      if (profileId) {
         await api.put(`/api::profile.profile/${profileDocId}`, {
            username: item.username,
            description: item.description,
            user: userId
         });
      } else {
        const res = await api.post('/api::profile.profile', {
            username: item.username,
            description: item.description,
            user: userId
        });
        const entry = res.data.data || res.data;
        profileId = entry.documentId || entry.id;
        console.log(`Created Profile: ${item.username} (ID: ${profileId})`);
      }
      await publishEntry('api::profile.profile', profileId);
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
        profiles: profileIds
      };

      if (eventId) {
        await api.put(`/api::event.event/${eventDocId}`, payload);
      } else {
        const res = await api.post('/api::event.event', payload);
        const entry = res.data.data || res.data;
        eventDocId = entry.documentId || entry.id;
        console.log(`Created Event: ${item.title} (ID: ${eventDocId})`);
      }
      
      if (eventDocId) {
        await publishEntry('api::event.event', eventDocId);
      }
    } catch (e) {
      console.error(`Failed to seed Event ${item.title}:`, e.message, e.response?.data);
    }
  }

  // 7. Update Public Permissions
  console.log('Updating Public Role Permissions...');
  try {
    const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
        headers: { Authorization: `Bearer ${jwt}` }
    });
    const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
    const publicRole = roles.find(r => r.type === 'public');

    if (publicRole) {
        const roleDetailsRes = await axios.get(`${STRAPI_URL}/users-permissions/roles/${publicRole.id}`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        
        const roleData = roleDetailsRes.data.role;
        const permissions = roleData.permissions;

        // Helper to enable find/findOne
        const enableRead = (apiName, controllerName) => {
            if (permissions[apiName] && permissions[apiName].controllers[controllerName]) {
                permissions[apiName].controllers[controllerName].find.enabled = true;
                permissions[apiName].controllers[controllerName].findOne.enabled = true;
            }
        };

        enableRead('api::sport', 'sport');
        enableRead('api::poi', 'poi');
        enableRead('api::profile', 'profile');
        enableRead('api::event', 'event');

        await axios.put(`${STRAPI_URL}/users-permissions/roles/${publicRole.id}`, {
            permissions: permissions
        }, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        console.log('Public permissions updated successfully.');
    } else {
        console.warn('Public role not found, skipping permission update.');
    }
  } catch (e) {
      console.error('Failed to update public permissions:', e.message, e.response?.data);
  }

  // 8. Update Authenticated Permissions
  console.log('Updating Authenticated Role Permissions...');
  if (authenticatedRoleId) {
    try {
        const roleDetailsRes = await axios.get(`${STRAPI_URL}/users-permissions/roles/${authenticatedRoleId}`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        
        const roleData = roleDetailsRes.data.role;
        const permissions = roleData.permissions;

        // Helper to enable CRUD
        const enableCRUD = (apiName, controllerName) => {
            if (permissions[apiName] && permissions[apiName].controllers[controllerName]) {
                permissions[apiName].controllers[controllerName].find.enabled = true;
                permissions[apiName].controllers[controllerName].findOne.enabled = true;
                permissions[apiName].controllers[controllerName].create.enabled = true;
                permissions[apiName].controllers[controllerName].update.enabled = true;
                permissions[apiName].controllers[controllerName].delete.enabled = true;
            }
        };

        enableCRUD('api::sport', 'sport');
        enableCRUD('api::poi', 'poi');
        enableCRUD('api::profile', 'profile');
        enableCRUD('api::event', 'event');

        await axios.put(`${STRAPI_URL}/users-permissions/roles/${authenticatedRoleId}`, {
            permissions: permissions
        }, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        console.log('Authenticated permissions updated successfully.');
    } catch (e) {
        console.error('Failed to update authenticated permissions:', e.message, e.response?.data);
    }
  } else {
      console.warn('Authenticated role ID not found, skipping permission update.');
  }

  console.log('Seeding completed!');
  rl.close();
}

main();
