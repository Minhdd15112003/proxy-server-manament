var express = require("express");
const proxyController = require("../controllers/proxy.controller");
var proxyRouter = express.Router();

proxyRouter.get("/ip", proxyController.findIp);
proxyRouter.patch("/updateIp/:id", proxyController.updateIp);

proxyRouter.get("/domain/:id", proxyController.findDomain);
proxyRouter.patch("/updateDomain/:id", proxyController.updateDomain);

proxyRouter.get("/Trash", proxyController.findTrash);
module.exports = proxyRouter;
