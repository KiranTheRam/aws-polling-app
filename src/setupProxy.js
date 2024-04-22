const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/dev',
    createProxyMiddleware({
      target: 'https://x8lo0d5xq4.execute-api.us-east-2.amazonaws.com',
      changeOrigin: true,
    })
  );
};
