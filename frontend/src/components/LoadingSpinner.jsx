// export default function LoadingSpinner() {
//     return <p>Transcribing…</p>;
//   }

function estimateTranscriptionTime(durationMinutes) {
  return Math.ceil(durationMinutes / 12);
}

export default function LoadingSpinner({ durationMinutes }) {
  const longerTime = estimateTranscriptionTime(durationMinutes);
  const shorterTime = Math.ceil(longerTime / 5);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <div className="spinner"></div>
      <p style={{ marginTop: "10px" }}>Transcription in progress...</p>
      <p>
        Total estimated time to finish transcription: {shorterTime} minute
        {shorterTime > 1 ? "s" : ""} without ad-cleaning, {longerTime} minute 
        {longerTime > 1 ? "s" : ""} with ad-cleaning.
      </p>
    </div>
  );
}

// https://open.spotify.com/episode/7Lvhpb6snRNQerlKUqH2Ca
// Length: 2h 54m, time it took to transcribe (TTT): 15m, 32s (old, without ads)

// https://open.spotify.com/episode/4EwO4QdR9gC3Omi6UN1cy0
// Length: 1h 21m, TTT: 9m 15s (old, without ads)
// TTT: 1m 1s (with ads), 6m 18s (without ads)

// https://open.spotify.com/episode/1noXNYyay2bJR1UX41CVJu
// Length: 35m, TTT: 2m 37s
/// TTT: 37s (with ads), 3m 1s (without ads)

// https://open.spotify.com/episode/3WumrPpx9LMAZwjykGJMUL
// Length: 56m, TTT: 8m 34s
// TTT: 50s (with ads), 4m 33s (without ads)