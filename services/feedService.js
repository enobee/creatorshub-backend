const axios = require("axios");

async function fetchTwitterPosts(query = "cat") {
  try {
    const baseUrl = "https://api.twitter.com/2/tweets/search/recent";
    const params = new URLSearchParams({ query, max_results: "2" });
    const url = `${baseUrl}?${params.toString()}`;
    console.log("→ Twitter URL:", url);

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
    });

    return (res.data.data || []).map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      url: `https://twitter.com/i/web/status/${tweet.id}`,
      source: "twitter",
    }));
  } catch (err) {
    if (err.response?.status === 429) {
      console.warn(" Twitter rate limit hit — returning empty tweet list");
      return []; // ← fallback so feed still works
    }
  }
}

// Create a small dedicated client for Reddit with a proper User-Agent:
const redditClient = axios.create({
  baseURL: "https://www.reddit.com",
  timeout: 10000,
  headers: {
    "User-Agent": "web:CreatorHub:v1.0.0 (by /u/enobeeeeee)",
  },
});

async function getRedditPosts(subreddit) {
  try {
    const res = await redditClient.get(`/r/${subreddit}/hot.json?limit=10`);
    return res.data.data.children.map((post) => ({
      id: post.data.id,
      title: post.data.title,
      url: post.data.url,
      source: "reddit",
      date: new Date(post.data.created_utc * 1000),
    }));
  } catch (err) {
    console.error(
      "Error in fetchRedditPosts:",
      err.response?.status,
      err.response?.data || err.message
    );
  }
}

module.exports = { fetchTwitterPosts, getRedditPosts };
