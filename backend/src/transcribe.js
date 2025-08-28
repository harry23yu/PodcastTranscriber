const express = require("express");
const { AssemblyAI } = require("assemblyai");
const fs = require("fs");
const router = express.Router();
const OpenAI = require("openai");

const { resolveEpisode } = require("./resolveEpisode");

// POST /transcribe
router.post("/transcribe", async (req, res) => {
  try {
    let { audioUrl, spotifyUrl } = req.body;
    let episodeTitle = null;
    let episodeDate = null;
    let creator = null;
    let episodeDurationMs = null;

    if (spotifyUrl && !audioUrl) {
      const {
        mp3Url,
        episodeTitle: resolvedTitle,
        releaseDate,
        publisher,
        reason,
        durationMs,
      } = await resolveEpisode(spotifyUrl, global.userAccessToken);

      if (!mp3Url) {
        return res.status(400).json({ error: reason || "Could not get MP3 URL" });
      }

      audioUrl = mp3Url;
      episodeTitle = resolvedTitle;
      episodeDate = releaseDate;
      creator = publisher;
      episodeDurationMs = durationMs;
    }

    if (!audioUrl) {
      return res.status(400).json({ error: "Spotify episode URL required" });
    }

    res.json({
      audioUrl,
      episodeTitle: episodeTitle || "Unknown Title",
      episodeDate: episodeDate || "Unknown Date",
      creator: creator || "Unknown Creator",
      durationMs: episodeDurationMs || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to resolve episode" });
  }
});

// POST /api/aai/transcripts
router.post("/api/aai/transcripts", async (req, res) => {
  try {
    const { audioUrl, assemblyKey, filterProfanity } = req.body;
    if (!assemblyKey || !audioUrl) {
      return res.status(400).json({ error: "assemblyKey and audioUrl are required" });
    }

    const { AssemblyAI } = require("assemblyai");
    const aai = new AssemblyAI({ apiKey: assemblyKey });

    console.log("🔑 Received AssemblyAI key:", assemblyKey?.slice(0, 10) + "..."); // Test line
    console.log("🎵 Audio URL:", audioUrl); // Test line

    const transcript = await aai.transcripts.submit({
      audio_url: audioUrl,
      speaker_labels: true,
      disfluencies: false,
      filter_profanity: !!filterProfanity, // Used for profanity filter toggle
      punctuate: true,
      format_text: true,
    });

    console.log("📝 AssemblyAI transcript job created:", transcript.id, "status:", transcript.status); // Test line

    res.json(transcript);
  } catch (err) {
    console.error("AssemblyAI error:", err.message);
    
    if (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized")) {
      return res.status(401).json({ error: "Invalid AssemblyAI key" });
    }

    res.status(500).json({ error: "failed to create transcript" });
  }
});

// GET /api/aai/transcripts/:id
router.get("/api/aai/transcripts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { assemblyKey } = req.query;
    if (!assemblyKey) {
      return res.status(400).json({ error: "assemblyKey is required" });
    }

    const { AssemblyAI } = require("assemblyai");
    const aai = new AssemblyAI({ apiKey: assemblyKey });

    const tr = await aai.transcripts.get(id);
    res.json(tr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch transcript" });
  }
});

module.exports = router;