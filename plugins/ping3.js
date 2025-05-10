cmd({
    pattern: "ping3",
    react: "📟",
    alias: ["speed", "sonic"],
    desc: "To Check bot's ping",
    category: "main",
    use: '.ping',
    filename: __filename
},
async (conn, mek, m, { from, l, reply }) => {
    try {
        const start = Date.now();
        await conn.sendMessage(from, { text: '*_𝗣𝗜𝗡𝗚 𝗡𝗜𝗠𝗔-𝗠𝗗..._* ❗' });

        const progress = [
            '《 █▒▒▒▒▒▒▒▒▒▒▒》10%',
            '《 ████▒▒▒▒▒▒▒▒》30%',
            '《 ███████▒▒▒▒▒》50%',
            '《 ██████████▒▒》80%',
            '《 ████████████》100%',
        ];

        for (const bar of progress) {
            await sleep(300); // slight delay to simulate loading
            await conn.sendMessage(from, { text: bar });
        }

        const end = Date.now();
        await conn.sendMessage(from, {
            text: `𝗡𝗜𝗠𝗔-𝗠𝗗📍️ *Pong ${end - start} Ms*`
        });

    } catch (e) {
        reply('*Error !!*');
        l(e);
    }
});
