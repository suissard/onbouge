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
        const headers = { Authorization: `Bearer ${jwt}` };

        // Check Events
        console.log('\n--- Checking Events ---');
        const eventsRes = await axios.get(`${STRAPI_URL}/api/events?populate=activities`, { headers });
        const events = eventsRes.data.data;
        events.forEach(e => {
            const activityCount = e.activities ? e.activities.length : 0;
            console.log(`Event "${e.title}": ${activityCount} activities`);
        });

        // Check POIs
        console.log('\n--- Checking POIs ---');
        const poisRes = await axios.get(`${STRAPI_URL}/api/pois?populate=activities&pagination[limit]=100`, { headers });
        const pois = poisRes.data.data;
        const seededPoi = pois.find(p => p.title === 'Base nautique de saint nazaire');
        if (seededPoi) {
            console.log(`POI "${seededPoi.title}": ${seededPoi.activities ? seededPoi.activities.length : 0} activities`);
        } else {
            console.log('Seeded POI not found in first 100 results');
        }
        
        pois.forEach(p => {
            if (p.activities && p.activities.length > 0) {
                 console.log(`POI "${p.title}": ${p.activities.length} activities`);
            }
        });

        // Check Profiles
        console.log('\n--- Checking Profiles ---');
        const profilesRes = await axios.get(`${STRAPI_URL}/api/profiles?populate=activities`, { headers });
        const profiles = profilesRes.data.data;
        profiles.forEach(p => {
            const activityCount = p.activities ? p.activities.length : 0;
            console.log(`Profile "${p.username}": ${activityCount} activities`);
        });

    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
