var mongoose = require("mongoose");
const domainSchema = mongoose.Schema({
  domainName: { type: String, required: true },
  statusDomain: { type: Boolean, default: true },
  blockWhiteStatus: { type: Number, default: 0 },
});
var UserSchema = mongoose.Schema({
  ip: { type: String },
  domain: [domainSchema],
  status: { type: Boolean, default: true },
});

const domainModal = mongoose.model("ip-server", UserSchema);
module.exports = domainModal;
