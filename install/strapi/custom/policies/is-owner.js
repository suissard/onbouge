module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const { id } = policyContext.params;
  const { uid, entry = 'author' } = config;

  if (!user || !id || !uid) {
    return false;
  }

  // Allow Administrator to bypass ownership check
  if (user.role && ['Administrateur', 'Ambassador'].includes(user.role.name)) {
    return true;
  }

  // Optimize: Check existence directly in DB without fetching the whole object
  // Strapi 5 uses strapi.documents
  const count = await strapi.documents(uid).count({
    filters: {
      documentId: id,
      [entry]: {
        documentId: user.documentId
      }
    }
  });

  return count > 0;
};
