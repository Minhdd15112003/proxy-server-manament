var mongoose = require("mongoose");
const domainSchema = mongoose.Schema({
  domainName: { type: String, required: true }, // Tên miền
  statusDomain: { type: Boolean, default: true }, // Trạng thái của domain
});
var UserSchema = mongoose.Schema({
  ip: { type: String },
  domain: [domainSchema],
  status: { type: Boolean, default: true },
});

const domainModal = mongoose.model("ip-server", UserSchema);
module.exports = domainModal;
