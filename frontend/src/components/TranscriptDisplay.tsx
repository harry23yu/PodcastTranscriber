import React from "react";

export default function TranscriptDisplay({ title, duration, text }) {
    return (
        <div className="transcript-box">
            <p><strong>Episode name:</strong> {title}</p>
            <p><strong>Duration:</strong> {duration}</p>
            <hr />
            <pre>{text}</pre>
        </div>
    );
}
  