require("dotenv").config();
const redis = require("redis");
const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;

const client = redis.createClient({
  username: REDIS_USERNAME || "default",
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
  },
});

client
  .connect()
  .then(() => console.log("Redis client connected"))
  .catch((err) => console.error("Redis connection error:", err));

client.on("error", (err) => console.error("Redis Client Error:", err));

const redisClient = {
  get: async (key) => {
    try {
      return await client.get(key);
    } catch (err) {
      console.error("Redis GET error:", err);
      return null;
    }
  },
  setEx: async (key, ttl, value) => {
    try {
      return await client.setEx(key, ttl, value);
    } catch (err) {
      console.error("Redis SETEX error:", err);
      return null;
    }
  },
  del: async (key) => {
    try {
      return await client.del(key);
    } catch (err) {
      console.error("Redis DEL error:", err);
      return 0;
    }
  },
};

module.exports = redisClient;
