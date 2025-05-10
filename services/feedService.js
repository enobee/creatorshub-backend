require("dotenv").config();
const axios = require("axios");
const snoowrap = require("snoowrap");

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

async function fetchRedditPosts(subreddit) {
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

const reddit = new snoowrap({
  userAgent: "creatorshub",
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

async function getHotPost(subredditName, limit = 10) {
  try {
    const posts = await reddit.getSubreddit(subredditName).getHot({ limit });
    return posts.map((post) => ({
      title: post.title,
      score: post.score,
      url: post.url,
      author: post.author.name,
    }));
  } catch (error) {
    console.error(`Failed to fetch posts from r/${subredditName}:`, error);
    throw error;
  }
}

async function getRedditPosts(subreddit) {
  try {
    const posts = await getHotPost(subreddit, 10); // 'topic' maps to subreddit
    return posts.map((post) => ({
      id: post.url, // assuming URL is unique enough
      title: post.title,
      url: post.url,
      score: post.score,
      source: "reddit",
      author: post.author,
      subreddit: subreddit,
    }));
  } catch (error) {
    console.error(
      `❌ Failed to fetch Reddit posts for subbreddit "${subreddit}":`,
      error
    );
  }
}

module.exports = { fetchTwitterPosts, fetchRedditPosts, getRedditPosts };
