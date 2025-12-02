module.exports = {
  async beforeUpdate(event) {
    const { data, where } = event.params;

    // Check if 'photo' is being updated
    if (Object.prototype.hasOwnProperty.call(data, 'photo')) {
      try {
        // Fetch the current profile with its photo
        const profile = await strapi.entityService.findOne('api::profile.profile', where.id, {
          populate: ['photo'],
        });

        if (profile && profile.photo) {
            // If the new photo is different from the old one (or we are removing it)
            // Note: data.photo is the ID of the new photo, or null
            if (data.photo !== profile.photo.id) {
                event.state.oldPhoto = profile.photo;
            }
        }
      } catch (err) {
        strapi.log.error('Error in Profile beforeUpdate lifecycle:', err);
      }
    }
  },

  async afterUpdate(event) {
    const { oldPhoto } = event.state;

    if (oldPhoto) {
      try {
        // Delete the old photo from the upload plugin
        await strapi.plugins['upload'].services.upload.remove(oldPhoto);
        strapi.log.info(`Deleted old profile photo with ID ${oldPhoto.id} for profile ${event.result.id}`);
      } catch (err) {
        strapi.log.error('Error deleting old profile photo:', err);
      }
    }
  },
};
