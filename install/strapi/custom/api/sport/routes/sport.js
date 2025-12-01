'use strict';

/**
 * sport router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::sport.sport', {
  config: {
    update: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::sport.sport' } },
      ],
    },
    delete: {
      policies: [
        { name: 'global::is-owner', config: { uid: 'api::sport.sport' } },
      ],
    },
  },
});
