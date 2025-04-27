const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');

cmd({
    pattern: "yt2",
    alias: ["play2", "music"],
    react: "🎵",
    desc: "Download audio and voice from YouTube",
    category: "download",
    use: ".song <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        let videoUrl, title;

        // Check if it's a URL
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            const videoInfo = await yts({ videoId: q.split(/[=/]/).pop() });
            title = videoInfo.title;
        } else {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⏳ Downloading audio and voice...");

        // Use API to get audio
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            return await reply("❌ Failed to fetch audio data from the API. Please check the URL or try again later.");
        }

        const data = await response.json();

        if (!data.success) return await reply("❌ Failed to download audio!");

        const audioUrl = data.result.download_url;

        // For voice download, fetch voice separately (if available)
        const voiceApiUrl = `https://api.davidcyriltech.my.id/download/ytvoice?url=${encodeURIComponent(videoUrl)}`;
        const voiceResponse = await fetch(voiceApiUrl);

        if (!voiceResponse.ok) {
            console.error("Voice API failed with status:", voiceResponse.status);
            return await reply("❌ Voice data not available or failed to fetch. Please try again later.");
        }

        const voiceData = await voiceResponse.json();

        if (!voiceData.success) {
            console.error("Voice API failed with message:", voiceData.message);
            return await reply("❌ Voice data not found for this video.");
        }

        const voiceUrl = voiceData.result.download_url;

        // Send both audio and voice to the user
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await conn.sendMessage(from, {
            audio: { url: voiceUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await reply(`✅ *${title}* audio and voice downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
