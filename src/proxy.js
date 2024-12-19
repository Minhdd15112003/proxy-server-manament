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
      if (isDomainBlocked === 1 || isIpBlocked === true) {
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
      } else {
        this.handleHttpsRequest(req, clientSocket, head, host, port);
        await this.saveDomain(host, clientIp);
      }
    });

    server.listen(port, () => {
      console.log(`Proxy server is running on port ${port}`);
    });
  }

  async blockIpClient(clientIp) {
    const cacheKey = `blocked_ips_${clientIp}`;
    const cacheResult = await this.redisClient.get(cacheKey);
    if (cacheResult) {
      return JSON.parse(cacheResult);
    }

    try {
      const ip = await domainModal.findOne({ ip: clientIp }).exec();
      if (ip && ip.status === true) {
        await this.redisClient.set(cacheKey, JSON.stringify(true), "EX", 3600);
        return true;
      }
    } catch (error) {
      console.error("Error in blockIpClient:", error);
    }

    await this.redisClient.set(cacheKey, JSON.stringify(false), "EX", 3600);
    return false;
  }

  async blockDomain(hostname, clientIp) {
    const cacheKey = `domain_block_${hostname}_${clientIp}`;
    const cacheResult = await this.redisClient.get(cacheKey);
    if (cacheResult) {
      return JSON.parse(cacheResult);
    }

    try {
      const ipData = await domainModal.findOne({ ip: clientIp }).exec();
      if (ipData && ipData.status === true) {
        // Nếu status là true, chặn tất cả domain
        await this.redisClient.set(cacheKey, JSON.stringify(1), "EX", 3600);
        return 1;
      }

      if (ipData && ipData.domain) {
        for (const item of ipData.domain) {
          if (item.domainName === hostname) {
            await this.redisClient.set(
              cacheKey,
              JSON.stringify(item.blockWhiteStatus),
              "EX",
              3600
            );
            return item.blockWhiteStatus;
          }
        }
      }
    } catch (error) {
      console.error("Error in blockDomain:", error);
    }

    await this.redisClient.set(cacheKey, JSON.stringify(0), "EX", 3600);
    return 0; // Mặc định không bị block
  }

  async saveDomain(hostname, clientIp) {
    try {
      const cacheKey = `client_${clientIp}`;
      const cachedClient = await this.redisClient.get(cacheKey);
      if (cachedClient) return;

      let clientData = await domainModal.findOne({ ip: clientIp }).exec();

      if (!clientData) {
        clientData = await domainModal.create({
          ip: clientIp,
          domain: [{ domainName: hostname }],
        });
      } else {
        const domainExists = clientData.domain.some(
          (d) => d.domainName === hostname
        );
        if (!domainExists) {
          clientData.domain.push({ domainName: hostname });
          await clientData.save();
        }
      }

      await this.redisClient.set(
        cacheKey,
        JSON.stringify(clientData),
        "EX",
        86400
      );
      console.log("Domain saved for client:", clientIp, hostname);
    } catch (error) {
      console.error("Error saving domain:", error);
    }
  }

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
      console.error(`Error in HTTPS connection: ${err.message}`);
      clientSocket.end();
    });

    clientSocket.on("error", (err) => {
      console.error(`Error in client socket: ${err.message}`);
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
    await this.redisClient.quit();
  }
}

module.exports = { ProxyServer };
