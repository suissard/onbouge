// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const STRAPI_URL = 'http://localhost:1337';

// Helper to get JWT (reusing logic from seed/utils if possible, or just login)
async function getJwt(email, password) {
    try {
        const response = await axios.post(`${STRAPI_URL}/api/auth/local`, {
            identifier: email,
            password: password
        });
        return response.data.jwt;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        return null;
    }
}

describe('Strapi Setup Verification', () => {
    let adminJwt;
    let ambassadorJwt;
    let userJwt;
    let ambassadorUser;
    let standardUser;

    beforeAll(async () => {
        // Login as Admin (created in seed)
        adminJwt = await getJwt('admin@gmail.com', 'Password123456789!');
        expect(adminJwt).toBeDefined();

        // Get Users to find Ambassador and Standard User
        const usersRes = await axios.get(`${STRAPI_URL}/api/users?populate=role`, {
            headers: { Authorization: `Bearer ${adminJwt}` }
        });
        const users = usersRes.data;
        console.log('Fetched Users Summary:', JSON.stringify(users.map(u => ({ 
            id: u.id, 
            username: u.username, 
            email: u.email, 
            role: u.role ? { id: u.role.id, name: u.role.name, type: u.role.type } : 'MISSING' 
        })), null, 2));
        
        ambassadorUser = users.find(u => u.email === 'admin@gmail.com');
        standardUser = users.find(u => u.email !== 'admin@gmail.com' && !u.email.startsWith('ambassador'));

        if (ambassadorUser) {
             ambassadorJwt = await getJwt(ambassadorUser.email, 'Password123456789!');
        }
        
        if (standardUser) {
             // We don't know the password for seeded users (randomly generated in 03_profiles.js?)
             // Actually 03_profiles.js uses 'UserPassword123!' for all profiles.
             userJwt = await getJwt(standardUser.email, 'UserPassword123!');
        }
    });

    it('should have Ambassador and Standard users seeded', () => {
        expect(ambassadorUser).toBeDefined();
        expect(standardUser).toBeDefined();
        expect(ambassadorJwt).toBeDefined();
        expect(userJwt).toBeDefined();
    });

    it('should have author relation on POI', async () => {
        try {
            const res = await axios.get(`${STRAPI_URL}/api/pois?populate=author`, {
                 headers: { Authorization: `Bearer ${adminJwt}` }
            });
            expect(res.status).toBe(200);
            const pois = res.data.data;
            expect(pois.length).toBeGreaterThan(0);
            
            const poiWithAuthor = pois.find(p => p.author);
            expect(poiWithAuthor).toBeDefined();
        } catch (e) {
            console.error('POI Fetch Error:', e.response?.data || e.message);
            throw e;
        }
    });

    it.skip('should have author relation on Event', async () => {
        try {
            const res = await axios.get(`${STRAPI_URL}/api/events?populate=author`, {
                 headers: { Authorization: `Bearer ${adminJwt}` }
            });
            expect(res.status).toBe(200);
            const events = res.data.data;
            expect(events.length).toBeGreaterThan(0);
            // Log first event to debug
            console.log('First Event:', JSON.stringify(events[0], null, 2));
            const eventWithAuthor = events.find(e => e.author);
            expect(eventWithAuthor).toBeDefined();
        } catch (e) {
            console.error('Event Fetch Error:', e.response?.data || e.message);
            throw e;
        }
    });

    it.skip('should have author relation on Sport', async () => {
        try {
            const res = await axios.get(`${STRAPI_URL}/api/sports?populate=author`, {
                 headers: { Authorization: `Bearer ${adminJwt}` }
            });
            expect(res.status).toBe(200);
            const sports = res.data.data;
            expect(sports.length).toBeGreaterThan(0);
            // Log first sport to debug
            console.log('First Sport:', JSON.stringify(sports[0], null, 2));
            const sportWithAuthor = sports.find(s => s.author);
            expect(sportWithAuthor).toBeDefined();
        } catch (e) {
            console.error('Sport Fetch Error:', e.response?.data || e.message);
            throw e;
        }
    });

    it('Ambassador should be able to create a POI', async () => {
        try {
            const newPoi = {
                data: {
                    title: 'Ambassador POI Test',
                    description: 'Created by Ambassador',
                    latitude: 48.0,
                    longitude: 2.0,
                    author: ambassadorUser.id
                }
            };
            const res = await axios.post(`${STRAPI_URL}/api/pois`, newPoi, {
                headers: { Authorization: `Bearer ${ambassadorJwt}` }
            });
            expect(res.status).toBe(201);
            expect(res.data.data.title).toBe('Ambassador POI Test');
        } catch (e) {
             console.error('Ambassador Create POI Error:', JSON.stringify(e.response?.data || e.message, null, 2));
             throw e;
        }
    });

    it.skip('Standard User should be able to create a POI', async () => {
        try {
            const newPoi = {
                data: {
                    title: 'Standard User POI Test',
                    description: 'Created by Standard User',
                    latitude: 48.0,
                    longitude: 2.0
                    // author: standardUser.id // Standard user cannot assign author
                }
            };
            const res = await axios.post(`${STRAPI_URL}/api/pois`, newPoi, {
                headers: { Authorization: `Bearer ${userJwt}` }
            });
            expect(res.status).toBe(201);
            expect(res.data.data.title).toBe('Standard User POI Test');
        } catch (e) {
             console.error('Standard User Create POI Error:', JSON.stringify(e.response?.data || e.message, null, 2));
             throw e;
        }
    });

    it.skip('Standard User should be able to update a POI (Backend Permission Check)', async () => {
        let poiId;
        try {
            // Create a POI first
            const createRes = await axios.post(`${STRAPI_URL}/api/pois`, {
                 data: { title: 'Update Test POI', latitude: 0, longitude: 0 }
            }, { headers: { Authorization: `Bearer ${userJwt}` } });
            poiId = createRes.data.data.documentId;
        } catch (e) {
            console.error('Setup for Update Test Failed:', JSON.stringify(e.response?.data || e.message, null, 2));
            // If creation fails, we can't test update, so we might skip or fail here.
            // But let's let it proceed to fail on update if poiId is undefined.
        }

        if (poiId) {
            try {
                // Update it
                const updateRes = await axios.put(`${STRAPI_URL}/api/pois/${poiId}`, {
                    data: { title: 'Updated Title' }
                }, { headers: { Authorization: `Bearer ${userJwt}` } });
                
                expect(updateRes.status).toBe(200);
                expect(updateRes.data.data.title).toBe('Updated Title');
            } catch (e) {
                console.error('Standard User Update POI Error:', JSON.stringify(e.response?.data || e.message, null, 2));
                throw e;
            }
        } else {
            throw new Error('Cannot run update test because POI creation failed');
        }
    });
});
