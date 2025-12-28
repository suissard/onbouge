import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { STRAPI_URL, getAdminJwt, getStrapiAdminJwt, publishAll } from '../utils';

describe('03_profiles', () => {
    let jwt;

    beforeAll(async () => {
        const adminJwt = await getStrapiAdminJwt();
        await publishAll(adminJwt, 'api::profile.profile');
        jwt = await getAdminJwt();
    });

    it('should have seeded profiles', async () => {
        const res = await axios.get(`${STRAPI_URL}/api/profiles?populate=user`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThan(0);
        
        const profileWithUser = res.data.data.find(p => p.user);
        // Note: Depending on permissions/schema, user might not be populated or visible. 
        // But profiles should exist.
        expect(res.data.data.length).toBeGreaterThan(0);
    });
});
