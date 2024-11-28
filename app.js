var http = require("http");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
const { ProxyServer } = require("./proxy");
var net = require("net");
var domainModal = require("./model/domain.model");
const { hostname } = require("os");

var app = express();
var server = http.createServer(app);
const proxyServer = new ProxyServer();
proxyServer.start();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  domainModal.find().then((data) => {
    res.render("index", { data: data });
  });
});

app.get("/domain/:id", (req, res) => {
  domainModal
    .findById(req.params.id)
    .then((data) => {
      res.render("domainManament", { data: data.domain });
    })
    .catch((err) => {
      console.error("Lỗi khi lấy dữ liệu:", err);
      res.status(500).json({ message: "Không thể lấy dữ liệu" });
    });
});

app.patch("/update/:id", (req, res) => {
  domainModal
    .findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    .then((data) => {
      res.json({ status: data.status });
    })
    .catch((err) => {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      res.status(500).json({ message: "Cập nhật không thành công" });
    });
});

// Kết nối MongoDB
mongoose
  .connect("mongodb://localhost:27017/proxy-server")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

// Lắng nghe trên cổng 3000
server.listen(3000);

// Xử lý lỗi và sự kiện của server
server.on("error", onError);
server.on("listening", onListening);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
}

module.exports = app;
