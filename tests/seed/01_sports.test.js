import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { STRAPI_URL, getAdminJwt } from '../utils';

describe('01_sports', () => {
    let jwt;

    beforeAll(async () => {
        jwt = await getAdminJwt();
    });

    it('should have seeded sports', async () => {
        const res = await axios.get(`${STRAPI_URL}/api/sports`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThan(0);
    });
});
