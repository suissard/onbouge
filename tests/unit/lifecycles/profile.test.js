import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the global strapi object
global.strapi = {
  entityService: {
    findOne: vi.fn(),
  },
  plugins: {
    upload: {
      services: {
        upload: {
          remove: vi.fn(),
        },
      },
    },
  },
  log: {
    info: vi.fn(),
    error: vi.fn(),
  },
};

// Import the lifecycle hooks
// Note: We need to use require because the file is a CommonJS module
const lifecycles = require('../../../install/strapi/custom/api/profile/content-types/profile/lifecycles.js');

describe('Profile Lifecycles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('beforeUpdate', () => {
    it('should store old photo if photo is being updated', async () => {
      const event = {
        params: {
          data: { photo: 2 }, // New photo ID
          where: { id: 1 },
        },
        state: {},
      };

      // Mock finding the current profile
      strapi.entityService.findOne.mockResolvedValue({
        id: 1,
        photo: { id: 1, url: '/old.jpg' },
      });

      await lifecycles.beforeUpdate(event);

      expect(strapi.entityService.findOne).toHaveBeenCalledWith('api::profile.profile', 1, { populate: ['photo'] });
      expect(event.state.oldPhoto).toEqual({ id: 1, url: '/old.jpg' });
    });

    it('should NOT store old photo if photo is NOT being updated', async () => {
      const event = {
        params: {
          data: { username: 'newname' }, // No photo update
          where: { id: 1 },
        },
        state: {},
      };

      await lifecycles.beforeUpdate(event);

      expect(strapi.entityService.findOne).not.toHaveBeenCalled();
      expect(event.state.oldPhoto).toBeUndefined();
    });

    it('should NOT store old photo if new photo is same as old photo', async () => {
      const event = {
        params: {
          data: { photo: 1 }, // Same photo ID
          where: { id: 1 },
        },
        state: {},
      };

      strapi.entityService.findOne.mockResolvedValue({
        id: 1,
        photo: { id: 1, url: '/old.jpg' },
      });

      await lifecycles.beforeUpdate(event);

      expect(event.state.oldPhoto).toBeUndefined();
    });
  });

  describe('afterUpdate', () => {
    it('should delete old photo if oldPhoto is in state', async () => {
      const event = {
        state: {
          oldPhoto: { id: 1, url: '/old.jpg' },
        },
        result: { id: 1 },
      };

      await lifecycles.afterUpdate(event);

      expect(strapi.plugins.upload.services.upload.remove).toHaveBeenCalledWith({ id: 1, url: '/old.jpg' });
    });

    it('should do nothing if oldPhoto is NOT in state', async () => {
      const event = {
        state: {},
        result: { id: 1 },
      };

      await lifecycles.afterUpdate(event);

      expect(strapi.plugins.upload.services.upload.remove).not.toHaveBeenCalled();
    });
  });
});
