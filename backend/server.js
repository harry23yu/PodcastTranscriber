// import dotenv from "dotenv";
// import transcribeRouter from "./src/transcribe.js";

const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());
const transcribeRouter = require("./src/transcribe.js");

app.use(transcribeRouter);
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => console.log("API on :3000"));

const cors = require("cors");
const axios = require("axios");
const queryString = require("querystring");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// const { extractEpisodeId, fetchEpisodeMetadata } = require("./spotify");
const { extractEpisodeId } = require("./spotify");
const { resolveEpisode } = require("./src/resolveEpisode.js");

// const app = express();
app.use(cors());
app.use(express.json());

let userAccessToken = null;

// 1. Login route - send user to Spotify login
app.get("/login", (req, res) => {
  // const scopes = "user-read-email"; // can add podcast-specific scopes if needed
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
    console.log("Access token acquired:", userAccessToken);

    res.send("Spotify authentication successful! You can now close this tab and use Postman to call /get-episode.");
  } catch (err) {
    console.error("Error getting tokens:", err.response?.data || err.message);
    res.status(500).send("Failed to authenticate with Spotify.");
  }
});

// app.post("/get-episode", async (req, res) => {
//   try {
//     const { spotifyUrl } = req.body;
//     const episodeId = extractEpisodeId(spotifyUrl);

//     if (!episodeId) {
//       return res.status(400).json({ error: "Invalid Spotify URL" });
//     }

//     const metadata = await fetchEpisodeMetadata(episodeId);

//     // Save locally for testing
//     const fs = require("fs");
//     fs.writeFileSync(
//       `./backend/test_episode_${episodeId}.json`,
//       JSON.stringify(metadata.raw, null, 2)
//     );

//     res.json(metadata);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch episode metadata" });
//     console.error("Error fetching episode metadata:", error.response?.data || error.message); // Test line
//     console.log(extractEpisodeId("https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5")); // Test line
//   }
// });

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
      // `./backend/test_episode_${episodeId}.json`,
      // `/test_episodes_${episodeId}.json`,
      // JSON.stringify(data, null, 2);
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
    // console.error("Error fetching episode metadata:", error.response?.data || error.message);
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
