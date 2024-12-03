var mongoose = require("mongoose");
const subDomainSchema = mongoose.Schema({
  subDomain: { type: String },
  statusSubDomain: { type: Boolean, default: false },
});
const domainSchema = mongoose.Schema({
  domainName: { type: String, required: true },
  subdomain: [subDomainSchema],
  // statusDomain: { type: Boolean, default: false },
  blockWhiteStatus: { type: Number, default: 0 },
});
var UserSchema = mongoose.Schema({
  ip: { type: String },
  domain: [domainSchema],
  status: { type: Boolean, default: false },
});

const domainModal = mongoose.model("ip-server", UserSchema);
module.exports = domainModal;
