import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { STRAPI_URL, getAdminJwt, getStrapiAdminJwt, publishAll } from '../utils';

describe('01_activities', () => {
    let jwt;

    beforeAll(async () => {
        const adminJwt = await getStrapiAdminJwt();
        await publishAll(adminJwt, 'api::profile.profile');
        await publishAll(adminJwt, 'api::activity.activity');
        jwt = await getAdminJwt();
    });

    it('should have seeded activities', async () => {
        const res = await axios.get(`${STRAPI_URL}/api/activities`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThan(0);
    });
});
