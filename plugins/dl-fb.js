const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "fb",
  alias: ["facebook", "fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename,
  use: "<Facebook URL>",
}, async (conn, m, store, { from, args, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("*`Need a valid Facebook URL`*\n\nExample: `.fb https://www.facebook.com/...`");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://www.velyn.biz.id/api/downloader/facebookdl?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Debug log to inspect data structure
    console.log("API Response:", data);

    // Improved structure check
    if (!data?.status || !data?.data || !data.data.url === undefined) {
      return reply("❌ Failed to fetch the video. Please try another link.");
    }

    const videoUrl = data.data.url;

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: "📥 *Facebook Video Downloaded*\n\n- Powered By loku nima ✅",
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error?.response?.data || error.message);
    reply("❌ Error fetching the video. Please try again later or check the link.");
  }
});
