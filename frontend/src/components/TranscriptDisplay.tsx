import React from "react";
import jsPDF from "jspdf";

function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
}  

export default function TranscriptDisplay({ title, date, creator, duration, text, utterances, showTimestamps }) {

    const handleDownloadPDF = () => {

        const BODY_FONT = 12;
        const FOOTER_FONT = 10;

        const doc = new jsPDF();
      
        // Episode metadata
        doc.setFontSize(16);
        doc.text("Episode Transcript", 10, 10);
        doc.setFontSize(BODY_FONT);
        doc.text(`Episode name: ${title}`, 10, 20);
        doc.text(`Date: ${date}`, 10, 30);
        doc.text(`Creator: ${creator}`, 10, 40);
        doc.text(`Duration: ${duration}`, 10, 50);
      
        let y = 70;
        let lineHeight = BODY_FONT * 0.58;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        let pageNumber = 1;
      
        const addPageNumber = () => {
          const prev = doc.getFontSize();
          doc.setFontSize(FOOTER_FONT);
          doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: "center" });
          doc.setFontSize(prev); // restore body font
        };

        const addParagraphs = (wrappedLines) => {
          wrappedLines.forEach((line) => {
            // If we're near the bottom, finish the page and start a new one
            if (y + lineHeight > pageHeight - 20) {
              addPageNumber();
              doc.addPage();
              pageNumber++;
              y = 20;
              doc.setFontSize(BODY_FONT);     // Make sure body font is restored
              lineHeight = BODY_FONT * 0.58;  // Keep spacing consistent
            }
            doc.text(line, 10, y);
            y += lineHeight;
          });
          y += lineHeight; // Add an empty line between speakers/paragraphs
        };

        // Ads should not appear in the PDF if possible, regardless of timestamps are turned on
        if (utterances && utterances.length > 0) {
          utterances.forEach((utt) => {
            const timestamp = showTimestamps ? `[${formatTime(utt.start)}] ` : "";
            const line = `${timestamp}${utt.speaker ? "Speaker " + utt.speaker + ": " : ""}${utt.text}`;
            const split = doc.splitTextToSize(line, 180);
            addParagraphs(split);
          });
        } else if (text && text.trim().length > 0) {
          const split = doc.splitTextToSize(text, 180);
          addParagraphs(split);
        }        
      
        addPageNumber();  // Add number to last page
        doc.save(`${title}.pdf`);
      };      

    return (
        <div className="transcript-box">
            <div className="episode-header">
                <p><strong>Episode name:</strong> {title}</p>
                <p><strong>Date:</strong> {date}</p>
                <p><strong>Creator:</strong> {creator}</p>
                <p><strong>Duration:</strong> {duration}</p>
                <p>🎉 Transcript and PDF ready! Liked this tool? ⭐ Star it on <a href="https://github.com/harry23yu/PodcastTranscriber" target="_blank" rel="noopener noreferrer">GitHub</a>!</p>
                <button onClick={handleDownloadPDF} className="download-btn">
                    Download PDF
                </button>
            </div>
            <hr />
            {utterances && utterances.length > 0 ? (
                utterances.map((utt, idx) => (
                <div key={idx} style={{ marginBottom: "1rem" }}>
                    {showTimestamps && <span>[{formatTime(utt.start)}] </span>}
                    <strong>Speaker {utt.speaker}:</strong> {utt.text}
                </div>
                ))
            ) : (
                <pre>{text}</pre>  // Fallback to raw transcript
            )}
        </div>
    );
}