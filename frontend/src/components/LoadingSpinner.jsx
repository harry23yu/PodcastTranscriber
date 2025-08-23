// export default function LoadingSpinner() {
//     return <p>Transcribing…</p>;
//   }

function estimateTranscriptionTime(durationMinutes) {
  return Math.ceil(durationMinutes / 12);
}

export default function LoadingSpinner({ durationMinutes }) {
  const estimated = estimateTranscriptionTime(durationMinutes);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <div className="spinner"></div>
      <p style={{ marginTop: "10px" }}>Transcription in progress...</p>
      <p>
        Total estimated time to finish transcription: {estimated} minute
        {estimated > 1 ? "s" : ""}
      </p>
    </div>
  );
}

// https://open.spotify.com/episode/7Lvhpb6snRNQerlKUqH2Ca
// Length: 2h 54m, time it took to transcribe (TTT): 15m, 32s

// https://open.spotify.com/episode/4EwO4QdR9gC3Omi6UN1cy0
// Length: 1h 21m, TTT: 9m 15s

// https://open.spotify.com/episode/1noXNYyay2bJR1UX41CVJu
// Length: 35m, TTT: 2m 37s

// https://open.spotify.com/episode/3WumrPpx9LMAZwjykGJMUL
// Length: 56m, TTT: 8m 34s

// Ask ChatGPT about assemblyai billing and chunking/utterances ASAP, ads in the transcription, timestamps
// Consider changing gpt-4o-mini to gpt-4o so ads can be removed better