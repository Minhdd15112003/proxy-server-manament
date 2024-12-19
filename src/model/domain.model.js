var mongoose = require("mongoose");

const domainSchema = mongoose.Schema({
  domainLable: { type: String, required: false },
  domainName: { type: String, required: false },
  blockWhiteStatus: { type: Number, default: 0 },
});
var UserSchema = mongoose.Schema({
  ip: { type: String },
  domain: [domainSchema],
  status: { type: Boolean, default: false },
});

const domainModal = mongoose.model("ips", UserSchema);
module.exports = domainModal;
