import { useState } from "react";
import Instructions from "./components/Instructions";
import LinkInput from "./components/LinkInput";
import SubmitButton from "./components/SubmitButton";
import LoadingSpinner from "./components/LoadingSpinner";
import TranscriptDisplay from "./components/TranscriptDisplay";
import ApiKeys from "./components/ApiKeys";

function App() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [filterProfanity, setFilterProfanity] = useState(false); // Added line for profanity filter toggle
  const [showTimestamps, setShowTimestamps] = useState(false); // Added line for timestamps toggle
  const [transcriptData, setTranscriptData] = useState(null);
  const [controlsDisabled, setControlsDisabled] = useState(false); // Added line to "disable" settings/Transcript button after the user clicks "Transcribe"
  const [episodeDuration, setEpisodeDuration] = useState(null); // Added line for getting duration of episode (useful for estimating how line the transcription will take)

  async function startTranscription(audioUrl, filterProfanity) { // 🚨 Using user's API keys now
    const assemblyKey = localStorage.getItem("assemblyai_api_key");
    if (!assemblyKey) throw new Error("Missing AssemblyAI API key");
  
    // 1. Create transcript job via backend
    const res = await fetch("/api/aai/transcripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl, assemblyKey, filterProfanity }),
    });
    const job = await res.json();
  
    // 2. Poll via backend
    let tr = job;
    while (tr.status === "queued" || tr.status === "processing") {
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetch(`/api/aai/transcripts/${job.id}?assemblyKey=${assemblyKey}`);
      tr = await poll.json();
    }
  
    if (tr.status !== "completed") {
      throw new Error("Transcription failed: " + tr.error);
    }
  
    return tr;
  }  
  
  async function cleanTranscript(transcriptText) { // 🚨 Using user's API keys now
    const openaiKey = localStorage.getItem("openai_api_key");
    if (!openaiKey) throw new Error("Missing OpenAI API key");
  
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
              "You are a transcript cleaner. ONLY remove ads or sponsorships. Do not summarize or add commentary.",
          },
          { role: "user", content: transcriptText },
        ],
      }),
    });
  
    const data = await res.json();
    return data.choices?.[0]?.message?.content || transcriptText;
  }  

  // const handleSubmit = async () => { // 🚨 COMMENTED OUT BECAUSE NOT USING MY API KEYS ANYMORE
  //   setLoading(true);
  //   setControlsDisabled(true);   // Disable checkboxes and transcribe button
  //   try {
  //     // Step 1: Start transcription & get title
  //     const res = await fetch("/transcribe", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ spotifyUrl: link, filterProfanity }), // Added filterProfanity for profanity filter toggle
  //     });
  //     const data = await res.json();

  //     if (!data.id) {
  //       alert(data.error || "No transcription ID returned");
  //       setLoading(false);
  //       return;
  //     }

  //     const episodeTitle = data.episodeTitle; // from backend
  //     const episodeDate = data.episodeDate;
  //     const creator = data.creator;

  //     const durationMinutes = Math.ceil((data.durationMs || 0) / 60000);
  //     setEpisodeDuration(durationMinutes);

  //     // Date should be in [Month] [Day], [Year], not yyyy-mm-dd
  //     let formattedDate = "Unknown Date";
  //     if (episodeDate && episodeDate !== "Unknown Date") {
  //       const [year, month, day] = episodeDate.split("-");
  //       const dateObj = new Date(Number(year), Number(month) - 1, Number(day)); 
  //       formattedDate = dateObj.toLocaleDateString("en-US", {
  //         year: "numeric",
  //         month: "long",
  //         day: "numeric"
  //       });
  //     }

  //     // console.log("Episode title from backend:", episodeTitle); // Test line (works!)
  //     console.log("Episode date from backend:", episodeDate); // Test line
  //     console.log("Episode creator from backend:", creator); // Test line

  //     // Step 2: Poll until done
  //     let status = data.status;
  //     while (status !== "completed" && status !== "error") {
  //       await new Promise(r => setTimeout(r, 5000)); // wait 5 sec
  //       const pollRes = await fetch(`/transcribe/${data.id}`);
  //       const tr = await pollRes.json();
  //       status = tr.status;
  //     }

  //     if (status === "completed") {
  //       // Step 3: Fetch summary for transcript + duration
  //       const summaryRes = await fetch(`/transcribe/summary/${data.id}`);
  //       const summaryData = await summaryRes.json();

  //       // Step 4: Store all metadata
  //       setTranscriptData({
  //         title: episodeTitle,
  //         date: formattedDate, // Get date of episode
  //         creator: creator, // Get creator of episode
  //         duration: summaryData.duration,
  //         transcript: summaryData.transcript,
  //         utterances: summaryData.utterances // Added line for speakers to display in transcription
  //       });
  //     } else {
  //       alert("Transcription failed.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  //   setLoading(false);
  // };

  const handleSubmit = async () => { // 🚨 Using user's API keys now
    setLoading(true);
    setControlsDisabled(true);
    try {
      // Step 1: Resolve Spotify → MP3 via backend
      const res = await fetch("/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyUrl: link }),
      });
      const data = await res.json();
      if (!data.audioUrl) {
        alert(data.error || "No audio URL returned");
        setLoading(false);
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
  
      // Step 3: Clean transcript with OpenAI
      const cleaned = await cleanTranscript(tr.text);

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
        transcript: cleaned,
        utterances: tr.utterances,
      });
    } catch (err) {
      console.error(err);
      alert("Error during transcription.");
    }
    setLoading(false);
  };

  return (
    <div id="root">
      <div className="website-header">
        <img src="SpotifyLogo.png" width="60px" alt="Spotify logo" />
        <h1>Spotify Transcriber</h1>
        <img src="Notes.png" width="60px" alt="Spotify logo" />
      </div>
      <div className="author-section">Made by <a href="https://www.linkedin.com/in/harry23yu/" target="_blank" rel="noopener noreferrer">Harry Yu</a></div>
      <div className="main-content">
        <Instructions />
        <div className="transcription-stuff">
          <ApiKeys />
          <LinkInput value={link} onChange={setLink} />
          <SubmitButton onClick={handleSubmit} disabled={controlsDisabled}/>
          {/* The code within the options className is for profanity filter and timestamps toggle */}
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
                When this is turned on, timestamps will appear before each speaker's paragraph. Please note that timestamps are approximate. They show when each speaker started talking, not the exact time it took to say the whole paragraph. A short line may look long if there was a pause after it, and a long paragraph may look short if the system grouped it tightly. Use timestamps as rough markers of where you are in the episode (for example, [01:25:30] in a 1 hour 30 minute episode means you're close to the end of the transcript), not precise durations.
              </span>
            </span>
          </div>
          {/* {loading && <LoadingSpinner />} */}
          {/* {loading && <LoadingSpinner durationMinutes={episodeDurationInMinutes} />} */}
          {loading && episodeDuration && (
            <LoadingSpinner durationMinutes={episodeDuration} />
          )}
          {/* {transcript && <TranscriptDisplay text={transcript} />} */}
          {transcriptData && (
              <TranscriptDisplay
                title={transcriptData.title}
                date={transcriptData.date}        // pass date
                creator={transcriptData.creator}  // pass creator
                duration={transcriptData.duration}
                text={transcriptData.transcript}
                utterances={transcriptData.utterances} // Added line for speakers to display in transcription
                showTimestamps={showTimestamps} // Added line for timestamps to display in transcription
              />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;