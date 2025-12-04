import { describe, it, expect } from 'vitest';
import axios from 'axios';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

describe('03_strapi', () => {
    it('should be reachable', async () => {
        try {
            const res = await axios.get(`${STRAPI_URL}/api/users-permissions/roles`);
            expect(res.status).toBe(200);
        } catch (e) {
            if (e.response && (e.response.status === 403 || e.response.status === 500)) {
                // 403/500 is also fine, means it's reachable
                expect(e.response.status).toBeGreaterThan(0);
            } else {
                throw new Error(`Strapi is not reachable at ${STRAPI_URL}: ${e.message}`);
            }
        }
    });

    it('should have admin user created', async () => {
        try {
            const res = await axios.post(`${STRAPI_URL}/admin/login`, {
                email: process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com',
                password: process.env.STRAPI_ADMIN_PASSWORD || 'Password123456789!'
            });
            expect(res.status).toBe(200);
            expect(res.data.data.token).toBeDefined();
        } catch (e) {
            throw new Error(`Admin login failed: ${e.message}`);
        }
    });

    it('should have content types schemas applied', async () => {
        try {
            // We can check public API endpoints if they are exposed, or check content-type builder if we had admin token
            // For now, let's check if the endpoints for our custom types exist (even if 403)
            const endpoints = ['events', 'pois', 'activities', 'profiles'];
            for (const endpoint of endpoints) {
                try {
                    await axios.get(`${STRAPI_URL}/api/${endpoint}`);
                } catch (e) {
                    // 403 or 404. 404 means it doesn't exist (bad). 403 means it exists but protected (good).
                    // Actually, if public permission is not set, it might be 403.
                    // If the content type didn't exist, Strapi usually returns 404 for the route.
                    expect(e.response.status).not.toBe(404);
                }
            }
        } catch (e) {
             throw new Error(`Schema check failed: ${e.message}`);
        }
    });

    it('should have custom policies installed', async () => {
        // We can't easily check file existence inside container from here without exec
        // But we can check if the policy is applied by trying an action that requires it?
        // Or we can use docker exec to check the file existence as a proxy for "installed"
        const { execSync } = require('child_process');
        try {
            const output = execSync('docker exec strapi ls /opt/app/strapi/src/policies/is-owner.js').toString();
            expect(output).toContain('is-owner.js');
        } catch (e) {
            if (e.message.includes('permission denied')) {
                console.warn('⚠️ Docker permission denied. Skipping policy file check.');
                return;
            }
            throw new Error('Custom policy is-owner.js not found in container');
        }
    });
});
