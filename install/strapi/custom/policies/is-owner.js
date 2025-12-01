module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const { id } = policyContext.params;
  const { uid } = config;

  if (!user || !id || !uid) {
    return false;
  }

  // Optimize: Check existence directly in DB without fetching the whole object
  // Strapi 5 uses strapi.documents
  const count = await strapi.documents(uid).count({
    filters: {
      documentId: id,
      author: {
        documentId: user.documentId
      }
    }
  });

  return count > 0;
};
