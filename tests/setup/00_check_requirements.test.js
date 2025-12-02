import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('00_check_requirements', () => {
    it('should have node installed', () => {
        const output = execSync('node --version').toString();
        expect(output).toMatch(/^v\d+/);
    });

    it('should have npm installed', () => {
        const output = execSync('npm --version').toString();
        expect(output).toMatch(/^\d+/);
    });

    it('should have git installed', () => {
        const output = execSync('git --version').toString();
        expect(output).toMatch(/^git version/);
    });
});
