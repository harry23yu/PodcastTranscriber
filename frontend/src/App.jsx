import { useState } from "react";
import Instructions from "./components/Instructions";
import LinkInput from "./components/LinkInput";
import SubmitButton from "./components/SubmitButton";
import LoadingSpinner from "./components/LoadingSpinner";
import TranscriptDisplay from "./components/TranscriptDisplay";

function App() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  // const handleSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     // Step 1: Start transcription
  //     const res = await fetch("/transcribe", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ spotifyUrl: link }),
  //     });
  //     const data = await res.json();

  //     // Check if id exists before polling
  //     if (!data.id) {
  //       alert(data.error || "No transcription ID returned");
  //       setLoading(false);
  //       return;
  //     }      
  
  //     // Step 2: Poll until done
  //     let status = data.status;
  //     let tr;
  //     while (status !== "completed" && status !== "error") {
  //       await new Promise(r => setTimeout(r, 5000)); // wait 5 sec
  //       const pollRes = await fetch(`/transcribe/${data.id}`);
  //       tr = await pollRes.json();
  //       status = tr.status;
  //     }
  
  //     if (status === "completed") {
  //       setTranscript(tr.text);
  //     } else {
  //       alert("Transcription failed.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  //   setLoading(false);
  // };

  // Right above is my previous handleSubmit that worked very well. Right below is the modified POST handleSubmit because I need to display the title and length of the episode, not just the transcript.

  const [transcriptData, setTranscriptData] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Step 1: Start transcription & get title
      const res = await fetch("/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyUrl: link }),
      });
      const data = await res.json();

      if (!data.id) {
        alert(data.error || "No transcription ID returned");
        setLoading(false);
        return;
      }

      const episodeTitle = data.episodeTitle; // from backend

      // console.log("Episode title from backend:", episodeTitle); // Test line (works!)

      // Step 2: Poll until done
      let status = data.status;
      while (status !== "completed" && status !== "error") {
        await new Promise(r => setTimeout(r, 5000)); // wait 5 sec
        const pollRes = await fetch(`/transcribe/${data.id}`);
        const tr = await pollRes.json();
        status = tr.status;
      }

      if (status === "completed") {
        // Step 3: Fetch summary for transcript + duration
        const summaryRes = await fetch(`/transcribe/summary/${data.id}`);
        const summaryData = await summaryRes.json();

        // Step 4: Store all metadata
        setTranscriptData({
          title: episodeTitle,
          duration: summaryData.duration,
          transcript: summaryData.transcript
        });
      } else {
        alert("Transcription failed.");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  

  return (
    <div id="root">
      <h1>Spotify Transcriber</h1>
      <div className="main-content">
        <Instructions />
        <div className="transcription-stuff">
          <LinkInput value={link} onChange={setLink} />
          <SubmitButton onClick={handleSubmit} />
          {loading && <LoadingSpinner />}
          {/* {transcript && <TranscriptDisplay text={transcript} />} */}
          {transcriptData && (
            <TranscriptDisplay
              title={transcriptData.title}
              duration={transcriptData.duration}
              text={transcriptData.transcript}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
