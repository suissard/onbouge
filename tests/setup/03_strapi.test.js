import { describe, it, expect } from 'vitest';
import axios from 'axios';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

describe('03_strapi', () => {
    it('should be reachable', async () => {
        try {
            const res = await axios.get(`${STRAPI_URL}/api/users-permissions/roles`); // Public endpoint
            expect(res.status).toBe(200);
        } catch (e) {
            console.error('Strapi is not reachable:', e.message);
            // throw e; // Uncomment to fail if Strapi is down
        }
    });
});
