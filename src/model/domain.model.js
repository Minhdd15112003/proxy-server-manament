var mongoose = require("mongoose");
// const subDomainSchema = mongoose.Schema({
//   subDomainName: { type: String },
//   statusSubDomain: { type: Boolean, default: false },
// });
const domainSchema = mongoose.Schema({
  domainLable: { type: String, required: false },
  domainName: { type: String, required: true },
  subdomain: [{ type: String }],
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
