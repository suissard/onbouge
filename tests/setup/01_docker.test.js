import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('01_docker', () => {
    it('should have docker installed', () => {
        try {
            const output = execSync('docker --version').toString();
            expect(output).toContain('Docker version');
        } catch (error) {
            throw new Error('Docker is not installed or not found in PATH');
        }
    });
});
