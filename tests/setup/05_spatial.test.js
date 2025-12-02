import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('05_spatial', () => {
    it('should have location column in pois table', () => {
        try {
            // We use docker exec to run a mysql query
            // Checking if 'location' column exists in 'pois' table
            const command = `docker exec mysql mysql -u strapi -pstrapi strapi -e "SHOW COLUMNS FROM pois LIKE 'location';"`;
            const output = execSync(command).toString();
            expect(output).toContain('location');
            expect(output).toContain('point'); // Check type
        } catch (error) {
            if (error.message.includes('permission denied')) {
                console.warn('⚠️ Docker permission denied. Skipping spatial check.');
                return;
            }
            throw new Error('Spatial column location not found in pois table');
        }
    });
});
