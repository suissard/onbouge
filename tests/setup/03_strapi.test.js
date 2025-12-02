import { describe, it, expect } from 'vitest';
import axios from 'axios';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

describe('03_strapi', () => {
    it('should be reachable', async () => {
        try {
            // Checking a public endpoint to verify Strapi is up and handling requests
            const res = await axios.get(`${STRAPI_URL}/api/users-permissions/roles`);
            expect(res.status).toBe(200);
        } catch (e) {
            // 403 Forbidden means Strapi is up but we don't have permission, which is fine for "reachability"
            if (e.response && e.response.status === 403) {
                expect(e.response.status).toBe(403);
            } else {
                throw new Error(`Strapi is not reachable at ${STRAPI_URL}: ${e.message}`);
            }
        }
    });
});
