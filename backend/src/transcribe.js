// /backend/src/transcribe.js
const express = require("express");
const { AssemblyAI } = require("assemblyai");
const fs = require("fs");
// import fetch from "node-fetch";

const router = express.Router();
const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

const { resolveEpisode } = require("./resolveEpisode");

/**
 * POST /transcribe
 * body: { audioUrl?: string, fileId?: string }
 *  - audioUrl: a publicly reachable mp3 url
 *  - OR stream/upload the file to AssemblyAI if not public (see below)
 */
// router.post("/transcribe", async (req, res) => {
//   try {
//     const { audioUrl } = req.body;

//     // If you have a public URL for the full episode, use it directly:
//     if (!audioUrl) return res.status(400).json({ error: "audioUrl required" });

//     // const { mp3Url, episodeTitle, reason } =
//     //   await resolveEpisode(spotifyUrl, global.userAccessToken);
//     // if (!mp3Url) {
//     //   return res.status(400).json({ error: reason || "Could not get MP3 URL" });
//     // }

//     const transcript = await aai.transcripts.submit({
//       audio_url: audioUrl,
//       // quality & cleanup options:
//       speaker_labels: true,          // diarization
//       disfluencies: false,           // remove "um", "uh"
//       filter_profanity: true,
//       punctuate: true,
//       format_text: true,             // smart casing, numbers, etc.
//       // Optional: boost accuracy for names/terms
//       // word_boost: ["Spotify","Adele","Sasha"]
//     });

//     res.json({ id: transcript.id, status: transcript.status });
//     // console.log("Has AAI key?", !!process.env.ASSEMBLYAI_API_KEY); // Test line
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "failed to start transcription" });
//   }
// });

// router.post("/transcribe", async (req, res) => {
//   try {
//     let { audioUrl, spotifyUrl } = req.body;

//     // If Spotify URL, resolve to mp3
//     if (spotifyUrl && !audioUrl) {
//       console.log("Resolving Spotify episode:", spotifyUrl);
//       const { mp3Url, reason } = await resolveEpisode(
//         spotifyUrl,
//         global.userAccessToken
//       );
//       if (!mp3Url) {
//         return res.status(400).json({ error: reason || "Could not get MP3 URL" });
//       }
//       audioUrl = mp3Url;
//     }

//     if (!audioUrl) {
//       return res.status(400).json({ error: "audioUrl or spotifyUrl required" });
//     }

//     console.log("Submitting to AssemblyAI:", audioUrl);

//     const transcript = await aai.transcripts.submit({
//       audio_url: audioUrl,
//       speaker_labels: true,
//       disfluencies: false,
//       filter_profanity: true,
//       punctuate: true,
//       format_text: true,
//     });

//     // Always return the ID
//     res.json({ id: transcript.id, status: transcript.status });

//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "failed to start transcription" });
//   }
// });

router.post("/transcribe", async (req, res) => {
  try {
    let { audioUrl, spotifyUrl } = req.body;

    // If a Spotify link is given, resolve to MP3
    if (spotifyUrl && !audioUrl) {
      const { mp3Url, reason } = await resolveEpisode(spotifyUrl, global.userAccessToken);
      if (!mp3Url) {
        return res.status(400).json({ error: reason || "Could not get MP3 URL" });
      }
      audioUrl = mp3Url;
    }

    if (!audioUrl) {
      return res.status(400).json({ error: "audioUrl or spotifyUrl required" });
    }

    const transcript = await aai.transcripts.submit({
      audio_url: audioUrl,
      speaker_labels: true,
      disfluencies: false,
      filter_profanity: true,
      punctuate: true,
      format_text: true,
    });

    res.json({ id: transcript.id, status: transcript.status });
  } catch (err) {
    console.error(err);
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

// GET /transcribe/summary/:id
router.get("/transcribe/summary/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tr = await aai.transcripts.get(id);

    // Parse metadata string to get episode title
    // let episodeTitle = "Unknown Title";
    // if (tr.metadata) {
    //   try {
    //     const metadataObj = JSON.parse(tr.metadata);
    //     episodeTitle = metadataObj.episodeTitle || episodeTitle;
    //   } catch (err) {
    //     console.error("Failed to parse metadata:", err);
    //   }
    // }
    // if (tr.metadata) {
    //   try {
    //     const metadataObj = typeof tr.metadata === "string"
    //       ? JSON.parse(tr.metadata)
    //       : tr.metadata;
    //     episodeTitle = metadataObj.episodeTitle || episodeTitle;
    //   } catch (err) {
    //     console.error("Failed to parse metadata:", err);
    //   }
    // } // New lines added (80-89) for making sure title is correct    

     // Format duration as HH:MM:SS
    const formatDuration = (seconds) => {
      const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const s = String(Math.floor(seconds % 60)).padStart(2, '0');
      return `${h}:${m}:${s}`;
    };  

    // Build cleaned JSON
    const cleaned = {
      // title: episodeTitle,
      transcript: tr.text || "",
      duration: tr.audio_duration ? formatDuration(tr.audio_duration) : "00:00:00",
      status: tr.status
    };

    res.json(cleaned);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to fetch transcript summary" });
  }
});

async function uploadAndTranscribe(localPath, episodeTitle) {
  const uploadUrl = await aai.files.upload(fs.createReadStream(localPath));
  const tr = await aai.transcripts.submit({
    audio_url: uploadUrl,
    speaker_labels: true,
    disfluencies: false,
    punctuate: true,
    format_text: true,
    // metadata: JSON.stringify({ episodeTitle: episodeTitle || "" }) // ✅ ensures title is stored
    // metadata: JSON.stringify({ episodeTitle })
    // episodeTitle: spotifyEpisodeTitle  // needs episode name for GET /transcribe/summary/:id endpoint
  });
  return tr.id;
}

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

// const { resolveEpisode } = require("./resolveEpisode.js");

// POST /transcribe-from-spotify
// router.post("/transcribe-from-spotify", async (req, res) => {
//   try {
//     const { spotifyUrl } = req.body;
//     if (!spotifyUrl) {
//       return res.status(400).json({ error: "spotifyUrl required" });
//     }

//     // Make sure you have the Spotify user access token from authentication
//     if (!global.userAccessToken) {
//       return res.status(400).json({ error: "Please authenticate with Spotify first." });
//     }

//     // Step 1: Get MP3 URL
//     // const { mp3Url, reason } = await resolveEpisode(spotifyUrl, global.userAccessToken);
//     const { mp3Url, episodeTitle, reason } = await resolveEpisode(
//       spotifyUrl,
//       global.userAccessToken
//     );    

//     console.log("Resolved episode:", { mp3Url, episodeTitle, reason });

//     if (!mp3Url) {
//       return res.status(400).json({ error: reason || "Could not get MP3 URL" });
//     }

//     // Step 1: Get MP3 URL AND episode title
//     // const { mp3Url, episodeTitle, reason } = await resolveEpisode(
//     //   spotifyUrl,
//     //   global.userAccessToken
//     // );
//     // if (!mp3Url) {
//     //   return res.status(400).json({ error: reason || "Could not get MP3 URL" });
//     // }

//     const safeTitle = (episodeTitle ?? "").toString().trim(); // Added line
//     console.log("Payload metadata:", JSON.stringify({ episodeTitle: safeTitle })); // Debug added line

//     // Step 2: Submit to AssemblyAI
//     const transcript = await aai.transcripts.submit({
//       audio_url: mp3Url,
//       speaker_labels: true,
//       disfluencies: false,
//       filter_profanity: true,
//       punctuate: true,
//       format_text: true,
//       // metadata: JSON.stringify({ episodeTitle: safeTitle })
//       // metadata: JSON.stringify({ episodeTitle: episodeTitle || "" }) // ✅ ensures title is stored
//       // metadata: JSON.stringify({ episodeTitle })  // ✅ send title here
//     });

//     res.json({
//       id: transcript.id,
//       status: transcript.status,
//       source: "spotify",
//       mp3Url: mp3Url
//     });
//   } catch (e) {
//     console.error("Error in /transcribe-from-spotify:", e);
//     res.status(500).json({ error: "failed to start transcription from Spotify" });
//   }
// });

module.exports = router;