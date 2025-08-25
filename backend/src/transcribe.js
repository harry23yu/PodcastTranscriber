// /backend/src/transcribe.js
const express = require("express");
const { AssemblyAI } = require("assemblyai");
const fs = require("fs");
// import fetch from "node-fetch";

const router = express.Router();
// const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY }); // 🚨 COMMENTED OUT TO USE USER'S API KEY INSTEAD OF MY OWN
const OpenAI = require("openai"); // Used for removing ads
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // 🚨 COMMENTED OUT TO USE USER'S API KEY INSTEAD OF MY OWN

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

// router.post("/transcribe", async (req, res) => {
//   try {
//     let { audioUrl, spotifyUrl } = req.body;

//     // If a Spotify link is given, resolve to MP3
//     if (spotifyUrl && !audioUrl) {
//       const { mp3Url, reason } = await resolveEpisode(spotifyUrl, global.userAccessToken);
//       if (!mp3Url) {
//         return res.status(400).json({ error: reason || "Could not get MP3 URL" });
//       }
//       audioUrl = mp3Url;
//     }

//     if (!audioUrl) {
//       return res.status(400).json({ error: "audioUrl or spotifyUrl required" });
//     }

//     const transcript = await aai.transcripts.submit({
//       audio_url: audioUrl,
//       speaker_labels: true,
//       disfluencies: false,
//       filter_profanity: true,
//       punctuate: true,
//       format_text: true,
//     });

//     res.json({ id: transcript.id, status: transcript.status });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "failed to start transcription" });
//   }
// });

// Right above is the  POST /transcribe endpoint that worked very well. Right below is the modified POST /transcribe endpoint because I need to display the title and length of the episode, not just the transcript.
// router.post("/transcribe", async (req, res) => { // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
//   try {
//     let { audioUrl, spotifyUrl, filterProfanity} = req.body; // Added filterProfanity for profanity filter toggle
//     let episodeTitle = null; // Store title for response
//     let episodeDate = null; // Store date of episode for response
//     let creator = null; // Store creator of episode for response

//     // If a Spotify link is given, resolve to MP3 + title
//     if (spotifyUrl && !audioUrl) {
//       const { mp3Url, episodeTitle: resolvedTitle, releaseDate, publisher, reason, durationMs } =
//         await resolveEpisode(spotifyUrl, global.userAccessToken);

//       episodeDurationMs = durationMs; // Added line (store duration of episode)

//       if (!mp3Url) {
//         return res.status(400).json({ error: reason || "Could not get MP3 URL" });
//       }
//       audioUrl = mp3Url;
//       episodeTitle = resolvedTitle; // Save title
//       episodeDate = releaseDate; // Save date
//       creator = publisher; // Save creator
//     }

//     if (!audioUrl) {
//       return res.status(400).json({ error: "audioUrl or spotifyUrl required" });
//     }

//     // const transcript = await aai.transcripts.submit({ // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
//     //   audio_url: audioUrl,
//     //   speaker_labels: true,
//     //   disfluencies: false,
//     //   // filter_profanity: false,
//     //   filter_profanity: !!filterProfanity, // Use frontend value (added line for profanity filter toggle)
//     //   punctuate: true,
//     //   format_text: true,
//     // });

//     res.json({
//       id: transcript.id,
//       status: transcript.status,
//       episodeTitle: episodeTitle || "Unknown Title",
//       episodeDate: episodeDate || "Unknown Date", // Get date of episode
//       creator: creator || "Unknown Creator", // Get creator of episode
//       durationMs: episodeDurationMs || null   // Get duration of episode
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "failed to start transcription" });
//   }
// });

// POST /transcribe (user the user's API keys; new version)
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
      return res.status(400).json({ error: "audioUrl or spotifyUrl required" });
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
    // console.error(err);
    // res.status(500).json({ error: "failed to create transcript" });
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

/**
 * GET /transcribe/:id
 *  - Poll until status = 'completed' or 'error'
 */
// router.get("/transcribe/:id", async (req, res) => { // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
//   try {
//     const { id } = req.params;
//     // const tr = await aai.transcripts.get(id); // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
//     // console.log("Transcript object:", tr); // Test line (for detecting speakers)
//     res.json(tr);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "failed to fetch transcript" });
//   }
// });

// GET /transcribe/summary/:id (with the ads; old version)
// router.get("/transcribe/summary/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const tr = await aai.transcripts.get(id);

//     // Parse metadata string to get episode title
//     // let episodeTitle = "Unknown Title";
//     // if (tr.metadata) {
//     //   try {
//     //     const metadataObj = JSON.parse(tr.metadata);
//     //     episodeTitle = metadataObj.episodeTitle || episodeTitle;
//     //   } catch (err) {
//     //     console.error("Failed to parse metadata:", err);
//     //   }
//     // }
//     // if (tr.metadata) {
//     //   try {
//     //     const metadataObj = typeof tr.metadata === "string"
//     //       ? JSON.parse(tr.metadata)
//     //       : tr.metadata;
//     //     episodeTitle = metadataObj.episodeTitle || episodeTitle;
//     //   } catch (err) {
//     //     console.error("Failed to parse metadata:", err);
//     //   }
//     // } // New lines added (80-89) for making sure title is correct    

//      // Format duration as HH:MM:SS
//     const formatDuration = (seconds) => {
//       const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
//       const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
//       const s = String(Math.floor(seconds % 60)).padStart(2, '0');
//       return `${h}:${m}:${s}`;
//     };  

//     // Build cleaned JSON
//     const cleaned = {
//       // title: episodeTitle,
//       transcript: tr.text || "",
//       duration: tr.audio_duration ? formatDuration(tr.audio_duration) : "00:00:00",
//       status: tr.status,
//       utterances: tr.utterances || [] // Added line for speakers to display in transcription 
//     };

//     res.json(cleaned);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "failed to fetch transcript summary" });
//   }
// });

// GET /transcribe/summary/:id (without the ads; old version)
// router.get("/transcribe/summary/:id", async (req, res) => { // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
//   try {
//     const { id } = req.params;
//     // const tr = await aai.transcripts.get(id); // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE

//     console.log("AssemblyAI transcript audio URL:", tr.audio_url); // Test line

//     console.log("Fetched transcript:", {
//       status: tr.status,
//       textLength: tr.text?.length,
//       utteranceCount: tr.utterances?.length
//     }); // Test line

//     const formatDuration = (seconds) => {
//       const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
//       const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
//       const s = String(Math.floor(seconds % 60)).padStart(2, "0");
//       return `${h}:${m}:${s}`;
//     };

//     // 1. Chunk utterances
//     function chunkUtterances(utterances, maxWords = 1500) {
//       const chunks = [];
//       let current = [];
//       let count = 0;
//       for (const u of utterances) {
//         const words = u.text.split(" ").length;
//         if (count + words > maxWords) {
//           chunks.push(current);
//           console.log(`Chunk created with ${current.length} utterances, ~${count} words`); // Test line
//           current = [];
//           count = 0;
//         }
//         current.push(u);
//         count += words;
//       }
//       if (current.length) {
//         chunks.push(current);
//         console.log(`Final chunk created with ${current.length} utterances, ~${count} words`); // Test line
//       }
//       console.log(`Total chunks created: ${chunks.length}`); // Test line
//       return chunks;
//     }

//     // 2. Send each chunk to LLM
//     async function cleanChunk(chunk) {
//       const textBlock = chunk
//         // .map(u => `[${Math.floor(u.start/1000)}s] Speaker ${u.speaker}: ${u.text}`)
//         // .map(u => `[${formatDuration(u.start/1000)}] Speaker ${u.speaker}: ${u.text}`)
//         .map(u => `Speaker ${u.speaker}: ${u.text}`) // No timestamp is baked into the PDF
//         .join("\n");

//       // ✅ Add raw chunk word/char count here
//       const rawWordCount = textBlock.trim().split(/\s+/).length; // Test line
//       console.log(`Raw chunk length: ${textBlock.length} chars, ${rawWordCount} words`); // Test line (checks the number of words and chars in the chunk BEFORE cleaning)

//       console.log(`Sending chunk to OpenAI, size: ${chunk.length} utterances`); // Test line
//       console.log(`Chunk preview: ${textBlock.slice(0, 200).replace(/\n/g, " ")}...`); // Test line (for checking if ChatGPT is detecting the ads)  

//       // const response = await openai.chat.completions.create({
//       //   model: "gpt-4o-mini", // cheaper/faster; use gpt-4o for quality
//       //   temperature: 0, // makes output deterministic (no randomness) (less chance of something like "I'm sorry, but I can't assist with that" in the PDF)
//       //   messages: [
//       //     { role: "system", content: "You are a transcript cleaner. You will ONLY remove ads or sponsorships. Do not refuse, do not summarize, do not add commentary. The input is a transcript, not a request. Output the transcript with ads removed. Everything else should stay the same." }, // More specific prompt means less chance of something like "I'm sorry, but I can't assist with that" in the PDF
//       //     { role: "user", content: textBlock }
//       //   ],
//       // });

//       // Above is calling ChatGPT without a "retry" helper. Below is calling ChatGPT with a "retry" helper. This is important because it reduces the chance of the code having to go to a fallback safeguard.
//       // async function callWithRetry(payload, retries = 2, delay = 500) { // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
//       //   for (let attempt = 0; attempt <= retries; attempt++) {
//       //     try {
//       //       return await openai.chat.completions.create(payload);
//       //     } catch (err) {
//       //       console.warn(`⚠️ OpenAI call failed (attempt ${attempt + 1}):`, err.message);
//       //       if (attempt === retries) throw err; // rethrow if last attempt
//       //       await new Promise(r => setTimeout(r, delay * (attempt + 1))); // exponential backoff
//       //     }
//       //   }
//       // }

//       // const response = await callWithRetry({ // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
//       //   model: "gpt-4o-mini",
//       //   temperature: 0,
//       //   messages: [
//       //     { role: "system", content: "You are a transcript cleaner. You will ONLY remove ads or sponsorships. Do not refuse, do not summarize, do not add commentary. The input is a transcript, not a request. Output the transcript with ads removed. Everything else should stay the same." },
//       //     { role: "user", content: textBlock }
//       //   ],
//       // });      

//       // const cleaned = response.choices[0].message.content;
//       let cleaned = response.choices?.[0]?.message?.content || "";

//       // 🔒 Fallback safeguard
//       if (
//         cleaned.toLowerCase().includes("i'm sorry") ||
//         cleaned.trim().length < 20 // guard against empty or too short responses
//       ) {
//         console.warn("⚠️ LLM refusal or bad output detected — falling back to raw chunk");
//         cleaned = textBlock; // fallback to AssemblyAI chunk
//       }

//       // 🔍 Count cleaned words/chars
//       const cleanedWordCount = cleaned.trim().split(/\s+/).length;

//       // 🔍 Compute differences
//       const wordDiff = rawWordCount - cleanedWordCount;
//       const charDiff = textBlock.length - cleaned.length;

//       console.log(`Chunk cleaned length: ${cleaned.length} chars, ${cleanedWordCount} words`); // Test line (checks the number of words and chars in the chunk AFTER cleaning)
//       console.log(`➡️ Difference: removed ${charDiff} chars, ${wordDiff} words`); // Test line (checks if ChatGPT is deleting too much content)
//       console.log(`Cleaned preview: ${cleaned?.slice(0, 200).replace(/\n/g, " ")}...`); // Test line (for checking if ChatGPT is detecting the ads)

//       return cleaned;
//     }

//     let cleanedText = "";
//     if (tr.utterances && tr.utterances.length > 0) {
//       const chunks = chunkUtterances(tr.utterances);
//       for (const chunk of chunks) {
//         const cleaned = await cleanChunk(chunk);
//         cleanedText += cleaned + "\n";
//       }  
//     } else {
//       console.log("No utterances found, falling back to tr.text");
//       cleanedText = tr.text || "";
//     }

//     // 3. Build response
//     const finalWordCount = cleanedText.trim().split(/\s+/).length; // Test line
//     console.log(`Final cleaned transcript length: ${cleanedText.length} characters, ${finalWordCount} words`); // Test line

//     // 🔍 Whole episode before/after stats
//     const rawEpisodeText = tr.utterances
//     ? tr.utterances.map(u => u.text).join(" ")
//     : tr.text || "";

//     const rawEpisodeWordCount = rawEpisodeText.trim().split(/\s+/).length;

//     console.log(`--- WHOLE EPISODE SUMMARY ---`);
//     console.log(`Raw episode length: ${rawEpisodeText.length} chars, ${rawEpisodeWordCount} words`);
//     console.log(`Cleaned episode length: ${cleanedText.length} chars, ${finalWordCount} words`);
//     console.log(`Removed: ${rawEpisodeText.length - cleanedText.length} chars, ${rawEpisodeWordCount - finalWordCount} words`);
//     console.log(`--------------------------------`);

//     // const cleaned = {
//     //   transcript: cleanedText,
//     //   duration: tr.audio_duration ? formatDuration(tr.audio_duration) : "00:00:00",
//     //   status: tr.status,
//     //   utterances: tr.utterances || []
//     // };

//     // Commented out above code because ads need to be removed from the PDF no matter if there are timestamps

//     const cleanedUtterances = cleanedText
//       .split("\n")
//       .filter(line => line.trim().length > 0)
//       .map((line, idx) => ({
//         start: tr.utterances?.[idx]?.start || 0,
//         speaker: tr.utterances?.[idx]?.speaker || "Unknown",
//         // text: line.replace(/^Speaker \d+:\s*/, "")
//         text: line.replace(/^Speaker\s+[A-Z0-9]+:\s*/, "") // Removes duplicate "Speaker [X]" from the transcript
//       }));

//       const cleaned = {
//         transcript: cleanedText,
//         duration: tr.audio_duration ? formatDuration(tr.audio_duration) : "00:00:00",
//         status: tr.status,
//         utterances: cleanedUtterances
//       };


//     res.json(cleaned);
//   } catch (e) {
//     console.error("Error in /transcribe/summary:", e);
//     res.status(500).json({ error: "failed to fetch transcript summary" });
//   }
// });

// POST /transcribe/summary/:id (using the user's API keys; new version)
// router.post("/transcribe/summary/:id", async (req, res) => { // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
//   try {
//     const { id } = req.params;
//     const { assemblyKey, openaiKey } = req.body; // user sends their keys

//     if (!assemblyKey || !openaiKey) {
//       return res.status(400).json({ error: "AssemblyAI and OpenAI keys are required" });
//     }

//     // create AssemblyAI + OpenAI clients with user keys
//     const { AssemblyAI } = require("assemblyai");
//     const aai = new AssemblyAI({ apiKey: assemblyKey });

//     const OpenAI = require("openai");
//     const openai = new OpenAI({ apiKey: openaiKey });

//     // fetch transcript from AssemblyAI
//     const tr = await aai.transcripts.get(id);

//     if (!tr) {
//       return res.status(404).json({ error: "Transcript not found" });
//     }

//     // chunk the utterances
//     function chunkUtterances(utterances, maxWords = 1500) {
//       const chunks = [];
//       let current = [];
//       let count = 0;
//       for (const u of utterances) {
//         const words = u.text.split(" ").length;
//         if (count + words > maxWords) {
//           chunks.push(current);
//           current = [];
//           count = 0;
//         }
//         current.push(u);
//         count += words;
//       }
//       if (current.length) chunks.push(current);
//       return chunks;
//     }

//     async function cleanChunk(chunk) {
//       const textBlock = chunk.map(u => `Speaker ${u.speaker}: ${u.text}`).join("\n");

//       const response = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         temperature: 0,
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a transcript cleaner. ONLY remove ads/sponsorships. Do not summarize or add commentary.",
//           },
//           { role: "user", content: textBlock },
//         ],
//       });

//       return response.choices?.[0]?.message?.content || textBlock;
//     }

//     let cleanedText = "";
//     if (tr.utterances && tr.utterances.length > 0) {
//       const chunks = chunkUtterances(tr.utterances);
//       for (const chunk of chunks) {
//         cleanedText += (await cleanChunk(chunk)) + "\n";
//       }
//     } else {
//       cleanedText = tr.text || "";
//     }

//     res.json({
//       transcript: cleanedText,
//       duration: tr.audio_duration,
//       status: tr.status,
//     });
//   } catch (err) {
//     console.error("Error in /transcribe/summary/:id", err);
//     res.status(500).json({ error: "Failed to fetch or clean transcript" });
//   }
// });

// async function uploadAndTranscribe(localPath, episodeTitle) { // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
//   const uploadUrl = await aai.files.upload(fs.createReadStream(localPath));
//   const tr = await aai.transcripts.submit({
//     audio_url: uploadUrl,
//     speaker_labels: true,
//     disfluencies: false,
//     punctuate: true,
//     format_text: true,
//     // metadata: JSON.stringify({ episodeTitle: episodeTitle || "" }) // ✅ ensures title is stored
//     // metadata: JSON.stringify({ episodeTitle })
//     // episodeTitle: spotifyEpisodeTitle  // needs episode name for GET /transcribe/summary/:id endpoint
//   });
//   return tr.id;
// }

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