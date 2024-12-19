const http = require("http");
const tldjs = require("tldjs");
const net = require("net");
const domainModal = require("./model/domain.model");
const chalk = require("chalk");
const { default: Redis } = require("ioredis");

class ProxyServer {
  constructor() {
    this.redisClient = new Redis({
      host: "localhost", // Địa chỉ Redis server
      port: 6379, // Cổng mặc định của Redis
    });
  }

  async start(port = 9090) {
    const server = http.createServer((req, res) => {});

    server.on("connect", async (req, clientSocket, head) => {
      const clientIp = (
        req.connection.remoteAddress || req.socket.remoteAddress
      ).slice(7);

      const [host, port] = req.url.split(":");
      const isIpBlocked = await this.blockIpClient();
      const baseDomain = tldjs.getDomain(host);
      const isDomainBlocked = await this.blockDomain(baseDomain, clientIp);
      console.log("host", host, isDomainBlocked);
      // Nếu IP hoặc domain bị block, trả về lỗi 403
      if (isIpBlocked === true || isDomainBlocked === 1) {
        console.log(
          chalk.red("isDomainBlocked", isDomainBlocked, "domain ", host)
        );
        console.log(chalk.bgRed("Access to this website is blocked."));
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
        await this.saveDomain(host, req, clientIp);
      }
    });

    server.listen(port, () => {
      console.log(`Proxy server is running on port ${port}`);
    });
  }

  async blockIpClient() {
    const caheKey = "blocked_ips";
    const cacheResult = await this.redisClient.get(caheKey);
    if (cacheResult) {
      return JSON.parse(cacheResult);
    }

    const ip = await domainModal.find({ status: false }).exec();
    const ipClient = ip.map((item) => item.status);

    await this.redisClient.set(
      caheKey,
      JSON.stringify(ipClient[0], "EX", 3600)
    );
    return ipClient[0];
  }

  async blockDomain(hostname, clientIp) {
    const cacheKey = `domain_block${hostname}`;
    const cacheResult = await this.redisClient.get(cacheKey);
    if (cacheResult) {
      return JSON.parse(cacheResult);
    }

    const ip = await domainModal.findById(clientIp, { status: false }).exec();
    let blocked = 0;

    for (const domain of ip) {
      for (const item of domain.domain) {
        if (item.domainName === hostname) {
          if (item.blockWhiteStatus === 1) {
            blocked = 1;
            break;
          } else if (item.blockWhiteStatus === 2) {
            blocked = 2;
            break;
          } else if (item.blockWhiteStatus === 0) {
            blocked = 0;
            break;
          }
        }
        await this.redisClient.set(cacheKey, blocked, "EX", 3600);
        return blocked;
      }

      return blocked;
    }
  }

  async saveDomain(hostname, req, ip) {
    try {
      const baseDomain = tldjs.getDomain(hostname);

      // Sử dụng Redis để giảm tải cho database
      const cacheKey = `client:${clientIp}`;

      // Kiểm tra trong cache trước
      const cachedClient = await this.redisClient.get(cacheKey);

      if (!cachedClient) {
        const existClient = await domainModal.findOne({ ip: clientIp });

        if (!existClient) {
          const newClient = await domainModal.create({
            ip: clientIp,

            domain: [{ domainName: baseDomain }],
          });

          // Lưu vào cache
          await this.redisClient.set(
            cacheKey,
            JSON.stringify(newClient),
            "EX",
            86400
          ); // 24 giờ

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

            // Cập nhật cache
            await this.redisClient.set(
              cacheKey,
              JSON.stringify(existClient),
              "EX",
              86400
            );

            console.log(
              "Updating existing client:",
              clientIp,
              "with domain:",
              hostname
            );
          }
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
  async close() {
    // Đóng kết nối Redis khi không sử dụng
    await this.redisClient.quit();
  }
}

module.exports = { ProxyServer };
