const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Password123456789!';

async function debugAuth() {
    try {
        console.log('--- Debugging Auth ---');
        console.log(`Target: ${STRAPI_URL}`);
        console.log(`User: ${ADMIN_EMAIL}`);

        // 1. Try to login
        console.log('\n1. Attempting Login (/api/auth/local)...');
        let token;
        try {
            const loginRes = await axios.post(`${STRAPI_URL}/api/auth/local`, {
                identifier: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });
            token = loginRes.data.jwt;
            console.log('✅ Login Successful!');
            console.log(`Token received (first 20 chars): ${token.substring(0, 20)}...`);
        } catch (e) {
            console.error('❌ Login Failed:', e.response?.data || e.message);
            return;
        }

        // 2. Try to access protected route
        console.log('\n2. Attempting to access /api/activities...');
        try {
            const res = await axios.get(`${STRAPI_URL}/api/activities`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Access Successful!');
            console.log(`Status: ${res.status}`);
            console.log(`Data count: ${res.data.data.length}`);
        } catch (e) {
            console.error('❌ Access Failed:', e.response?.status, e.response?.statusText);
            console.error('Details:', e.response?.data);
        }
        
         // 3. Try to access Strapi Admin Login (just to check if it works too)
        console.log('\n3. Attempting Strapi Admin Panel Login (/admin/login)...');
        try {
             const adminLoginRes = await axios.post(`${STRAPI_URL}/admin/login`, {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });
            console.log('✅ Strapi Admin Login Successful!');
        } catch (e) {
             console.error('❌ Strapi Admin Login Failed:', e.response?.data || e.message);
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

debugAuth();
