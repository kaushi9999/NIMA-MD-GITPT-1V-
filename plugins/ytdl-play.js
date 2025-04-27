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
            if (!videoInfo || !videoInfo.title) return await reply("❌ Video not found!");
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
        const data = await response.json();

        if (!data || !data.success) {
            console.error("API error:", data);
            return await reply("❌ Failed to download audio! Please try again later.");
        }

        const audioUrl = data.result.download_url;

        // For voice download, fetch voice separately (if available)
        const voiceApiUrl = `https://api.davidcyriltech.my.id/download/ytvoice?url=${encodeURIComponent(videoUrl)}`;
        const voiceResponse = await fetch(voiceApiUrl);
        const voiceData = await voiceResponse.json();

        if (!voiceData || !voiceData.success) {
            console.error("Voice API error:", voiceData);
            return await reply("❌ Failed to download voice! Please try again later.");
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
        console.error("Error during execution:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});
