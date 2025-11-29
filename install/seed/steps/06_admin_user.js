const { getAuthenticatedApi, getJwt, logProgress, STRAPI_URL } = require('../utils');
const axios = require('axios');

async function main() {
  try {
    const api = await getAuthenticatedApi();
    const jwt = await getJwt();
    
    const adminEmail = process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.STRAPI_ADMIN_PASSWORD || 'Password123456789!';
    
    logProgress(0, 1, `Checking/Creating Admin User (${adminEmail})`);

    // Fetch Authenticated Role
    let authenticatedRoleId;
    try {
        const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
        const authRole = roles.find(r => r.type === 'authenticated');
        if (authRole) authenticatedRoleId = authRole.id;
    } catch (e) {
        console.error('Failed to fetch roles:', e.message);
    }

    if (!authenticatedRoleId) {
        console.error('Could not find Authenticated role. Skipping admin user creation.');
        process.exit(0);
    }

    try {
        // Check if user exists
        const existingUser = await api.get(`/plugin::users-permissions.user?filters[email][$eq]=${encodeURIComponent(adminEmail)}`);
        
        if (existingUser.data.results && existingUser.data.results.length > 0) {
            logProgress(1, 1, `Admin User ${adminEmail} already exists`);
        } else {
            // Create user
            await api.post('/plugin::users-permissions.user', {
                username: 'Admin',
                email: adminEmail,
                password: adminPassword,
                confirmed: true,
                blocked: false,
                role: authenticatedRoleId
            });
            logProgress(1, 1, `Created Admin User ${adminEmail}`);
        }
    } catch (e) {
        console.error(`Failed to create/check Admin User:`, e.message);
    }

    // Output empty JSON as expected by the loader
    console.log(JSON.stringify({}));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
