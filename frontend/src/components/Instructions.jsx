import "../index.css"

export default function Instructions() {
    return (
        <section className="instructions">
          <h3>How to use this tool:</h3>
            <p>
              <b>Step 1:</b> Paste a Spotify episode (not track) link into the input box.
              <span className="tooltip">
                ⓘ
                <span className="tooltiptext">
                  The URL of a Spotify episode is like this: https://open.spotify.com/episode/episode_ID. Example: https://open.spotify.com/episode/2DBqc0rdKQEr7dKddSjfO8
                </span>
              </span>
              {/* <p className="tip">Tip: The URL of a Spotify episode is like this: https://open.spotify.com/episode/episode_ID. Example: https://open.spotify.com/episode/2DBqc0rdKQEr7dKddSjfO8</p> */}
              <div style={{ marginBottom: '8px' }} />
              <b>Step 2:</b> Choose whether to include profanity and timestamps in the transcript. Hover over ⓘ to learn more. Note: Once you click "Transcribe," you can’t change these settings.
              <div style={{ marginBottom: '8px' }} />
              <b>Step 3:</b> Click "Transcribe" to start the transcription process.
              <div style={{ marginBottom: '8px' }} />
              <b>Step 4:</b> Wait for the transcript to appear below.
              <span className="tooltip">
                ⓘ
                <span className="tooltiptext">
                  This transcriber uses AssemblyAI to transcribe the audio and GPT-4o-mini to remove ads. Since AI isn't perfect, and because of Spotify's dynamic ad insertion, some ads may still show up in the transcript. Also, if your screen is small, you may have to scroll down to see the total estimated time it will take for the transcription to finish and eventually the transcript itself.
                </span>
              </span>
              <div style={{ marginBottom: '8px' }} />
              <b>Step 5:</b> After the transcript has appeared, you can download the transcript as a PDF if you want to.
              <div style={{ marginBottom: '8px' }} />
              <b>Step 6:</b> If you want to transcribe another episode, refresh the page. Make sure to download the PDF from the current episode because everything will be cleared after you refresh the page!
            </p>
          <b><i>Note: Only episodes that are not exclusive to Spotify (i.e., those that can be found on Spotify and other websites like Apple Podcasts) can be transcribed. This is because Spotify's API and Terms and Service doesn't provide the full transcription or MP3 audio.</i></b>
        </section>
      );
  }