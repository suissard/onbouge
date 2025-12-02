import { describe, it, expect } from 'vitest';
import axios from 'axios';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

describe('04_frontend', () => {
    it('should be reachable and show correct title', async () => {
        try {
            const res = await axios.get(FRONTEND_URL);
            expect(res.status).toBe(200);
            // Check for specific content that indicates the app is mounted correctly
            // For example, the title or a root element id
            expect(res.data).toContain('<title>'); 
            expect(res.data).toContain('Sport Connect');
        } catch (e) {
             throw new Error(`Frontend is not reachable at ${FRONTEND_URL}: ${e.message}`);
        }
    });
});
