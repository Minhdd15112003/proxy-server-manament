const http = require("http");
const dns = require("dns");
const path = require("path");
const net = require("net");
const domainModal = require("./model/domain.model");
const cluster = require("cluster");
const os = require("os");
const numCPUs = os.cpus().length;

class ProxyServer {
  constructor() {
    // Bộ nhớ cache cho các tên miền đã kiểm tra
    this.domainCache = new Map();
  }

  async start(port = 9090) {
    const server = http.createServer((req, res) => {});

    server.on("connect", async (req, clientSocket, head) => {
      const [host, port] = req.url.split(":");

      const isIpBlocked = await this.blockIpClient();
      const isDomainBlocked = await this.blockDomain(host);

      // Nếu IP hoặc domain bị block, trả về lỗi 403
      if (isIpBlocked === true || isDomainBlocked === true) {
        console.log("isDomainBlocked", isDomainBlocked, "domain ", host);
        console.log("Access to this website is blocked.");
        clientSocket.write(
          "HTTPS/1.1 403 Forbidden\r\n" +
            "Content-Type: text/plain\r\n\r\n" +
            "Access to this website is blocked."
        );

        clientSocket.end();
      } else if (isDomainBlocked === false) {
        this.handleHttpsRequest(req, clientSocket, head, host, port);
        await this.saveDomain(host, req);
      } else {
        this.handleHttpsRequest(req, clientSocket, head, host, port);
        await this.saveDomain(host, req);
      }
    });

    server.listen(port, () => {
      console.log(`Proxy server is running on port ${port}`);
    });
  }

  async blockIpClient() {
    const ip = await domainModal.find({ status: false }).exec();
    const ipClient = ip.map((item) => item.status);
    return ipClient[0];
  }

  async blockDomain(hostname) {
    if (this.domainCache.has(hostname)) {
      return this.domainCache.get(hostname);
    }

    const ip = await domainModal.find({ status: true }).exec();
    let isBlocked = true; // Mặc định là blocked

    for (const domain of ip) {
      for (const item of domain.domain) {
        if (item.domainName === hostname) {
          if (item.blockWhiteStatus === 1) {
            // Nếu blockWhiteStatus == 1, domain bị block bất kể statusDomain
            isBlocked = true;
            break;
          } else if (item.blockWhiteStatus === 2) {
            // Nếu blockWhiteStatus == 2, domain luôn được phép truy cập
            isBlocked = false;
            break;
          } else if (item.statusDomain === false) {
            isBlocked = true;
          } else {
            isBlocked = false;
          }
        }
      }
    }
    console.log(hostname);
    // Lưu vào cache và trả kết quả
    this.domainCache.set(hostname, isBlocked);
    return isBlocked;
  }

  async saveDomain(hostname, req) {
    try {
      const clientIp = (
        req.connection.remoteAddress || req.socket.remoteAddress
      ).slice(7);
      const existClient = await domainModal.findOne({ ip: clientIp });

      if (!existClient) {
        await domainModal.create({
          ip: clientIp,
          status: true,
          domain: [{ domainName: hostname, statusDomain: true }],
        });
        console.log("Saving new client:", clientIp, "with domain:", hostname);
      } else {
        const domainExists = existClient.domain.some(
          (d) => d.domainName === hostname
        );
        if (!domainExists) {
          existClient.domain.push({ domainName: hostname, statusDomain: true });
          await existClient.save();
          console.log(
            "Updating existing client:",
            clientIp,
            "with domain:",
            hostname
          );
        }
      }
    } catch (error) {
      console.log("Error saving domain:", error);
    }
  }

  // Xử lý kết nối HTTPS
  async handleHttpsRequest(req, clientSocket, head, host, port) {
    const serverSocket = net.connect(port, host, () => {
      if (!clientSocket.destroyed && clientSocket.writable) {
        clientSocket.write(
          "HTTP/1.1 200 Connection Established\r\n" +
            "Proxy-agent: Node.js-Proxy\r\n\r\n"
        );
      }
      serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });

    serverSocket.on("error", (err) => {
      console.log(`Error in HTTPS connection: ${err.message}`);
      clientSocket.end();
    });

    clientSocket.on("error", (err) => {
      console.log(`Error in client socket: ${err.message}`);
      serverSocket.end();
    });

    clientSocket.on("close", () => {
      console.log("Client socket closed");
      serverSocket.end();
    });

    serverSocket.on("close", () => {
      console.log("Server socket closed");
      clientSocket.end();
    });
  }
}

module.exports = { ProxyServer };
