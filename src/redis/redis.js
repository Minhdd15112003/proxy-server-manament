const { Redis } = require("ioredis");
const chalk = require("chalk");

class RedisConnection {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        retryStrategy: (times) => {
          const maxRetries = 5;
          if (times > maxRetries) {
            console.error(
              chalk.red("Không thể kết nối Redis sau nhiều lần thử")
            );
            this.isConnected = false;
            return null;
          }
          return Math.min(times * 50, 2000);
        },
      });

      // Xử lý sự kiện kết nối thành công
      this.client.on("connect", () => {
        console.log(chalk.green("Kết nối Redis thành công"));
        this.isConnected = true;
      });

      // Xử lý sự kiện mất kết nối
      this.client.on("disconnect", () => {
        console.log(chalk.yellow("Mất kết nối Redis"));
        this.isConnected = false;
      });

      // Xử lý lỗi
      this.client.on("error", (err) => {
        console.error(chalk.red("Lỗi Redis:"), err);
        this.isConnected = false;
      });

      // Kiểm tra kết nối
      await this.checkConnection();

      return this.client;
    } catch (error) {
      console.error(chalk.red("Lỗi khởi tạo kết nối Redis:"), error);
      this.isConnected = false;
      return null;
    }
  }

  async checkConnection() {
    try {
      if (!this.client) {
        console.error(chalk.red("Redis client chưa được khởi tạo"));
        return false;
      }

      const result = await this.client.ping();

      if (result === "PONG") {
        console.log(chalk.green("Kết nối Redis hoạt động"));
        this.isConnected = true;
        return true;
      } else {
        console.error(chalk.red("Không thể kết nối Redis"));
        this.isConnected = false;
        return false;
      }
    } catch (error) {
      console.error(chalk.red("Lỗi kiểm tra kết nối Redis:"), error);
      this.isConnected = false;
      return false;
    }
  }

  getClient() {
    return this.client;
  }

  async close() {
    try {
      if (this.client) {
        await this.client.quit();
        console.log(chalk.yellow("Đã đóng kết nối Redis"));
        this.isConnected = false;
      }
    } catch (error) {
      console.error(chalk.red("Lỗi đóng kết nối Redis:"), error);
    }
  }

  // Các phương thức tiện ích Redis
  async set(key, value, expiry = null) {
    try {
      if (!this.isConnected) {
        console.warn(chalk.yellow("Redis chưa kết nối"));
        return null;
      }

      if (expiry) {
        return await this.client.set(key, value, "EX", expiry);
      }
      return await this.client.set(key, value);
    } catch (error) {
      console.error(chalk.red("Lỗi set giá trị Redis:"), error);
      return null;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) {
        console.warn(chalk.yellow("Redis chưa kết nối"));
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      console.error(chalk.red("Lỗi get giá trị Redis:"), error);
      return null;
    }
  }
}

// Xuất ra một instance duy nhất (Singleton)
module.exports = new RedisConnection();
