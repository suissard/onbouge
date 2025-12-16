const { getAuthenticatedApi, getJwt, logProgress, STRAPI_URL, publishEntry } = require('../utils');
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
            console.log(`User ${adminEmail} exists. Updating role and password...`);
            await api.put(`/plugin::users-permissions.user/${uid}`, {
                role: targetRoleId,
                password: adminPassword // Ensure password is synced
            });
            logProgress(1, 1, `Updated Admin User ${adminEmail} role and password`);
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

    // Checking/Creating Admin Profile
    try {
         const adminUserRes = await api.get(`/plugin::users-permissions.user?filters[email][$eq]=${encodeURIComponent(adminEmail)}`);
         if (adminUserRes.data.results && adminUserRes.data.results.length > 0) {
            const adminUser = adminUserRes.data.results[0];
            const adminUserId = adminUser.id; // Relationship usually needs ID, not DocumentId

            const profileRes = await api.get(`/api::profile.profile?filters[user][id][$eq]=${adminUserId}`);
            const profiles = profileRes.data.results; // CM API returns results in .results usually

            if (!profiles || profiles.length === 0) {
                logProgress(0, 1, `Creating Profile for Admin...`);
                const res = await api.post('/api::profile.profile', {
                        username: 'Admin',
                        description: 'Compte administrateur',
                        user: adminUserId,
                        publishedAt: new Date().toISOString()
                });
                
                const entry = res.data.data || res.data;
                const profileId = entry.documentId || entry.id;
                await publishEntry(api, 'api::profile.profile', profileId);
                
                logProgress(1, 1, `Created Profile for Admin`);
            } else {
                 console.log('Admin already has a profile.');
                 const existingProfile = profiles[0];
                 if (!existingProfile.publishedAt) {
                     console.log('Profile is draft. Publishing...');
                     const pid = existingProfile.documentId || existingProfile.id;
                     await publishEntry(api, 'api::profile.profile', pid);
                     logProgress(1, 1, `Published existing Admin Profile`);
                 }
            }
         }
    } catch (e) {
        console.error('Failed to create Admin Profile:', e.message);
    }

    // Create Ambassador User
    const ambassadorEmail = process.env.STRAPI_AMBASSADOR_EMAIL || 'ambassador@onbouge.ch';
    const ambassadorPassword = process.env.STRAPI_AMBASSADOR_PASSWORD || 'Password123456789!';

    logProgress(0.5, 1, `Checking/Creating Ambassador User (${ambassadorEmail})`);

    try {
        // Check if user exists
        const existingUser = await api.get(`/plugin::users-permissions.user?filters[email][$eq]=${encodeURIComponent(ambassadorEmail)}`);
        
        if (existingUser.data.results && existingUser.data.results.length > 0) {
            console.log(`User ${ambassadorEmail} exists.`);
        } else {
            // Create user
            // We try to assign the role if we found it earlier, otherwise it will be fixed in 05_permissions.js
            let roleId = null;
            try {
                 const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
                const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
                const r = roles.find(r => r.name === 'Ambassador');
                if (r) roleId = r.id;
            } catch(e) {}

            await api.post('/plugin::users-permissions.user', {
                username: 'Ambassador',
                email: ambassadorEmail,
                password: ambassadorPassword,
                confirmed: true,
                blocked: false,
                role: roleId // Might be null, will be fixed later
            });
            logProgress(1, 1, `Created Ambassador User ${ambassadorEmail}`);
        }
    } catch (e) {
        console.error(`Failed to create/check Ambassador User:`, e.message);
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
