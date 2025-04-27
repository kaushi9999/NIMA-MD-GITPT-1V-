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
            return await reply(`❌ Failed to fetch audio from the API. Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            return await reply(`❌ API failed to download audio. Message: ${data.message || "Unknown error"}`);
        }

        const audioUrl = data.result.download_url;

        // For voice download, fetch voice separately (if available)
        const voiceApiUrl = `https://api.davidcyriltech.my.id/download/ytvoice?url=${encodeURIComponent(videoUrl)}`;
        const voiceResponse = await fetch(voiceApiUrl);

        if (!voiceResponse.ok) {
            return await reply(`❌ Failed to fetch voice from the API. Status: ${voiceResponse.status}`);
        }

        const voiceData = await voiceResponse.json();

        if (!voiceData.success) {
            return await reply(`❌ API failed to download voice. Message: ${voiceData.message || "Unknown error"}`);
        }

        const voiceUrl = voiceData.result.download_url;

        // Send both audio and voice to the user in PTT format
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: true // Send in PTT format
        }, { quoted: mek });

        await conn.sendMessage(from, {
            audio: { url: voiceUrl },
            mimetype: 'audio/mpeg',
            ptt: true // Send in PTT format
        }, { quoted: mek });

        await reply(`✅ *${title}* audio and voice downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
