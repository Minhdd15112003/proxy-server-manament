const http = require("http");
const tldjs = require("tldjs");
const net = require("net");
const domainModal = require("./model/domain.model");

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
      if (isIpBlocked === false || isDomainBlocked === 1) {
        console.log("isDomainBlocked", isDomainBlocked, "domain ", host);
        console.log("Access to this website is blocked.");
        clientSocket.write(
          "HTTPS/1.1 403 Forbidden\r\n" +
            "Content-Type: text/plain\r\n\r\n" +
            "Access to this website is blocked."
        );

        clientSocket.end();
      } else if (isDomainBlocked === 2) {
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
    let blocked = 0;

    for (const domain of ip) {
      for (const item of domain.domain) {
        const ruleDomain = item.domainName; // domain trong DB, có thể là "*.facebook.com" hoặc "www.facebook.com"
        const blockStatus = item.blockWhiteStatus;

        // Kiểm tra wildcard
        if (ruleDomain.startsWith("*.")) {
          // Lấy phần domain sau '*.'
          const base = ruleDomain.slice(2); // Ví dụ: "*.facebook.com" -> "facebook.com"

          // Kiểm tra nếu hostname là chính domain hoặc subdomain của base
          // hostname == 'facebook.com' hoặc hostname.endsWith('.facebook.com')
          if (hostname === base || hostname.endsWith("." + base)) {
            // Đã khớp wildcard
            if (blockStatus === 1) {
              blocked = 1; // Block
            } else if (blockStatus === 2) {
              blocked = 2; // Allow
            } else {
              blocked = 0; // Default
            }
            break; // Thoát vòng lặp inner
          }
        } else {
          // Không phải wildcard, so sánh chính xác
          if (hostname === ruleDomain) {
            if (blockStatus === 1) {
              blocked = 1; // Block
            } else if (blockStatus === 2) {
              blocked = 2; // Allow
            } else {
              blocked = 0; // Default
            }
            break; // Thoát vòng lặp inner
          }
        }
      }

      if (blocked !== 0) {
        // Nếu đã tìm thấy domain match với block/allow thì dừng luôn
        break;
      }
    }

    console.log(hostname);
    this.domainCache.set(hostname, blocked);
    return blocked;
  }

  async saveDomain(hostname, req) {
    try {
      const clientIp = (
        req.connection.remoteAddress || req.socket.remoteAddress
      ).slice(7);
      const baseDomain = tldjs.getDomain(hostname);
      const existClient = await domainModal.findOne({ ip: clientIp });

      if (!existClient) {
        await domainModal.create({
          ip: clientIp,
          status: true,
          domain: [{ domainName: baseDomain, statusDomain: true }],
        });
        console.log("Saving new client:", clientIp, "with domain:", hostname);
      } else {
        const domainExists = existClient.domain.some(
          (d) => d.domainName === baseDomain
        );
        if (!domainExists) {
          existClient.domain.push({
            domainName: baseDomain,
            statusDomain: true,
          });
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
