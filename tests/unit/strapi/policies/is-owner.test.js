import { describe, it, expect, vi } from 'vitest';
const path = require('path');
const isOwnerPolicy = require(path.resolve(process.cwd(), 'install/strapi/custom/policies/is-owner'));

describe('isOwner Policy', () => {
  it('should return false if context is missing user, id, or uid', async () => {
    const context = { state: {}, params: {} };
    const config = { uid: 'api::test.test' };
    const strapi = {};

    expect(await isOwnerPolicy(context, config, { strapi })).toBe(false);
  });

  it('should return true if count > 0', async () => {
    const context = {
      state: { user: { documentId: 'user123' } },
      params: { id: 'doc123' },
    };
    const config = { uid: 'api::test.test' };
    
    const countMock = vi.fn().mockResolvedValue(1);
    const documentsMock = vi.fn().mockReturnValue({ count: countMock });
    const strapi = { documents: documentsMock };

    const result = await isOwnerPolicy(context, config, { strapi });

    expect(result).toBe(true);
    expect(documentsMock).toHaveBeenCalledWith('api::test.test');
    expect(countMock).toHaveBeenCalledWith({
      filters: {
        documentId: 'doc123',
        author: { documentId: 'user123' },
      },
    });
  });

  it('should return false if count is 0', async () => {
    const context = {
      state: { user: { documentId: 'user123' } },
      params: { id: 'doc123' },
    };
    const config = { uid: 'api::test.test' };
    
    const countMock = vi.fn().mockResolvedValue(0);
    const documentsMock = vi.fn().mockReturnValue({ count: countMock });
    const strapi = { documents: documentsMock };

    const result = await isOwnerPolicy(context, config, { strapi });

    expect(result).toBe(false);
  });
});
