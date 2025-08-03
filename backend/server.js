const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { extractEpisodeId, fetchEpisodeMetadata } = require("./spotify");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/get-episode", async (req, res) => {
  try {
    const { spotifyUrl } = req.body;
    const episodeId = extractEpisodeId(spotifyUrl);

    if (!episodeId) {
      return res.status(400).json({ error: "Invalid Spotify URL" });
    }

    const metadata = await fetchEpisodeMetadata(episodeId);

    // Save locally for testing
    const fs = require("fs");
    fs.writeFileSync(
      `./backend/test_episode_${episodeId}.json`,
      JSON.stringify(metadata.raw, null, 2)
    );

    res.json(metadata);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch episode metadata" });
    console.error("Error fetching episode metadata:", error.response?.data || error.message); // Test line
    console.log(extractEpisodeId("https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5")); // Test line
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
