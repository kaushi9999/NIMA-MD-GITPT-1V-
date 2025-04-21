const { bot } = require("../command");

const autoReactEmojis = ["🤖", "✅", "🔄", "❤️", "❤️‍🩹", "💔", "🙃"];

const getRandomEmoji = () => autoReactEmojis[Math.floor(Math.random() * autoReactEmojis.length)];

bot.ev.on("messages.upsert", async ({ messages }) => {
  try {
    const msg = messages[0];
    if (!msg || msg.key.fromMe || msg.key.remoteJid !== "status@broadcast") return;

    const emoji = getRandomEmoji();
    await bot.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } });

  } catch (error) {
    console.error("Auto-react error:", error);
  }
});
