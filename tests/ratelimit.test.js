
import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { STRAPI_URL, getAdminJwt } from './utils';

describe('Rate Limit Check', () => {
    let jwt;

    beforeAll(async () => {
        jwt = await getAdminJwt();
    });

    it('should handle high volume of requests without 429', async () => {
        const requests = [];
        const BURST_SIZE = 200; // Simulate a burst of requests
        
        for (let i = 0; i < BURST_SIZE; i++) {
            requests.push(axios.get(`${STRAPI_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${jwt}` }
            }));
        }

        const results = await Promise.allSettled(requests);
        
        const failures = results.filter(r => r.status === 'rejected');
        const rateLimited = failures.filter(r => r.reason.response && r.reason.response.status === 429);
        
        if (rateLimited.length > 0) {
            console.error(`Rate limited requests: ${rateLimited.length}/${BURST_SIZE}`);
        }

        expect(rateLimited.length).toBe(0);
        
        const success = results.filter(r => r.status === 'fulfilled');
        expect(success.length).toBe(BURST_SIZE);
    }, 30000); // Increase timeout for the test
});
