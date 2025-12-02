'use strict';

/**
 * activity router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::activity.activity', {
  config: {
    update: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::activity.activity' } },
      ],
    },
    delete: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::activity.activity' } },
      ],
    },
  },
});
