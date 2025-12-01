import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { STRAPI_URL, getAdminJwt } from '../utils';

describe('04_events', () => {
    let jwt;

    beforeAll(async () => {
        jwt = await getAdminJwt();
    });

    it('should have seeded events', async () => {
        const res = await axios.get(`${STRAPI_URL}/api/events`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThan(0);
    });
});
