// import { useState } from "react";
// import Instructions from "./components/Instructions";
// import LinkInput from "./components/LinkInput";
// import SubmitButton from "./components/SubmitButton";
// import LoadingSpinner from "./components/LoadingSpinner";
// import TranscriptDisplay from "./components/TranscriptDisplay";

// function App() {
//   const [link, setLink] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [filterProfanity, setFilterProfanity] = useState(false); // Added line for profanity filter toggle
//   const [showTimestamps, setShowTimestamps] = useState(false); // Added line for timestamps toggle
//   const [transcriptData, setTranscriptData] = useState(null);
//   const [controlsDisabled, setControlsDisabled] = useState(false); // Added line to "disable" settings/Transcript button after the user clicks "Transcribe"

//   const handleSubmit = async () => {
//     setLoading(true);
//     setControlsDisabled(true);   // Disable checkboxes and transcribe button
//     try {
//       // Step 1: Start transcription & get title
//       const res = await fetch("/transcribe", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ spotifyUrl: link, filterProfanity }), // Added filterProfanity for profanity filter toggle
//       });
//       const data = await res.json();

//       if (!data.id) {
//         alert(data.error || "No transcription ID returned");
//         setLoading(false);
//         return;
//       }

//       const episodeTitle = data.episodeTitle; // from backend
//       const episodeDate = data.episodeDate;
//       const creator = data.creator;

//       // Date should be in [Month] [Day], [Year], not yyyy-mm-dd
//       let formattedDate = "Unknown Date";
//       if (episodeDate && episodeDate !== "Unknown Date") {
//         const [year, month, day] = episodeDate.split("-");
//         const dateObj = new Date(Number(year), Number(month) - 1, Number(day)); 
//         formattedDate = dateObj.toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric"
//         });
//       }

//       // console.log("Episode title from backend:", episodeTitle); // Test line (works!)
//       console.log("Episode date from backend:", episodeDate); // Test line
//       console.log("Episode creator from backend:", creator); // Test line

//       // Step 2: Poll until done
//       let status = data.status;
//       while (status !== "completed" && status !== "error") {
//         await new Promise(r => setTimeout(r, 5000)); // wait 5 sec
//         const pollRes = await fetch(`/transcribe/${data.id}`);
//         const tr = await pollRes.json();
//         status = tr.status;
//       }

//       if (status === "completed") {
//         // Step 3: Fetch summary for transcript + duration
//         const summaryRes = await fetch(`/transcribe/summary/${data.id}`);
//         const summaryData = await summaryRes.json();

//         // Step 4: Store all metadata
//         setTranscriptData({
//           title: episodeTitle,
//           date: formattedDate, // Get date of episode
//           creator: creator, // Get creator of episode
//           duration: summaryData.duration,
//           transcript: summaryData.transcript,
//           utterances: summaryData.utterances // Added line for speakers to display in transcription
//         });
//       } else {
//         alert("Transcription failed.");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//     setLoading(false);
//   };

  

//   return (
//     <div id="root">
//       <h1>Spotify Transcriber</h1>
//       <div className="main-content">
//         <Instructions />
//         <div className="transcription-stuff">
//           <LinkInput value={link} onChange={setLink} />
//           <SubmitButton onClick={handleSubmit} disabled={controlsDisabled}/>
//           {/* The code within the options className is for profanity filter and timestamps toggle */}
//           <div className="options">
//             <label>
//               <input
//                 type="checkbox"
//                 checked={filterProfanity}
//                 onChange={(e) => setFilterProfanity(e.target.checked)}
//                 disabled={controlsDisabled}
//               />
//               Disable profanity?
//             </label>
//             <span className="tooltip">
//               ⓘ
//               <span className="tooltiptext">
//                 When this is turned on, bad words like the F-word will be written as F***.
//               </span>
//             </span>
//             <br></br>
//             <label>
//               <input
//                 type="checkbox"
//                 checked={showTimestamps}
//                 onChange={(e) => setShowTimestamps(e.target.checked)}
//                 disabled={controlsDisabled}
//               />
//               Show timestamps
//             </label>
//             <span className="tooltip">
//               ⓘ
//               <span className="tooltiptext">
//                 When this is turned on, timestamps will appear before each speaker's paragraph.
//               </span>
//             </span>
//           </div>
//           {loading && <LoadingSpinner />}
//           {/* {transcript && <TranscriptDisplay text={transcript} />} */}
//           {transcriptData && (
//               <TranscriptDisplay
//                 title={transcriptData.title}
//                 date={transcriptData.date}        // pass date
//                 creator={transcriptData.creator}  // pass creator
//                 duration={transcriptData.duration}
//                 text={transcriptData.transcript}
//                 utterances={transcriptData.utterances} // Added line for speakers to display in transcription
//                 showTimestamps={showTimestamps} // Added line for timestamps to display in transcription
//               />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

// MY CODE IS ABOVE. CODE FROM 16TH GITHUB COMMIT IS BELOW.

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
  const [filterProfanity, setFilterProfanity] = useState(false); // Added line for profanity filter toggle
  const [showTimestamps, setShowTimestamps] = useState(false); // Added line for timestamps toggle
  const [transcriptData, setTranscriptData] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Step 1: Start transcription & get title
      const res = await fetch("/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyUrl: link, filterProfanity }), // Added filterProfanity for profanity filter toggle
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
          transcript: summaryData.transcript,
          utterances: summaryData.utterances // Added line for speakers to display in transcription
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
          {/* The code within the options className is for profanity filter and timestamps toggle */}
          <div className="options">
            <label>
              <input
                type="checkbox"
                checked={filterProfanity}
                onChange={(e) => setFilterProfanity(e.target.checked)}
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
              />
              Show timestamps
            </label>
            <span className="tooltip">
              ⓘ
              <span className="tooltiptext">
                When this is turned on, timestamps will appear before each speaker's paragraph.
              </span>
            </span>
          </div>
          {loading && <LoadingSpinner />}
          {/* {transcript && <TranscriptDisplay text={transcript} />} */}
          {transcriptData && (
              <TranscriptDisplay
                title={transcriptData.title}
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