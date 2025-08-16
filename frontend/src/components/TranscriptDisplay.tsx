import React from "react";

function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
}  

export default function TranscriptDisplay({ title, duration, text, utterances, showTimestamps }) {
    return (
        <div className="transcript-box">
            <p><strong>Episode name:</strong> {title}</p>
            <p><strong>Duration:</strong> {duration}</p>
            <hr />
            {/* <pre>{text}</pre> */}
            {utterances && utterances.length > 0 ? (
                utterances.map((utt, idx) => (
                <div key={idx} style={{ marginBottom: "1rem" }}>
                    {showTimestamps && <span>[{formatTime(utt.start)}] </span>}
                    <strong>Speaker {utt.speaker}:</strong> {utt.text}
                </div>
                ))
            ) : (
                <pre>{text}</pre>  // fallback to raw transcript
            )}
            {/* Line 9 is the transcription without speakers and timestamps. Lines 18-27 is the transcription with speakers and timestamps. */}
        </div>
    );
}
  