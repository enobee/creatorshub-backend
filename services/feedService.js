const axios = require("axios");

async function fetchTwitterPosts(query = "javascript") {
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

async function fetchRedditPosts(subreddit) {
  try {
    const url = `https://www.reddit.com/r/${encodeURIComponent(
      subreddit
    )}/hot.json?limit=10`;
    console.log("→ Reddit URL:", url);

    const res = await axios.get(url);
    return (res.data.data.children || []).map((post) => ({
      id: post.data.id,
      title: post.data.title,
      url: post.data.url,
      source: "reddit",
    }));
  } catch (err) {
    // Show status + body if we got a non-2xx response
    console.error(
      "Error in fetchRedditPosts:",
      err.response?.status,
      err.response?.data || err.message
    );
    return [];
  }
}

// Create a small dedicated client for Reddit with a proper User-Agent:
const redditClient = axios.create({
  baseURL: "https://www.reddit.com",
  timeout: 10000,
  headers: {
    // “CreatorHub/1.0” is your app name & version; replace with something meaningful
    "User-Agent": "CreatorHub/1.0 (by u/enobeeeeee)",
  },
});

async function getRedditPosts(subreddit = "javascript") {
  try {
    // use the configured redditClient instead of plain axios
    const res = await redditClient.get(`/r/${subreddit}/hot.json?limit=10`);
    return res.data.data.children.map((c) => ({
      id: c.data.id,
      title: c.data.title,
      url: c.data.url,
      source: "reddit",
      date: new Date(c.data.created_utc * 1000),
    }));
  } catch (err) {
    // now prints the HTTP status + body
    console.error(
      "Error in fetchRedditPosts:",
      err.response?.status,
      err.response?.data || err.message
    );
  }
}

module.exports = { fetchTwitterPosts, fetchRedditPosts, getRedditPosts };
