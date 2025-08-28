const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const queryString = require("querystring");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

dotenv.config();

const app = express();

// CORS MUST come before routes
app.use(cors({
  origin: "https://podcast-transcriber-seven.vercel.app", // your live Vercel frontend
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers and helper imports
const transcribeRouter = require("./src/transcribe.js");
const { extractEpisodeId } = require("./spotify");
const { resolveEpisode } = require("./src/resolveEpisode.js");

// Register routes
app.use(transcribeRouter);

// Keep the rest of your routes and logic below this point...

// IMPORTANT: Start server at the bottom
app.listen(5000, () => console.log("✅ Server running on port 5000"));

async function refreshSpotifyToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (data.access_token) {
    global.userAccessToken = data.access_token;
    console.log("✅ Refreshed Spotify token. Starts with:", global.userAccessToken.slice(0, 10) + "..."); // Test line
  } else {
    console.error("❌ Failed to refresh Spotify token:", data);
  }
}

// Get token at startup
refreshSpotifyToken();

// Refresh every 55 minutes
setInterval(refreshSpotifyToken, 55 * 60 * 1000);

// 1. Login route - send user to Spotify login
app.get("/login", (req, res) => {
  const scopes = "user-read-email user-read-private user-read-playback-position user-read-playback-state";
  const redirectUri = process.env.REDIRECT_URI;
  const authUrl =
    "https://accounts.spotify.com/authorize" +
    "?response_type=code" +
    "&client_id=" + process.env.SPOTIFY_CLIENT_ID +
    (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
    "&redirect_uri=" + encodeURIComponent(redirectUri);

  res.redirect(authUrl);
});

// 2. Callback route - exchange code for access token
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  try {
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code"
      }).toString(),
      {
        headers: {
          Authorization: "Basic " + Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    userAccessToken = tokenRes.data.access_token;
    global.userAccessToken = userAccessToken;
    console.log("Access token acquired:", userAccessToken);

    res.send("Spotify authentication successful! You can now close this tab and use Postman to call /get-episode.");
  } catch (err) {
    console.error("Error getting tokens:", err.response?.data || err.message);
    res.status(500).send("Failed to authenticate with Spotify.");
  }
});

// 3. Get episode metadata using the user's access token
app.post("/get-episode", async (req, res) => {
  try {
    console.log("POST /get-episode hit"); // Test line
    if (!userAccessToken) {
      return res.status(400).json({ error: "No user access token. Please authenticate via /login first." });
    }

    const { spotifyUrl } = req.body;
    const episodeId = extractEpisodeId(spotifyUrl);
    console.log("Parsed episode ID:", episodeId);

    if (!episodeId) {
      return res.status(400).json({ error: "Invalid Spotify URL" });
    }

    const { data } = await axios.get(
      `https://api.spotify.com/v1/episodes/${episodeId}`,
      { headers: { Authorization: `Bearer ${userAccessToken}` } }
    );

    // Save locally for testing
    const outputPath = path.join(__dirname, "test_episodes", `test_episode_${episodeId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    res.json({
      title: data.name,
      duration_ms: data.duration_ms,
      show_name: data.show.name,
      release_date: data.release_date,
      description: data.description,
      raw: data
    });
  } catch (error) {
    console.error("Error fetching episode metadata:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(500).json({ error: "Failed to fetch episode metadata" });
  }
});

// 4. Test audio extraction
app.get("/get-audio", (req, res) => {
  const filePath = path.join(__dirname, "test_audio", "test_audio_women_engineers.mp3");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Audio file not found" });
  }

  res.set({
    "Content-Type": "audio/mpeg",
    "Content-Disposition": "inline; filename=test_audio_women_engineers.mp3"
  });

  fs.createReadStream(filePath).pipe(res);
});

// 5. Check to see if episode is Spotify-exclusive
app.post("/resolve-episode", async (req, res) => {
  const { spotifyUrl } = req.body;
  if (!userAccessToken) {
      return res.status(400).json({ error: "Please authenticate with Spotify first." });
  }

  const result = await resolveEpisode(spotifyUrl, userAccessToken);
  res.json(result);
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use((req, res) => {
  console.log("Unhandled request to:", req.method, req.path);
  res.status(404).send("Not Found");
});

app.listen(5000, () => console.log("Server running on port 5000"));