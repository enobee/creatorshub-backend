const User = require("../models/User");
const {
  fetchTwitterPosts,
  fetchRedditPosts,
  getRedditPosts,
} = require("../services/feedService");
const redisClient = require("../services/redisClient");

const CACHE_TTL = 900; // cache for 15 minutes

// const getFeed = async (req, res) => {
//   console.log("🔥 getFeed() called for user:", req.user?.id);

//   try {
//     const userId = req.user.id;
//     const cacheKey = `feed:${userId}`;

//     // ► 1. Try cache
//     let cached = null;
//     try {
//       cached = await redisClient.get(cacheKey);
//     } catch (err) {
//       console.warn("Redis cache retrieval failed:", err.message);
//     }
//     if (cached) {
//       console.log("▶︎ returning CACHED feed for", userId);
//       // prevent browser caching
//       res.setHeader("Cache-Control", "no-store, private");
//       return res.json(JSON.parse(cached));
//     }

//     console.log("cache miss - generating fresh feed for", userId);

//     const user = await User.findById(userId)
//       .select("preferences reportedFeeds")
//       .lean();
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const reportedIds = new Set(
//       (user.reportedFeeds || []).map((f) => f.postId)
//     );
//     const feedPrefs = user.preferences.length ? user.preferences : ["cat"];

//     const [twitterRawBatches, redditRawBatches] = await Promise.all([
//       Promise.all(feedPrefs.map(fetchTwitterPosts)),
//       Promise.all(feedPrefs.map(getRedditPosts)),
//     ]);
//     const twitterRaw = twitterRawBatches.flat();
//     const redditRaw = redditRawBatches.flat();

//     const twitter = twitterRaw.filter(
//       (p) => p && p.id && !reportedIds.has(p.id)
//     );
//     const reddit = redditRaw.filter((p) => p && p.id && !reportedIds.has(p.id));

//     const shuffle = (arr) => {
//       const a = [...arr];
//       for (let i = a.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [a[i], a[j]] = [a[j], a[i]];
//       }
//       return a;
//     };
//     const randomizedTwitter = shuffle(twitter);
//     const randomizedReddit = shuffle(reddit);
//     const combined = shuffle([...randomizedTwitter, ...randomizedReddit]);

//     const payload = {
//       twitter: randomizedTwitter,
//       reddit: randomizedReddit,
//       combined,
//     };

//     try {
//       await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(payload));
//       console.log("✔︎ Cached feed for user", userId);
//     } catch (err) {
//       console.warn("Redis cache storage failed:", err.message);
//     }

//     // prevent browser caching
//     res.setHeader("Cache-Control", "no-store, private");
//     return res.json(payload);
//   } catch (error) {
//     console.error("🔥 feedController error:", error.stack || error);
//     const msg =
//       error.response?.data?.message || error.response?.data || error.message;
//     res.status(500).json({
//       message: "Error fetching personalized feed",
//       error: msg,
//     });
//   }
// };

const getFeed = async (req, res) => {
  console.log("🔥 getFeed() called for user:", req.user?.id);

  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("preferences reportedFeeds")
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reportedIds = new Set(
      (user.reportedFeeds || []).map((f) => f.postId)
    );
    const feedPrefs = user.preferences.length ? user.preferences : ["cat"];

    const [twitterRawBatches, redditRawBatches] = await Promise.all([
      Promise.all(feedPrefs.map(fetchTwitterPosts)),
      Promise.all(feedPrefs.map(getRedditPosts)),
    ]);
    const twitterRaw = twitterRawBatches.flat();
    const redditRaw = redditRawBatches.flat();

    const twitter = twitterRaw.filter(
      (p) => p && p.id && !reportedIds.has(p.id)
    );
    const reddit = redditRaw.filter((p) => p && p.id && !reportedIds.has(p.id));

    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const randomizedTwitter = shuffle(twitter);
    const randomizedReddit = shuffle(reddit);
    const combined = shuffle([...randomizedTwitter, ...randomizedReddit]);

    const payload = {
      twitter: randomizedTwitter,
      reddit: randomizedReddit,
      combined,
    };

    // prevent browser caching
    res.setHeader("Cache-Control", "no-store, private");
    return res.json(payload);
  } catch (error) {
    console.error("🔥 feedController error:", error.stack || error);
    const msg =
      error.response?.data?.message || error.response?.data || error.message;
    res.status(500).json({
      message: "Error fetching personalized feed",
      error: msg,
    });
  }
};

module.exports = { getFeed };
