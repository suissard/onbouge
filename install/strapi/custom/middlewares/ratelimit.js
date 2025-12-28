'use strict';

/**
 * Custom rate limit middleware for Strapi
 * This middleware allows a high number of requests during development/seeding
 */

module.exports = (config, { strapi }) => {
  // Use config or defaults (default 10000 req/min)
  const max = config.max || 10000;
  const interval = config.interval || 60000; // 1 minute
  
  const requests = new Map();

  return async (ctx, next) => {
    // Only apply to /api and /admin requests
    if (!ctx.path.startsWith('/api') && !ctx.path.startsWith('/admin') && !ctx.path.startsWith('/content-manager')) {
      return await next();
    }

    const ip = ctx.ip;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const timestamps = requests.get(ip);
    
    // Filter out expired timestamps
    const validTimestamps = timestamps.filter(t => now - t < interval);
    
    if (validTimestamps.length >= max) {
      strapi.log.warn(`Rate limit exceeded for IP: ${ip} (${validTimestamps.length}/${max} requests)`);
      ctx.status = 429;
      ctx.body = {
        error: {
          status: 429,
          name: 'RateLimitError',
          message: 'Too many requests, please try again later.',
        }
      };
      return;
    }
    
    validTimestamps.push(now);
    requests.set(ip, validTimestamps);
    
    await next();
  };
};
