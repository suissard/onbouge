module.exports = {
  async beforeCreate(event) {
    const ctx = strapi.requestContext.get();
    if (ctx && ctx.state && ctx.state.user) {
      event.params.data.author = ctx.state.user.id;
    }
  },
};
