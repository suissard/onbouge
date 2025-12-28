
module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      ratelimit: {
        max: env.int('STRAPI_RATELIMIT_MAX', 100000)
      }
    }
  }
});
