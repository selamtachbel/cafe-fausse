const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://cafe-fausse-backend-e3d1.onrender.com",
      changeOrigin: true,
    })
  );
};