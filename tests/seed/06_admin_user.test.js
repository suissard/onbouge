import { describe, it, expect } from 'vitest';
import { getAdminJwt } from '../utils';

describe('06_admin_user', () => {
    it('should have admin user seeded and able to login', async () => {
        const jwt = await getAdminJwt();
        expect(jwt).toBeDefined();
    });
});
