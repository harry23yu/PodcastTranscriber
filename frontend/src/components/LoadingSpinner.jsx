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