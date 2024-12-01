var express = require("express");
const proxyController = require("../controllers/proxy.controller");
var proxyRouter = express.Router();

proxyRouter.get("/ip", proxyController.findIp);
proxyRouter.patch("/updateIp/:id", proxyController.updateIp);

proxyRouter.get("/ip/:id/domain", proxyController.findDomain);
proxyRouter.patch("/updateDomain/:id", proxyController.updateDomain);
proxyRouter.patch("/postDomain/:id", proxyController.postDomain);
proxyRouter.patch("/updateAllDomains/:id", proxyController.updateAllDomains);
proxyRouter.get("/blockWhileList", proxyController.findTrash);

module.exports = proxyRouter;
