// This file is run before each test file.
// You can add global setup here, like importing testing libraries.
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/vue';

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
