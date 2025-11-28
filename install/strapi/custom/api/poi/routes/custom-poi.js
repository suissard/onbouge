module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/pois/spatial-search',
      handler: 'poi.findNearby',
      config: {
        auth: false,
      },
    },
  ],
};
