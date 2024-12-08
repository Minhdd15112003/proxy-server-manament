var express = require("express");
const proxyController = require("../controllers/proxy.controller");
var proxyRouter = express.Router();

proxyRouter.get("/", (req, res) => {
  res.redirect("/ip");
});

proxyRouter.get("/ip", proxyController.findIp);
proxyRouter.patch("/updateIp/:id", proxyController.updateIp);

proxyRouter.get("/ip/:id/domain", proxyController.findDomain);
proxyRouter.patch(
  "/updateStatusDomain/:id",
  proxyController.updateStatusDomain
);
proxyRouter.patch("/postDomain/:id", proxyController.postDomain);
proxyRouter.patch("/postblockDomain/:id", proxyController.postblockDomain);
proxyRouter.patch(
  "/updateblockDomain/:domainid",
  proxyController.updateBlockDomain
);
proxyRouter.patch("/updateAllDomains/:id", proxyController.updateAllDomains);
proxyRouter.get("/blockWhileList/:id", proxyController.findBlockWhite);

module.exports = proxyRouter;
