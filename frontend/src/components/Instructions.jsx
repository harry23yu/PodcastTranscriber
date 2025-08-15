import "../index.css"

export default function Instructions() {
    return (
        <section className="instructions">
          <h3>How to use this tool:</h3>
          <p>
            1. Paste a Spotify episode (not track) link into the input box.
            <p className="tip">Tip: The URL of a Spotify episode is like this: https://open.spotify.com/episode/episode_ID. Example: https://open.spotify.com/episode/2DBqc0rdKQEr7dKddSjfO8</p>
            2. Click "Submit" to start the transcription process.
            <br></br>
            3. Wait for the transcript to appear below.
          </p>
          <b>Note: Only episodes that are not exclusive to Spotify (i.e., those that can be found on Spotify and other websites like Apple Podcasts) can be transcribed. This is because Spotify's API and Terms and Service doesn't provide the full transcription or MP3 audio.</b>
        </section>
      );
  }