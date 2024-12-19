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
      console.log("clientIp", clientIp);
      const [host, port] = req.url.split(":");
      const isIpBlocked = await this.blockIpClient(clientIp);
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
        await this.saveDomain(host, req, clientIp);
      } else {
        this.handleHttpsRequest(req, clientSocket, head, host, port);
        await this.saveDomain(host, req, clientIp);
      }
    });

    server.listen(port, () => {
      console.log(`Proxy server is running on port ${port}`);
    });
  }

  async blockIpClient(id) {
    const caheKey = "blocked_ips";
    const cacheResult = await this.redisClient.get(caheKey);
    if (cacheResult) {
      return JSON.parse(cacheResult);
    }

    const ip = await domainModal
      .findOne({ id: clientIp, status: false })
      .exec();

    const ipClient = ip.map((item) => item.status);

    await this.redisClient.set(
      caheKey,
      JSON.stringify(ipClient[0], "EX", 3600)
    );
    return ipClient[0];
  }

  async blockDomain(hostname, clientIp) {
    try {
      const cacheKey = `domain_block${hostname}`;
      const cacheResult = await this.redisClient.get(cacheKey);
      if (cacheResult) {
        return JSON.parse(cacheResult);
      }

      const ip = await domainModal
        .findOne({ ip: clientIp, status: false })
        .exec();
      let blocked = 0;

      if (ip) {
        for (const item of ip.domain) {
          if (item.domainName === hostname) {
            blocked = item.blockWhiteStatus;
            break;
          }
        }
        await this.redisClient.set(cacheKey, blocked, "EX", 3600);
      }
      return blocked;
    } catch (error) {
      console.error("Error in blockDomain:", error);
      return 0; // Không block nếu có lỗi
    }
  }

  async saveDomain(hostname, req, ip) {
    try {
      const baseDomain = tldjs.getDomain(hostname);

      // Sử dụng Redis để giảm tải cho database
      const cacheKey = `client:${ip}`;

      // Kiểm tra trong cache trước
      const cachedClient = await this.redisClient.get(cacheKey);

      if (!cachedClient) {
        const existClient = await domainModal.findOne({ ip }).exec();

        if (!existClient) {
          const newClient = await domainModal.create({
            ip,

            domain: [{ domainName: baseDomain }],
          });

          // Lưu vào cache
          await this.redisClient.set(
            cacheKey,
            JSON.stringify(newClient),
            "EX",
            86400
          ); // 24 giờ

          console.log("Saving new client:", ip, "with domain:", hostname);
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
              ip,
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
