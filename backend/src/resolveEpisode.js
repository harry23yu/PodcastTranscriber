const fetch = require("node-fetch");
const xml2js = require ("xml2js");

/**
 * Resolve Spotify episode URL to MP3 URL (if non-exclusive)
 * @param {string} spotifyEpisodeUrl
 * @param {string} spotifyToken - Spotify API user access token
 * @returns {Promise<{mp3Url: string|null, reason?: string}>}
 */
async function resolveEpisode(spotifyEpisodeUrl, spotifyToken) {
    try {
        console.log("Resolving episode URL:", spotifyEpisodeUrl); // Test line
        console.log("Using Spotify token:", spotifyToken ? "Yes" : "No"); // Test line

        // Extract episode ID from URL
        const match = spotifyEpisodeUrl.match(/episode\/([a-zA-Z0-9]+)/);
        if (!match) {
            return { mp3Url: null, reason: "Invalid Spotify URL" };
        }
        const episodeId = match[1];

        // 1. Get episode metadata from Spotify API
        const spotifyRes = await fetch(`https://api.spotify.com/v1/episodes/${episodeId}`, {
            headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        const episodeData = await spotifyRes.json();

        const showName = episodeData.show.name;
        const episodeTitle = episodeData.name;
        const releaseDate = episodeData.release_date;
        const publisher = episodeData.show.publisher;

        // 2. Search Apple Podcasts API for show
        const appleRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(showName)}&media=podcast`);
        const appleData = await appleRes.json();

        // Find exact match
        const matchShow = appleData.results.find(r =>
            r.collectionName.trim().toLowerCase() === showName.trim().toLowerCase() &&
            r.artistName.trim().toLowerCase() === publisher.trim().toLowerCase()
        );

        if (!matchShow) {
            return { mp3Url: null, reason: "Likely Spotify-exclusive or not found in Apple Podcasts" };
        }

        const feedUrl = matchShow.feedUrl;

        // 3. Fetch RSS feed
        const rssXml = await fetch(feedUrl).then(res => res.text());
        const parser = new xml2js.Parser();
        const rssData = await parser.parseStringPromise(rssXml);

        // 4. Find matching episode in RSS
        const items = rssData.rss.channel[0].item;
        let matchEpisode = items.find(item =>
            item.title[0].trim().toLowerCase() === episodeTitle.trim().toLowerCase()
        );

        if (!matchEpisode) {
            matchEpisode = items.find(item => {
                const pubDate = new Date(item.pubDate[0]);
                return pubDate.toISOString().startsWith(releaseDate);
            });
        }

        if (!matchEpisode) {
            return { mp3Url: null, reason: "Episode not found in RSS feed" };
        }

        const mp3Url = matchEpisode.enclosure[0].$.url;
        return { 
            mp3Url,
            // episodeTitle: data.name, // Spotify's episode title
            episodeTitle,
            releaseDate, // Get date of episode
            publisher // Get creator of episode
            // reason: null
         };

    } catch (err) {
        console.error("Error resolving episode:", err);
        return { mp3Url: null, reason: "Error occurred" };
    }
}

module.exports = { resolveEpisode };