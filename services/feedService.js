const axios = require("axios");

async function fetchTwitterPosts(query = "javascript") {
  try {
    const baseUrl = "https://api.twitter.com/2/tweets/search/recent";
    const params = new URLSearchParams({ query, max_results: "10" });
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

async function fetchRedditPosts(subreddit = "javascript") {
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
    console.error("Error in fetchRedditPosts:", err.message);
    throw err;
  }
}

module.exports = { fetchTwitterPosts, fetchRedditPosts };
