// /backend/src/transcribe.js
const express = require("express");
const { AssemblyAI } = require("assemblyai");
const fs = require("fs");
// import fetch from "node-fetch";

const router = express.Router();
const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

/**
 * POST /transcribe
 * body: { audioUrl?: string, fileId?: string }
 *  - audioUrl: a publicly reachable mp3 url
 *  - OR stream/upload the file to AssemblyAI if not public (see below)
 */
router.post("/transcribe", async (req, res) => {
  try {
    const { audioUrl } = req.body;

    // If you have a public URL for the full episode, use it directly:
    if (!audioUrl) return res.status(400).json({ error: "audioUrl required" });

    const transcript = await aai.transcripts.submit({
      audio_url: audioUrl,
      // quality & cleanup options:
      speaker_labels: true,          // diarization
      disfluencies: false,           // remove "um", "uh"
      filter_profanity: true,
      punctuate: true,
      format_text: true,             // smart casing, numbers, etc.
      // Optional: boost accuracy for names/terms
      // word_boost: ["Spotify","Adele","Sasha"]
    });

    res.json({ id: transcript.id, status: transcript.status });
    console.log("Has AAI key?", !!process.env.ASSEMBLYAI_API_KEY); // Test line
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to start transcription" });
  }
});

/**
 * GET /transcribe/:id
 *  - Poll until status = 'completed' or 'error'
 */
router.get("/transcribe/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tr = await aai.transcripts.get(id);
    res.json(tr);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to fetch transcript" });
  }
});

async function uploadAndTranscribe(localPath) {
  const uploadUrl = await aai.files.upload(fs.createReadStream(localPath));
  const tr = await aai.transcripts.submit({
    audio_url: uploadUrl,
    speaker_labels: true,
    disfluencies: false,
    punctuate: true,
    format_text: true,
  });
  return tr.id;
}

// in backend/src/transcribe.js
// const fetch = require("node-fetch");

// router.post("/transcribe/from-url", async (req, res) => {
//   try {
//     const { sourceUrl } = req.body;
//     if (!sourceUrl) return res.status(400).json({ error: "sourceUrl required" });

//     // Fetch the audio from your source (must be full MP3)
//     const r = await fetch(sourceUrl);
//     if (!r.ok) return res.status(400).json({ error: "cannot fetch sourceUrl" });

//     // Upload to AssemblyAI
//     const uploadUrl = await aai.files.upload(r.body);

//     // Submit transcription job
//     const job = await aai.transcripts.submit({
//       audio_url: uploadUrl,
//       speaker_labels: true,
//       disfluencies: false,
//       punctuate: true,
//       format_text: true,
//     });

//     res.json({ id: job.id, status: job.status });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "failed to start transcription" });
//   }
// });

const fetch = require("node-fetch");

router.post("/transcribe/from-url", async (req, res) => {
  try {
    const { sourceUrl } = req.body;
    if (!sourceUrl) return res.status(400).json({ error: "sourceUrl required" });

    // Fetch the audio from your source (must be full MP3)
    const r = await fetch(sourceUrl);
    if (!r.ok) return res.status(400).json({ error: "cannot fetch sourceUrl" });

    // Upload to AssemblyAI
    const uploadUrl = await aai.files.upload(r.body);

    // Submit transcription job
    const job = await aai.transcripts.submit({
      audio_url: uploadUrl,
      speaker_labels: true,
      disfluencies: false,
      punctuate: true,
      format_text: true,
    });

    res.json({ id: job.id, status: job.status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to start transcription" });
  }
});


module.exports = router;