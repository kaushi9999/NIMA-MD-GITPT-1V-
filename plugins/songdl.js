/*Plugin Author: *NIMA MD* */

const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function extractYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "song",
    alias: ["ytmp3", "ytmp3dl"],
    react: "🎵",
    desc: "Download MP3 from YouTube",
    category: "download",
    use: ".song <text or YouTube URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a search term or YouTube URL!");

        let videoId = q.startsWith("http") ? extractYouTubeID(q) : null;

        if (!videoId) {
            const searchResult = await dy_scrap.ytsearch(q);
            if (!searchResult?.results?.length) return await reply("❌ No results found!");
            videoId = searchResult.results[0].videoId;
        }

        const videoData = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${videoId}`);
        if (!videoData?.results?.length) return await reply("❌ Failed to fetch video details!");

        const { url, title, image, timestamp, ago, views, author } = videoData.results[0];

        const caption = `🎧 *SONG DOWNLOADER - NIMA MD*\n\n` +
            `• *Title:* ${title || "N/A"}\n` +
            `• *Duration:* ${timestamp || "N/A"}\n` +
            `• *Views:* ${views || "N/A"}\n` +
            `• *Published:* ${ago || "N/A"}\n` +
            `• *Channel:* ${author?.name || "N/A"}\n` +
            `• *URL:* ${url}\n\n` +
            `➡️ *Reply with:*\n` +
            `1.1 - Audio (🎵)\n` +
            `1.2 - Document (📁)\n\n` +
            `${config.FOOTER || "Powered by NIMA MD"}`;

        const sent = await conn.sendMessage(from, { image: { url: image }, caption }, { quoted: mek });
        const msgId = sent.key.id;

        const handler = async (update) => {
            try {
                const incoming = update?.messages?.[0];
                if (!incoming?.message || incoming.key.fromMe) return;

                const isReply = (
                    incoming.message?.extendedTextMessage?.contextInfo?.stanzaId === msgId ||
                    incoming.message?.extendedTextMessage?.contextInfo?.quotedMessageId === msgId
                );
                if (!isReply) return;

                const userInput = (incoming.message?.conversation || incoming.message?.extendedTextMessage?.text || "").trim();
                if (!["1.1", "1.2"].includes(userInput)) {
                    await conn.sendMessage(from, { text: "❌ Invalid option! Use 1.1 or 1.2." }, { quoted: incoming });
                    return;
                }

                const waitMsg = await conn.sendMessage(from, { text: "⏳ Processing your request..." }, { quoted: incoming });
                const result = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${videoId}`);
                const downloadUrl = result?.result?.download?.url;

                if (!downloadUrl) {
                    await conn.sendMessage(from, { react: { text: "❌", key: waitMsg.key } });
                    return await reply("❌ Download link not found!");
                }

                if (userInput === "1.1") {
                    await conn.sendMessage(from, {
                        audio: { url: downloadUrl },
                        mimetype: 'audio/mpeg'
                    }, { quoted: incoming });
                } else {
                    await conn.sendMessage(from, {
                        document: { url: downloadUrl },
                        mimetype: 'audio/mpeg',
                        fileName: `${title.slice(0, 50)}.mp3`,
                        caption: title
                    }, { quoted: incoming });
                }

                await conn.sendMessage(from, { text: "✅ File sent successfully!" });
                conn.ev.off("messages.upsert", handler); // remove listener

            } catch (e) {
                console.error("Handler error:", e);
                await reply("❌ Error processing your request.");
                conn.ev.off("messages.upsert", handler);
            }
        };

        conn.ev.on("messages.upsert", handler);

        // Auto-remove listener after 30 seconds
        setTimeout(() => {
            conn.ev.off("messages.upsert", handler);
        }, 30000);

    } catch (err) {
        console.error("Main command error:", err);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ Error: ${err.message || "Something went wrong!"}`);
    }
});
