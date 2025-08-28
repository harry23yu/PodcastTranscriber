import { useState } from "react";
import Instructions from "./components/Instructions";
import LinkInput from "./components/LinkInput";
import SubmitButton from "./components/SubmitButton";
import LoadingSpinner from "./components/LoadingSpinner";
import TranscriptDisplay from "./components/TranscriptDisplay";
import ApiKeys from "./components/ApiKeys";
import { Routes, Route, Link } from "react-router-dom";
import KeysInstructions from "./components/KeysInstructions";

function App() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [filterProfanity, setFilterProfanity] = useState(false); // Added line for profanity filter toggle
  const [showTimestamps, setShowTimestamps] = useState(false); // Added line for timestamps toggle
  const [transcriptData, setTranscriptData] = useState(null);
  const [controlsDisabled, setControlsDisabled] = useState(false); // Added line to "disable" settings/Transcript button after the user clicks "Transcribe"
  const [episodeDuration, setEpisodeDuration] = useState(null); // Added line for getting duration of episode (useful for estimating how line the transcription will take)

  async function startTranscription(audioUrl, filterProfanity) { // Using user's API keys now
    const assemblyKey = localStorage.getItem("assemblyai_api_key");
    console.log("📦 Sending transcription request with AssemblyAI key:", assemblyKey?.slice(0, 6) + "..."); // Test line

    if (!assemblyKey) throw new Error("Missing AssemblyAI API key");
  
    // 1. Create transcript job via backend
    const res = await fetch("https://podcasttranscriber.onrender.com/api/aai/transcripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl, assemblyKey, filterProfanity }),
    });
    const job = await res.json();
  
    // 2. Poll via backend
    let tr = job;
    while (tr.status === "queued" || tr.status === "processing") {
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetch(`https://podcasttranscriber.onrender.com/api/aai/transcripts/${job.id}?assemblyKey=${assemblyKey}`);
      tr = await poll.json();
    }

    console.log("📊 Final transcript status:", tr.status); // Test line
    if (tr.error) console.error("❌ Transcript error:", tr.error); // Test line

    if (tr.status !== "completed") {
      if (tr.error?.toLowerCase().includes("unauthorized")) {
        alert("Invalid AssemblyAI API key. Please check and try again.");
      } else {
        alert("Transcription failed: " + tr.error);
      }
      throw new Error("Transcription failed: " + tr.error);
    }
  
    return tr;
  }

  // New cleanTranscript (chunking + safeguards + logging)
  async function cleanTranscript(utterances) {
    const openaiKey = localStorage.getItem("openai_api_key");
    if (!openaiKey) {
      console.warn("⚠️ No OpenAI key provided — skipping ad removal.");
      return { transcript: utterances.map(u => u.text).join(" "), utterances };
    }

    console.log("🧹 Starting ad-cleaning with OpenAI (utterance-based)...");

    // Helper: chunk utterances (~1500 words max per chunk)
    function chunkUtterances(utterances, maxWords = 1500) {
      const chunks = [];
      let current = [];
      let count = 0;
      for (const u of utterances) {
        const words = u.text.split(" ").length;
        if (count + words > maxWords) {
          chunks.push(current);
          current = [];
          count = 0;
        }
        current.push(u);
        count += words;
      }
      if (current.length) chunks.push(current);
      console.log(`Total chunks created: ${chunks.length}`);
      return chunks;
    }

    const chunks = chunkUtterances(utterances);
    let cleanedText = "";

    for (const [i, chunk] of chunks.entries()) {
      const textBlock = chunk.map(u => `Speaker ${u.speaker}: ${u.text}`).join("\n");
      const rawWordCount = textBlock.trim().split(/\s+/).length;
      console.log(`Chunk ${i + 1}: raw length ${textBlock.length} chars, ${rawWordCount} words`);
      console.log(`Chunk ${i + 1} preview: ${textBlock.slice(0, 200).replace(/\n/g, " ")}...`);

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "You are a transcript cleaner. Remove ONLY ads, sponsor messages, or promotional segments. Keep everything else unchanged. Do not summarize. Do not add commentary. Output the cleaned transcript text directly.",
            },
            { role: "user", content: textBlock },
          ],
        }),
      });

      const data = await res.json();

      let cleanedChunk = data.choices?.[0]?.message?.content || "";
      let cleanedWordCount = cleanedChunk.trim().split(/\s+/).length;

      // Safeguard: fall back if bad/empty/refusal output
      const tooShort = cleanedChunk.trim().length < 20;
      const looksEmpty = !cleanedChunk;
      const refusalMessage =
        cleanedChunk.toLowerCase().includes("i'm sorry") &&
        cleanedChunk.toLowerCase().includes("assist with that");

      if (looksEmpty || tooShort || refusalMessage) {
        console.warn(`⚠️ Chunk ${i + 1}: bad LLM output — falling back to original chunk`);
        cleanedChunk = textBlock;
        cleanedWordCount = rawWordCount;
      }

      console.log(
        `Chunk ${i + 1}: cleaned length ${cleanedChunk.length} chars, ${cleanedWordCount} words (removed ${rawWordCount - cleanedWordCount} words)`
      );
      console.log(`Cleaned preview: ${cleanedChunk.slice(0, 200).replace(/\n/g, " ")}...`);

      cleanedText += cleanedChunk + "\n";
    }

    // Rebuild cleaned utterances (so TranscriptDisplay + PDF show cleaned version)
    const cleanedUtterances = cleanedText
      .split("\n")
      .filter(line => line.trim().length > 0)
      .map((line, idx) => ({
        start: utterances[idx]?.start || 0,
        speaker: utterances[idx]?.speaker || "Unknown",
        text: line.replace(/^Speaker\s+[A-Z0-9]+:\s*/, "")
      }));

    // Whole transcript stats
    const rawWordCount = utterances.map(u => u.text).join(" ").split(/\s+/).length;
    const cleanedWordCount = cleanedText.trim().split(/\s+/).length;
    console.log(`--- WHOLE EPISODE SUMMARY ---`);
    console.log(`Raw transcript: ${rawWordCount} words`);
    console.log(`Cleaned transcript: ${cleanedWordCount} words`);
    console.log(`Removed: ${rawWordCount - cleanedWordCount} words`);
    console.log(`--------------------------------`);

    return { transcript: cleanedText.trim(), utterances: cleanedUtterances };
  }

  const handleSubmit = async () => { // Using user's API keys now
    setLoading(true);
    setControlsDisabled(true);
    try {
      // 🔒 Check that both keys are present before starting
      const assemblyKey = localStorage.getItem("assemblyai_api_key");
      const openaiKey = localStorage.getItem("openai_api_key");
      if (!assemblyKey) {
        alert("AssemblyAI key is required. OpenAI key is optional — use it if you want ads removed.");
        setLoading(false);
        setControlsDisabled(false);
        return;
      }

      // Step 1: Resolve Spotify → MP3 via backend
      const res = await fetch("https://podcasttranscriber.onrender.com/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyUrl: link }),
      });
      const data = await res.json();
      if (!data.audioUrl) {
        alert(data.error || "No audio URL returned");
        setLoading(false);
        setControlsDisabled(false); // Re-enable controls
        return;
      }
  
      const episodeTitle = data.episodeTitle;
      const episodeDate = data.episodeDate;
      const creator = data.creator;
      const durationMinutes = Math.ceil((data.durationMs || 0) / 60000);
      setEpisodeDuration(durationMinutes);
  
      let formattedDate = "Unknown Date";
      if (episodeDate && episodeDate !== "Unknown Date") {
        const [year, month, day] = episodeDate.split("-");
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        formattedDate = dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
  
      // Step 2: Call AssemblyAI directly with user's key
      const tr = await startTranscription(data.audioUrl, filterProfanity);
  
      // Step 3: Clean transcript with OpenAI (or skip if missing)
      const cleaned = await cleanTranscript(tr.utterances);

      // Helper to format seconds to hh:mm:ss
      function formatDuration(seconds) {
        const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
        const s = String(Math.floor(seconds % 60)).padStart(2, "0");
        return `${h}:${m}:${s}`;
      }     

      // Step 4: Save to state
      setTranscriptData({
        title: episodeTitle,
        date: formattedDate,
        creator: creator,
        duration: formatDuration(tr.audio_duration || 0),
        transcript: cleaned.transcript,
        utterances: cleaned.utterances,
      });
    } catch (err) {
      console.error(err);

      console.log("ERROR IS: ", err.message?.toLowerCase()); // Test line
      
      if (err.message?.toLowerCase().includes("assemblyai")) {
        alert("Invalid AssemblyAI key. Please check and try again.");
      }
      else if (err.message?.toLowerCase().includes("openai")) {
        alert("OpenAI key invalid or missing. Transcript will still work, but ads won't be removed.");
      }
      else {
        alert("Make sure your AssemblyAI key is accurate and not expired. Also, make sure you are pasting a Spotify episode, not a track or anything else.");
      }
      setControlsDisabled(false); // Re-enable controls
    }
    setLoading(false);
  };

  return (
    <div id="root">
      <div className="website-header">
        <img src="Episode.png" width="60px" alt="Episode logo" />
        <h1>Podcast Transcriber</h1>
        <img src="Notes.png" width="60px" alt="Notes logo" />
      </div>
      <div className="author-section">Made by <a href="https://www.linkedin.com/in/harry23yu/" target="_blank" rel="noopener noreferrer">Harry Yu</a></div>
      <Routes>
        <Route
          path="/"
          element={
            <div className="main-content">
              <Instructions />
              <div className="github-promotion">Liked this Spotify transcription tool? Feel free to leave a star on <a href="https://github.com/harry23yu/PodcastTranscriber" target="_blank" rel="noopener noreferrer">GitHub</a>!</div>
              <div className="transcription-stuff">
                <ApiKeys />
                <LinkInput value={link} onChange={setLink} />
                <SubmitButton onClick={handleSubmit} disabled={controlsDisabled}/>
                <div className="options">
                  <label>
                    <input
                      type="checkbox"
                      checked={filterProfanity}
                      onChange={(e) => setFilterProfanity(e.target.checked)}
                      disabled={controlsDisabled}
                    />
                    Disable profanity?
                  </label>
                  <span className="tooltip">
                    ⓘ
                    <span className="tooltiptext">
                      When this is turned on, bad words like the F-word will be written as F***.
                    </span>
                  </span>
                  <br></br>
                  <label>
                    <input
                      type="checkbox"
                      checked={showTimestamps}
                      onChange={(e) => setShowTimestamps(e.target.checked)}
                      disabled={controlsDisabled}
                    />
                    Show timestamps
                  </label>
                  <span className="tooltip">
                    ⓘ
                    <span className="tooltiptext">
                      When this is turned on, timestamps will appear before each speaker's paragraph. Please note that timestamps are approximate. They show when each speaker started talking, not the exact time it took to say the whole paragraph. A short line may look long if there was a pause after it, and a long paragraph may look short if the system grouped it tightly. Also, Spotify's dynamic ad insertion or OpenAI getting rid of ads can affect the timestamps, making them look a little bit inaccurate. Use timestamps as rough markers of where you are in the episode (for example, [01:25:30] in a 1 hour 30 minute episode means you're close to the end of the transcript), not precise durations.
                    </span>
                  </span>
                </div>
                {loading && episodeDuration && (
                  <LoadingSpinner durationMinutes={episodeDuration} />
                )}
                {transcriptData && (
                    <TranscriptDisplay
                      title={transcriptData.title}
                      date={transcriptData.date}
                      creator={transcriptData.creator}
                      duration={transcriptData.duration}
                      text={transcriptData.transcript}
                      utterances={transcriptData.utterances}
                      showTimestamps={showTimestamps}
                    />
                  )}
                </div>
              </div>
            }
          />
        <Route path="/KeysInstructions" element={<KeysInstructions />} />
      </Routes>
    </div>
  );
}

export default App;