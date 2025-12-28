import { describe, it, expect } from 'vitest';
import axios from 'axios';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

describe('04_frontend', () => {
    it('should be reachable and show correct title', async () => {
        const urls = [FRONTEND_URL, 'http://127.0.0.1:5173', 'http://localhost:5173'];
        let success = false;
        let lastError = null;

        for (const url of Array.from(new Set(urls))) {
            try {
                const res = await axios.get(url, { timeout: 30000 });
                if (res.status === 200 && res.data.includes('Sport Connect')) {
                    success = true;
                    break;
                }
            } catch (e) {
                lastError = e;
            }
        }

        if (!success) {
            throw new Error(`Frontend is not reachable or title is incorrect. Last error: ${lastError?.message}`);
        }
    }, 60000);
});
