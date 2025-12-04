const { getAuthenticatedApi, readData, publishEntry, STRAPI_URL, getJwt, delay, logProgress } = require('../utils');
const axios = require('axios');

async function main() {
  try {
    const api = await getAuthenticatedApi();
    const jwt = await getJwt();
    const profiles = readData('profiles.json');
    // Read ID maps from stdin (passed by orchestrator)
    let idMap = { activities: {}, pois: {}, profiles: {}, users: {} };
    if (process.env.ID_MAP) {
        try {
            idMap = JSON.parse(process.env.ID_MAP);
        } catch(e) {}
    }

    const output = { profiles: {}, users: {} };

    // Fetch Authenticated Role
    let authenticatedRoleId;
    try {
        const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
        const authRole = roles.find(r => r.type === 'authenticated');
        if (authRole) authenticatedRoleId = authRole.id;
    } catch (e) {}

    let count = 0;
    const total = profiles.length;

    for (const item of profiles) {
      count++;
      logProgress(count, total, `Seeding ${item.username}`);
      try {
        const existing = await api.get(`/api::profile.profile?filters[username][$eq]=${encodeURIComponent(item.username)}`);
        let profileId;
        let profileDocId;
        if (existing.data.results && existing.data.results.length > 0) {
          const entry = existing.data.results[0];
          profileId = entry.documentId || entry.id;
          profileDocId = entry.documentId || entry.id;
        }

        // Create/Find User
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
                password: process.env.STRAPI_APP_ADMIN_PASSWORD || 'UserPassword123!',
                confirmed: true,
                blocked: false,
                role: authenticatedRoleId
              });
              const u = userRes.data.data || userRes.data;
              userId = u.documentId || u.id;
            }
            output.users[item.id] = userId;
          } catch (e) {}
        }

        // Map relations
        const activityIds = item.activities?.map(a => idMap.activities[a.id]).filter(id => id) || [];

        if (profileId) {
           await api.put(`/api::profile.profile/${profileDocId}`, {
              username: item.username,
              description: item.description,
              activities: activityIds,
              user: userId
           });
        } else {
          const res = await api.post('/api::profile.profile', {
              username: item.username,
              description: item.description,
              activities: activityIds,
              user: userId
          });
          const entry = res.data.data || res.data;
          profileId = entry.documentId || entry.id;
        }
        await publishEntry(api, 'api::profile.profile', profileId);
        output.profiles[item.id] = profileId;
        await delay(); // Rate limiting
      } catch (e) {
        // console.error(`Failed to seed Profile ${item.username}:`, e.message);
      }
    }
    console.log(JSON.stringify(output));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
