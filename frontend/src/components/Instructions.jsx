import "../index.css"
import { Link } from "react-router-dom";

export default function Instructions() {
    return (
        <section className="instructions">
          <h3>How to use this tool:</h3>
            <div>
              <b>Step 1: </b>Paste in your API key(s). <a href="https://www.assemblyai.com/dashboard/api-keys" target="_blank" rel="noopener noreferrer">AssemblyAI</a> is required and <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI</a> is optional. To learn how to get your keys, click <Link to="/KeysInstructions">here</Link>.
              <span className="tooltip">
                ⓘ
                <span className="tooltiptext">
                  This transcriber uses AssemblyAI to do the transcription and OpenAI to remove the baked-in ads from the transcript. If you don't have an OpenAI key (which costs money to use), that is fine, but the ads will show up in the transcript. If you decide to use an OpenAI key, I recommend adding a small amount (up to $5) because using the key is extremely cheap, even for episodes that are about an hour long. You must have an AssemblyAI key; otherwise, the episode won't be able to be transcribed. AssemblyAI provides you $50 of free credits, so you should be able to transcribe many episodes before using it all up.
                </span>
              </span>
              <div style={{ marginBottom: '8px' }} />
              <b>Step 2: </b>Paste a Spotify episode (NOT track) link into the input box.
              <span className="tooltip">
                ⓘ
                <span className="tooltiptext">
                  The URL of a Spotify episode is like this: https://open.spotify.com/episode/episode_ID. Example: https://open.spotify.com/episode/2DBqc0rdKQEr7dKddSjfO8
                </span>
              </span>
              <div style={{ marginBottom: '8px' }} />
              <b>Step 3: </b>Choose whether to include profanity and timestamps in the transcript (can't change after "Transcribe" is clicked). 
              <div style={{ marginBottom: '8px' }} />
              <b>Step 4: </b>Click "Transcribe."
              <div style={{ marginBottom: '8px' }} />
              <b>Step 5: </b>Wait for the transcript to appear.
              <span className="tooltip">
                ⓘ
                <span className="tooltiptext">
                  Since AI isn't perfect, and because of Spotify's dynamic ad insertion, some ads may still show up in the transcript even if a valid OpenAI key is provided. Also, if your screen is small, you may have to scroll down to see the total estimated time it will take for the transcription to finish and eventually the transcript itself.
                </span>
              </span>
              <div style={{ marginBottom: '8px' }} />
              <b>Step 6: </b>Download the transcript as a PDF if you want to.
              <div style={{ marginBottom: '8px' }} />
              <b>Step 7: </b>To transcribe a new episode, refresh the page (your current transcript will be cleared).
            </div>
          <br></br>
          <b><i>Note: Only episodes that are not exclusive to Spotify (i.e., those that can be found on Spotify and other websites like Apple Podcasts) can be transcribed. This is because Spotify's API and Terms and Service doesn't provide the full transcription or MP3 audio.</i></b>
        </section>
      );
  }