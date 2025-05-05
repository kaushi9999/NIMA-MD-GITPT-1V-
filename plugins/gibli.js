const fetch = require("node-fetch");
const { cmd } = require('../command');

cmd({
  pattern: "ghibli",
  desc: "Convert image to Ghibli-style",
  category: "ai",
  use: "reply image with .ghibli",
  filename: __filename,
}, async (conn, mek, m, { reply }) => {
  try {
    if (!mek.quoted || !mek.quoted.mimetype || !mek.quoted.mimetype.startsWith("image/")) {
      return reply("**කරුණාකර පෝටෝ එකකට reply කරලා `.ghibli` කියන්න.**");
    }

    const imageBuffer = await mek.quoted.download();
    const base64Image = imageBuffer.toString("base64");

    const payload = {
      version: "f958f1fcaa1e060c17909b6c72a1fd82e9c24f1835b46bcbe640e1c25437977b", // Ghibli-style model
      input: {
        prompt: "ghibli style",
        image: `data:image/jpeg;base64,${base64Image}`
      }
    };

    const res = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: "r8_AnFKwnYFCLoIe54DjcdXV2YmRDEkO6R10BeAx", // මෙතනට ඔබේ API Key එක privately දාන්න
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return reply("**Ghibli-style image එක generate වෙන්නෙ නැහැ.**");

    const json = await res.json();

    // Wait until finished
    let output;
    for (let i = 0; i < 10; i++) {
      const poll = await fetch(json.urls.get, {
        headers: {
          Authorization: "r8_AnFKwnYFCLoIe54DjcdXV2YmRDEkO6R10BeAx"
        }
      });
      const result = await poll.json();
      if (result.status === "succeeded") {
        output = result.output;
        break;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    if (!output) return reply("**Image generate වෙනකන් timeout උනා.**");

    await conn.sendFile(m.chat, output[0], "ghibli.jpg", "✨ Ghibli-style image එක මෙන්න!", mek);
  } catch (err) {
    console.log(err);
    reply(`❌ Error: ${err.message}`);
  }
});
