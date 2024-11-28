const http = require("http");
const dns = require("dns");
const path = require("path");
const net = require("net");
const domainModal = require("./model/domain.model");

class ProxyServer {
  start(port = 9090) {
    const server = http.createServer((req, res) => {});
    server.on("connect", async (req, clientSocket, head) => {
      const [host, port] = req.url.split(":");
      if ((await this.blockIpClient()) === false) {
        clientSocket.write(
          "HTTPS/1.1 403 Forbidden\r\n" +
            "Content-Type: text/plain\r\n\r\n" +
            "Access to this website is blocked."
        );
        clientSocket.end();
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
          // Nếu domain chưa tồn tại trong mảng, thêm domain mới
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

  // async blockDomain(hostname) {
  //   const ip = await domainModal.find({ status: false }).exec();
  //   const domain = ip.map((item) => item.domain);
  //   console.log(domain);
  //   return domain.includes(hostname);
  // }

  handleHttpsRequest(req, clientSocket, head, host, port) {
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
      if (!clientSocket.destroyed) {
        clientSocket.end();
      }
    });

    clientSocket.on("error", (err) => {
      console.log(`Error in client socket: ${err.message}`);
      if (!serverSocket.destroyed) {
        serverSocket.end();
      }
    });

    clientSocket.on("close", () => {
      console.log("Client socket closed");
      if (!serverSocket.destroyed) {
        serverSocket.end();
      }
    });

    serverSocket.on("close", () => {
      console.log("Server socket closed");
      if (!clientSocket.destroyed) {
        clientSocket.end();
      }
    });
  }
}

module.exports = { ProxyServer };
