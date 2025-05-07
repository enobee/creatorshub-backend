const User = require("../models/User");
const {
  fetchTwitterPosts,
  fetchRedditPosts,
} = require("../services/feedService");
const redisClient = require("../services/redisClient");

const CACHE_TTL = 900; // seconds

const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `feed:${userId}`;

    // Try to get cached feed
    let cached = null;
    try {
      cached = await redisClient.get(cacheKey);
    } catch (err) {
      console.warn("Redis cache retrieval failed:", err.message);
      // Continue without cache
    }

    if (cached) {
      console.log("Returning cached feed for user", userId);
      return res.json(JSON.parse(cached));
    }

    // No cache hit, generate feed
    const user = await User.findById(userId)
      .select("preferences reportedFeeds")
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reportedIds = new Set(
      (user.reportedFeeds || []).map((f) => f.postId)
    );
    const feedPreference = user.preferences.length ? user.preferences : ["cat"];

    const twitterRaw = (
      await Promise.all(feedPreference.map(fetchTwitterPosts))
    ).flat();
    const redditRaw = (
      await Promise.all(feedPreference.map(fetchRedditPosts))
    ).flat();

    const twitter = twitterRaw.filter((p) => !reportedIds.has(p.id));
    const reddit = redditRaw.filter((p) => !reportedIds.has(p.id));
    const combined = [...twitter, ...reddit];
    const payload = { twitter, reddit, combined };

    // Cache the results
    try {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(payload));
      console.log("Cached feed for user", userId);
    } catch (err) {
      console.warn("Redis cache storage failed:", err.message);
      // Continue without caching
    }

    return res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching personalized feed",
      error: error.message,
    });
  }
};

module.exports = { getFeed };
