import { useState } from "react";
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
  //     // const res = await fetch("http://localhost:5000/transcribe", {
  //     //   method: "POST",
  //     //   headers: { "Content-Type": "application/json" },
  //     //   body: JSON.stringify({ spotifyUrl: link }),
  //     // });
  //     const res = await fetch("/transcribe", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ audioUrl: link }),
  //     });      
  //     const data = await res.json();
  //     setTranscript(data.transcript);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Something went wrong with transcription. Please try again.");
  //   }
  //   setLoading(false);
  // };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Step 1: Start transcription
      const res = await fetch("/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyUrl: link }),
      });
      const data = await res.json();

      // Check if id exists before polling
      if (!data.id) {
        alert(data.error || "No transcription ID returned");
        setLoading(false);
        return;
      }      
  
      // Step 2: Poll until done
      let status = data.status;
      let tr;
      while (status !== "completed" && status !== "error") {
        await new Promise(r => setTimeout(r, 5000)); // wait 5 sec
        const pollRes = await fetch(`/transcribe/${data.id}`);
        tr = await pollRes.json();
        status = tr.status;
      }
  
      if (status === "completed") {
        setTranscript(tr.text);
      } else {
        alert("Transcription failed.");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };
  

  return (
    <div>
      <h1>Spotify Transcriber</h1>
      <LinkInput value={link} onChange={setLink} />
      <SubmitButton onClick={handleSubmit} />
      {loading && <LoadingSpinner />}
      {transcript && <TranscriptDisplay text={transcript} />}
    </div>
  );
}

export default App;
