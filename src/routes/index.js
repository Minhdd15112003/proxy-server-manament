const proxyRouter = require("./proxy.route");

function routes(app) {
  app.use("/", proxyRouter);
}

module.exports = routes;
