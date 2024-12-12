var http = require("http");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
const { ProxyServer } = require("./proxy");

const routes = require("./routes");

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
app.use(express.static(path.join(__dirname, "../public")));

routes(app);

mongoose.connect(
  "mongodb+srv://minhdd15112003:minhtit123@nodejs.9l9gg.mongodb.net/proxy-server",
  {
    maxPoolSize: 10, // Số kết nối tối đa trong connection pool
    socketTimeoutMS: 45000, // Timeout socket
    family: 4, // Sử dụng IPv4
  }
);

// Add connection event listeners
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
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
  console.log("Listening on " + `http://localhost:${addr.port}`);
}

module.exports = app;
