# Spotify Transcription Tool

A browser-based tool for transcribing Spotify podcast episodes using [AssemblyAI](https://www.assemblyai.com/) for speech-to-text and [OpenAI](https://platform.openai.com/) (optional) to remove baked-in ads from transcripts.

## 🚀 Features
- Transcribe any **non-exclusive** Spotify episode
- Optional profanity filter and timestamps
- Download clean, structured transcripts as PDF
- No backend setup required — just paste in your API keys

## 🛠️ Usage
Visit the site and follow the on-page instructions:  
👉 [podcasttranscriber.com](https://podcasttranscriber.com)

You’ll need:
- An AssemblyAI API key (free credits available)
- (Optional) An OpenAI API key to improve transcript quality by removing ads

## ⚠️ Limitations
- Spotify **exclusive** episodes cannot be transcribed (no MP3 access via API)
- Timestamps are approximate and based on audio chunk timing

## ⭐ Feedback
Feel free to star the repo or submit issues if you'd like to improve the tool!

## 🧩 Testing
To run the app locally for testing or development, follow these steps:
- Install [Node](https://nodejs.org/en/download) for your code editor
- In one terminal, go to the frontend folder and type "npm start" to run the frontend
- In another terminal, go to the backend folder and type "node server.js" to run the backend