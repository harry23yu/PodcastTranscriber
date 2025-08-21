// import React from "react";
// import jsPDF from "jspdf";

// function formatTime(ms: number) {
//     const totalSeconds = Math.floor(ms / 1000);
//     const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
//     const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
//     const s = String(totalSeconds % 60).padStart(2, "0");
//     return `${h}:${m}:${s}`;
// }  

// export default function TranscriptDisplay({ title, date, creator, duration, text, utterances, showTimestamps }) {

//     const handleDownloadPDF = () => {
//         const doc = new jsPDF();
      
//         // Episode metadata
//         doc.setFontSize(16);
//         doc.text("Episode Transcript", 10, 10);
      
//         doc.setFontSize(12);
//         doc.text(`Episode name: ${title}`, 10, 20);
//         doc.text(`Date: ${date}`, 10, 30);
//         doc.text(`Creator: ${creator}`, 10, 40);
//         doc.text(`Duration: ${duration}`, 10, 50);
      
//         let y = 70; // Shift transcript start down since metadata is taller
//         const lineHeight = 7;
//         const pageHeight = doc.internal.pageSize.height;
//         const pageWidth = doc.internal.pageSize.width;
//         let pageNumber = 1;
      
//         const addPageNumber = () => {
//           doc.setFontSize(10);
//           doc.text(
//             `Page ${pageNumber}`,
//             pageWidth / 2,
//             pageHeight - 10,
//             { align: "center" }
//           );
//         };
      
//         const addParagraphs = (lines) => {
//           lines.forEach((line) => {
//             if (y + lineHeight > pageHeight - 20) {
//               addPageNumber();
//               doc.addPage();
//               pageNumber++;
//               y = 20;
//             }
//             doc.text(line, 10, y);
//             y += lineHeight;
//           });
//         };
      
//         // Old if statement (timestamps always appear in transcript no matter what)
//         // if (text && text.trim().length > 0) {
//         //   // ✅ Clean transcript (no ads, recommended)
//         //   const split = doc.splitTextToSize(text, 180);
//         //   addParagraphs(split);
//         // } 

//         // New if statement (timestamps only appear in PDF if user checks the "Show timestamps" box)
//         if (text && text.trim().length > 0) {
//           if (showTimestamps && utterances && utterances.length > 0) {
//             // 🔹 Rebuild with timestamps
//             utterances.forEach((utt) => {
//               const timestamp = formatTime(utt.start); // hh:mm:ss
//               const line = `[${timestamp}] ${utt.speaker ? "Speaker " + utt.speaker + ": " : ""}${utt.text}`;
//               const split = doc.splitTextToSize(line, 180);
//               addParagraphs(split);
//             });
//           } else {
//             // 🔹 No timestamps, just use cleaned transcript (still respects profanity filter)
//             const split = doc.splitTextToSize(text, 180);
//             addParagraphs(split);
//           }
//         }
//         else if (utterances && utterances.length > 0) {
//           // ❌ Only fallback if no clean text is available
//           utterances.forEach((utt) => {
//             const line = showTimestamps
//               ? `[${formatTime(utt.start)}] Speaker ${utt.speaker}: ${utt.text}`
//               : `Speaker ${utt.speaker}: ${utt.text}`;
//             const split = doc.splitTextToSize(line, 180);
//             addParagraphs(split);
//           });
//         }
      
//         // Add number to last page
//         addPageNumber();
      
//         doc.save(`${title}.pdf`);
//       };      

//     return (
//         <div className="transcript-box">
//             <div className="episode-header">
//                 <p><strong>Episode name:</strong> {title}</p>
//                 <p><strong>Date:</strong> {date}</p>
//                 <p><strong>Creator:</strong> {creator}</p>
//                 <p><strong>Duration:</strong> {duration}</p>
//                 <button onClick={handleDownloadPDF} className="download-btn">
//                     Download PDF
//                 </button>
//             </div>
//             <hr />
//             {/* <pre>{text}</pre> */}
//             {utterances && utterances.length > 0 ? (
//                 utterances.map((utt, idx) => (
//                 <div key={idx} style={{ marginBottom: "1rem" }}>
//                     {showTimestamps && <span>[{formatTime(utt.start)}] </span>}
//                     <strong>Speaker {utt.speaker}:</strong> {utt.text}
//                 </div>
//                 ))
//             ) : (
//                 <pre>{text}</pre>  // fallback to raw transcript
//             )}
//         </div>
//     );
// }

// MY CODE IS ABOVE. CODE FROM 16TH GITHUB COMMIT IS BELOW.

import React from "react";
import jsPDF from "jspdf";

function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
}  

export default function TranscriptDisplay({ title, duration, text, utterances, showTimestamps }) {

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
      
        // Episode metadata
        doc.setFontSize(16);
        doc.text("Episode Transcript", 10, 10);
      
        doc.setFontSize(12);
        doc.text(`Episode name: ${title}`, 10, 20);
        doc.text(`Duration: ${duration}`, 10, 30);
      
        let y = 50;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        let pageNumber = 1;
      
        const addPageNumber = () => {
          doc.setFontSize(10);
          doc.text(
            `Page ${pageNumber}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        };
      
        const addParagraphs = (lines) => {
          lines.forEach((line) => {
            if (y + lineHeight > pageHeight - 20) {
              addPageNumber();
              doc.addPage();
              pageNumber++;
              y = 20;
            }
            doc.text(line, 10, y);
            y += lineHeight;
          });
        };
      
        // Old if statement (timestamps always appear in transcript no matter what)
        // if (text && text.trim().length > 0) {
        //   // ✅ Clean transcript (no ads, recommended)
        //   const split = doc.splitTextToSize(text, 180);
        //   addParagraphs(split);
        // } 

        // New if statement (timestamps only appear in PDF if user checks the "Show timestamps" box)
        if (text && text.trim().length > 0) {
          if (showTimestamps && utterances && utterances.length > 0) {
            // 🔹 Rebuild with timestamps
            utterances.forEach((utt) => {
              const timestamp = formatTime(utt.start); // hh:mm:ss
              const line = `[${timestamp}] ${utt.speaker ? "Speaker " + utt.speaker + ": " : ""}${utt.text}`;
              const split = doc.splitTextToSize(line, 180);
              addParagraphs(split);
            });
          } else {
            // 🔹 No timestamps, just use cleaned transcript (still respects profanity filter)
            const split = doc.splitTextToSize(text, 180);
            addParagraphs(split);
          }
        }
        else if (utterances && utterances.length > 0) {
          // ❌ Only fallback if no clean text is available
          utterances.forEach((utt) => {
            const line = showTimestamps
              ? `[${formatTime(utt.start)}] Speaker ${utt.speaker}: ${utt.text}`
              : `Speaker ${utt.speaker}: ${utt.text}`;
            const split = doc.splitTextToSize(line, 180);
            addParagraphs(split);
          });
        }
      
        // Add number to last page
        addPageNumber();
      
        doc.save(`${title}.pdf`);
      };      

    return (
        <div className="transcript-box">
            <div className="episode-header">
                <p><strong>Episode name:</strong> {title}</p>
                <p><strong>Duration:</strong> {duration}</p>
                <button onClick={handleDownloadPDF} className="download-btn">
                    Download PDF
                </button>
            </div>
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
        </div>
    );
}