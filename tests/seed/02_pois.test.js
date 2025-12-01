import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { STRAPI_URL, getAdminJwt } from '../utils';

describe('02_pois', () => {
    let jwt;

    beforeAll(async () => {
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
        const res = await axios.get(`${STRAPI_URL}/api/pois?populate=author`, {
             headers: { Authorization: `Bearer ${jwt}` }
        });
        const pois = res.data.data;
        const poiWithAuthor = pois.find(p => p.author);
        expect(poiWithAuthor).toBeDefined();
    });
});
