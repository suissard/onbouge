const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Password123456789!';

async function main() {
    try {
        // Login
        console.log('Logging in...');
        const authRes = await axios.post(`${STRAPI_URL}/api/auth/local`, {
            identifier: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const jwt = authRes.data.jwt;
        const user = authRes.data.user;
        console.log(`Logged in as ${user.username} (${user.email})`);

        // Get User Role
        console.log('Fetching user data with role...');
        const userRes = await axios.get(`${STRAPI_URL}/api/users/me?populate=role`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        const role = userRes.data.role;
        console.log(`User Role: ${role.name} (Type: ${role.type}, ID: ${role.id})`);

        // Get Role Permissions
        console.log(`Fetching permissions for role ${role.id}...`);
        // Note: fetching role permissions usually requires admin access or specific endpoint
        // We try the users-permissions endpoint if accessible
        try {
            const roleRes = await axios.get(`${STRAPI_URL}/api/users-permissions/roles/${role.id}`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            const permissions = roleRes.data.role.permissions;
            
            console.log('Checking api::activity permissions...');
            if (permissions['api::activity']) {
                console.log(JSON.stringify(permissions['api::activity'], null, 2));
            } else {
                console.log('❌ api::activity permissions NOT FOUND');
                console.log('Available keys:', Object.keys(permissions).filter(k => k.startsWith('api::')));
            }
        } catch (e) {
            console.error('Failed to fetch role permissions:', e.message);
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Response data:', e.response.data);
        }
    }
}

main();
