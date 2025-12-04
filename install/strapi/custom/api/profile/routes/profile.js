'use strict';

/**
 * profile router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::profile.profile', {
  config: {
    update: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::profile.profile', entry: 'user', isUserDirect: true } },
      ],
    },
    delete: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::profile.profile', entry: 'user', isUserDirect: true } },
      ],
    },
  },
});
