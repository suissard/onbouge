const { getAuthenticatedApi, getJwt, logProgress, STRAPI_URL } = require('../utils');
const axios = require('axios');

async function main() {
  try {
    const api = await getAuthenticatedApi();
    const jwt = await getJwt();
    
    const adminEmail = process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.STRAPI_ADMIN_PASSWORD || 'Password123456789!';
    
    logProgress(0, 1, `Checking/Creating Admin User (${adminEmail})`);

    // Fetch Roles
    let targetRoleId;
    try {
        const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
        
        // Prefer Administrateur role, then Ambassador, fallback to Authenticated
        const adminRole = roles.find(r => r.name === 'Administrateur');
        const ambassadorRole = roles.find(r => r.name === 'Ambassador');
        const authRole = roles.find(r => r.type === 'authenticated');
        
        if (adminRole) {
            targetRoleId = adminRole.id;
            logProgress(0, 1, 'Using Administrateur role for Admin user');
        } else if (ambassadorRole) {
            targetRoleId = ambassadorRole.id;
            logProgress(0, 1, 'Using Ambassador role for Admin user');
        } else if (authRole) {
            targetRoleId = authRole.id;
            logProgress(0, 1, 'Ambassador role not found, using Authenticated');
        }
    } catch (e) {
        console.error('Failed to fetch roles:', e.message);
    }

    if (!targetRoleId) {
        console.error('Could not find suitable role. Skipping admin user creation.');
        process.exit(0);
    }

    try {
        // Check if user exists
        const existingUser = await api.get(`/plugin::users-permissions.user?filters[email][$eq]=${encodeURIComponent(adminEmail)}`);
        
        if (existingUser.data.results && existingUser.data.results.length > 0) {
            const u = existingUser.data.results[0];
            const uid = u.documentId || u.id;
            // Update role
            await api.put(`/plugin::users-permissions.user/${uid}`, {
                role: targetRoleId
            });
            logProgress(1, 1, `Updated Admin User ${adminEmail} role`);
        } else {
            // Create user
            await api.post('/plugin::users-permissions.user', {
                username: 'Admin',
                email: adminEmail,
                password: adminPassword,
                confirmed: true,
                blocked: false,
                role: targetRoleId
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
