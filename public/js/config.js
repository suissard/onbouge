window.config = {
  baseURL: (function() {
    if (window.location.hostname === 'suissard.github.io') {
      return '/onbouge/public/';
    }
    return '/';
  })()
};
