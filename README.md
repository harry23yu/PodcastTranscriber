# Spotify Transcription Project

## API Endpoints
### POST /transcribe
Body:
```json
{
  "spotifyUrl": "https://open.spotify.com/episode/{id}"
}
```
Response:
```json
{
  "status": "processing",
  "transcriptUrl": "/public/transcripts/{id}.pdf"
}
```