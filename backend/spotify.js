const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

function extractEpisodeId(spotifyUrl) {
    const match = spotifyUrl.match(/episode\/([a-zA-Z0-9]+)/);
    if (match) {
        return match[1];
    }
    else {
        return null;
    }
  }

async function getSpotifyAccessToken() {
  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const { data } = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return data.access_token;
}

async function fetchEpisodeMetadata(episodeId) {
  const token = await getSpotifyAccessToken();

  const { data } = await axios.get(
    `https://api.spotify.com/v1/episodes/${episodeId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // Extract the fields we care about
  return {
    title: data.name,
    duration_ms: data.duration_ms,
    show_name: data.show.name,
    release_date: data.release_date,
    description: data.description,
    raw: data // keep the full raw JSON if needed
  };
}

module.exports = { extractEpisodeId, fetchEpisodeMetadata };

console.log(extractEpisodeId("https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5")); // Test line)
console.log("Print spotify client id: ", process.env.SPOTIFY_CLIENT_ID); // Test line
console.log("Print spotify client secret: ", process.env.SPOTIFY_CLIENT_SECRET); // Test line

// Test lines are 55-60
async function main() {
    const metadata = await fetchEpisodeMetadata("7makk4oTQel546B0PZlDM5");
    console.log(metadata);
  }
  
main();  