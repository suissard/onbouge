module.exports = {
  async beforeCreate(event) {
    const ctx = strapi.requestContext.get();
    if (ctx && ctx.state && ctx.state.user) {
      const profile = await strapi.db.query('api::profile.profile').findOne({
        where: { user: ctx.state.user.id },
      });
      if (profile) {
        event.params.data.author = profile.id;
      }
    }
  },
};
