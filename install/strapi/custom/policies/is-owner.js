module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const { id } = policyContext.params;
  const { uid, entry = 'author', isUserDirect = false } = config;

  if (!user || !id || !uid) {
    return false;
  }

  // Allow Administrator to bypass ownership check
  if (user.role && ['Administrateur', 'Ambassador'].includes(user.role.name)) {
    return true;
  }

  // Optimize: Check existence directly in DB without fetching the whole object
  // Strapi 5 uses strapi.documents
  const filters = {
      documentId: id,
  };

  if (isUserDirect) {
      filters[entry] = {
          documentId: user.documentId
      };
  } else {
      filters[entry] = {
          user: {
              documentId: user.documentId
          }
      };
  }

  const count = await strapi.documents(uid).count({
    filters
  });

  return count > 0;
};
