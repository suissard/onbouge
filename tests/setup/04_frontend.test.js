import { describe, it, expect } from 'vitest';
import axios from 'axios';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

describe('04_frontend', () => {
    it('should be reachable', async () => {
        try {
            const res = await axios.get(FRONTEND_URL);
            expect(res.status).toBe(200);
        } catch (e) {
             throw new Error(`Frontend is not reachable at ${FRONTEND_URL}: ${e.message}`);
        }
    });
});
