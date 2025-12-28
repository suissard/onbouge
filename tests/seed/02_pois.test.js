import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { STRAPI_URL, getAdminJwt, getStrapiAdminJwt, publishAll } from '../utils';

describe('02_pois', () => {
    let jwt;

    beforeAll(async () => {
        const adminJwt = await getStrapiAdminJwt();
        await publishAll(adminJwt, 'api::profile.profile');
        await publishAll(adminJwt, 'api::activity.activity');
        await publishAll(adminJwt, 'api::poi.poi');
        jwt = await getAdminJwt();
    });

    it('should have seeded POIs', async () => {
        const res = await axios.get(`${STRAPI_URL}/api/pois`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        expect(res.status).toBe(200);
        expect(res.data.data.length).toBeGreaterThan(0);
    });

    it('should have author relation on POI', async () => {
        const res = await axios.get(`${STRAPI_URL}/api/pois?populate=author&filters[author][id][$null]=false&sort=createdAt:asc`, {
             headers: { Authorization: `Bearer ${jwt}` }
        });
        const pois = res.data.data;
        const poiWithAuthor = pois.find(p => p.author);
        if (!poiWithAuthor && pois.length > 0) {
            console.log('Using debug populate=*: POI 0:', JSON.stringify(pois[0], null, 2));
        }
        expect(poiWithAuthor).toBeDefined();
    });
});
