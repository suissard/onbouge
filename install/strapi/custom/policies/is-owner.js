module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;
  const { id } = policyContext.params;
  const { uid, entry = 'author', isUserDirect = false } = config;

  if (!user) {
    return false; // User not logged in
  }

  // Admin and Ambassador bypass
  if (user.role && (
      ['Administrateur', 'Ambassador'].includes(user.role.name) || 
      ['administrateur', 'ambassador'].includes(user.role.type)
  )) {
    return true;
  }

  if (!id) {
      // If no ID is provided (e.g. create), we allow it.
      // Permissions should handle the rest.
      return true;
  }

  if (!uid) {
    strapi.log.error('is-owner policy requires a "uid" in the config');
    return false;
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
