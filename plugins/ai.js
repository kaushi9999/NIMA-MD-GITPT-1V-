/* 𝐒𝐓𝐀𝐓𝐔𝐒 𝐊𝐈𝐍𝐆 𝐋𝐎𝐊𝐔 𝐍𝐈𝐌𝐀𝐇 */

const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "gpt",
    alias: "ai",
    desc: "Interact with ChatGPT using the Dreaded API.",
    category: "ai",
    react: "🤖",
    use: "<your query>",
    filename: __filename,
}, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        // Validate query
        if (!q || q.trim().length === 0) {
            return reply("⚠️ Please provide a query for ChatGPT.\n\nExample:\n.gpt What is AI?");
        }

        const text = encodeURIComponent(q.trim());
        const url = `https://api.dreaded.site/api/chatgpt?text=${text}`;

        console.log('Requesting:', url);
        await conn.sendPresenceUpdate('composing', from);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
            },
            timeout: 10000
        });

        let gptResponse = "";

        const data = response.data;
        console.log("API RAW:", JSON.stringify(data, null, 2));

        // Clean response extract
        if (typeof data === "string") {
            gptResponse = data;
        } else if (typeof data.result === "string") {
            gptResponse = data.result;
        } else if (data.result?.prompt) {
            gptResponse = data.result.prompt;
        } else if (data.response) {
            gptResponse = data.response;
        } else if (data.answer) {
            gptResponse = data.answer;
        } else if (data.message) {
            gptResponse = data.message;
        }

        // Fallback if still empty
        if (!gptResponse || gptResponse.trim() === "") {
            gptResponse = JSON.stringify(data, null, 2);
        }

        // Final response check
        if (!gptResponse || gptResponse.trim().length < 1) {
            return reply("❌ API did not return a valid response. Try again later.");
        }

        const ALIVE_IMG = 'https://files.catbox.moe/8r95u5.jpg';
        const formatted = `🤖 *ChatGPT Response:*\n\n${gptResponse.trim()}`;

        await conn.sendMessage(from, {
            image: { url: ALIVE_IMG },
            caption: formatted,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363357955960414@newsletter',
                    newsletterName: '𝐍𝐈𝐌𝐀-𝐌𝐃 𝐀𝐈',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("GPT Command Error:", error);

        const errMsg = error.response?.data?.message
            || error.response?.data
            || error.message
            || "Unknown error occurred.";

        const errorMessage = `
❌ *GPT command error occurred!*
🔍 *Details:* ${errMsg}

Please try again later.
        `.trim();

        return reply(errorMessage);
    }
});
