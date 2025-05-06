const fetch = require("node-fetch");
const { cmd } = require('../command');

cmd({
  pattern: "gibli",
  desc: "Convert image to Ghibli-style",
  category: "ai",
  use: "reply image with .gibli",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  try {
    const mime = mek.quoted?.mimetype || mek.quoted?.msg?.mimetype || '';
    if (!mime.startsWith('image/')) {
      return reply("**කරුණාකර පෝටෝ එකකට reply කරලා `.gibli` කියන්න.**");
    }

    const imageBuffer = await mek.quoted.download();
    const base64Image = imageBuffer.toString("base64");

    const payload = {
      version: "f958f1fcaa1e060c17909b6c72a1fd82e9c24f1835b46bcbe640e1c25437977b",
      input: {
        prompt: "ghibli style",
        image: `data:image/jpeg;base64,${base64Image}`
      }
    };

    const res = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: "https://n-y5or.onrender.com", // <-- මෙතැන ඔබේ API Key එක දාන්න
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return reply("**Ghibli-style image එක generate වෙන්නෙ නැහැ.**");

    const json = await res.json();

    // Polling for final output
    let output;
    for (let i = 0; i < 10; i++) {
      const poll = await fetch(json.urls.get, {
        headers: {
          Authorization: "https://n-y5or.onrender.com"
        }
      });
      const result = await poll.json();
      if (result.status === "succeeded") {
        output = result.output;
        break;
      }
      await new Promise(r => setTimeout(r, 3000));
    }

    if (!output) return reply("**Image generate වෙන්න Timeout උනා.**");

    await conn.sendFile(m.chat, output[0], "gibli.jpg", "✨ Ghibli-style image එක මෙන්න!", mek);
  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message}`);
  }
});
